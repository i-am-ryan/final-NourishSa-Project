-- Create storage buckets for NourishSA
INSERT INTO storage.buckets (id, name, public) 
VALUES 
('food-images', 'food-images', true),
('user-avatars', 'user-avatars', true),
('hub-photos', 'hub-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for food images
CREATE POLICY "Anyone can view food images" ON storage.objects
    FOR SELECT USING (bucket_id = 'food-images');

CREATE POLICY "Authenticated users can upload food images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'food-images' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update their own food images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'food-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create storage policies for user avatars
CREATE POLICY "Anyone can view user avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'user-avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'user-avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create storage policies for hub photos
CREATE POLICY "Anyone can view hub photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'hub-photos');

CREATE POLICY "Hub managers can upload hub photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'hub-photos' 
        AND auth.role() = 'authenticated'
    );

-- Fix function search path security issues
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- Add function to calculate distance between coordinates (using Haversine formula)
CREATE OR REPLACE FUNCTION public.calculate_distance(
    lat1 DECIMAL, lon1 DECIMAL, lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    RETURN (
        6371 * acos(
            cos(radians(lat1)) * 
            cos(radians(lat2)) * 
            cos(radians(lon2) - radians(lon1)) + 
            sin(radians(lat1)) * 
            sin(radians(lat2))
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER SET search_path = '';

-- Function to find nearby donations
CREATE OR REPLACE FUNCTION public.find_nearby_donations(
    user_latitude DECIMAL, 
    user_longitude DECIMAL, 
    radius_km DECIMAL DEFAULT 10
) RETURNS TABLE (
    id UUID,
    title VARCHAR,
    food_category food_category,
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.title,
        d.food_category,
        public.calculate_distance(user_latitude, user_longitude, d.latitude, d.longitude) as distance_km
    FROM donations d
    WHERE d.status = 'available'
    AND public.calculate_distance(user_latitude, user_longitude, d.latitude, d.longitude) <= radius_km
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to match volunteers with tasks
CREATE OR REPLACE FUNCTION public.match_volunteer_with_tasks(
    volunteer_lat DECIMAL,
    volunteer_lon DECIMAL,
    max_distance_km DECIMAL DEFAULT 15
) RETURNS TABLE (
    task_id UUID,
    donation_title VARCHAR,
    distance_km DECIMAL,
    points_potential INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vt.id as task_id,
        d.title as donation_title,
        public.calculate_distance(volunteer_lat, volunteer_lon, vt.pickup_latitude, vt.pickup_longitude) as distance_km,
        (10 + EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - d.created_at))/3600)::INTEGER as points_potential
    FROM volunteer_tasks vt
    JOIN donations d ON vt.donation_id = d.id
    WHERE vt.status = 'pending'
    AND vt.volunteer_id IS NULL
    AND public.calculate_distance(volunteer_lat, volunteer_lon, vt.pickup_latitude, vt.pickup_longitude) <= max_distance_km
    ORDER BY distance_km, points_potential DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';