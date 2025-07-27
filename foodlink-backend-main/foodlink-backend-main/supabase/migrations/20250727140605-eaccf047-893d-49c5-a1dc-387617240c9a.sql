-- Create user types and donation status enums
CREATE TYPE user_type AS ENUM ('donor', 'recipient', 'volunteer', 'admin');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE donation_status AS ENUM ('available', 'claimed', 'picked_up', 'delivered', 'expired', 'cancelled');
CREATE TYPE food_category AS ENUM ('fresh_produce', 'dairy', 'bakery', 'cooked_meals', 'canned_goods', 'grains', 'beverages', 'frozen', 'other');
CREATE TYPE task_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');
CREATE TYPE priority_level AS ENUM ('low', 'normal', 'high', 'urgent');

-- Update user_profiles table for NourishSA
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS user_type user_type DEFAULT 'recipient';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS verification_status verification_status DEFAULT 'pending';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS availability_schedule JSONB;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS volunteer_rating DECIMAL(3, 2) DEFAULT 0.0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS total_donations INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS total_meals_provided INTEGER DEFAULT 0;

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    donor_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    food_category food_category NOT NULL,
    quantity VARCHAR(100) NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE,
    pickup_time_start TIMESTAMP WITH TIME ZONE NOT NULL,
    pickup_time_end TIMESTAMP WITH TIME ZONE NOT NULL,
    pickup_address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    images JSONB DEFAULT '[]',
    dietary_info JSONB DEFAULT '{}', -- vegetarian, vegan, halal, kosher, etc
    allergen_info JSONB DEFAULT '[]',
    special_instructions TEXT,
    status donation_status DEFAULT 'available',
    estimated_meals INTEGER,
    claimed_by UUID REFERENCES user_profiles(id),
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create volunteer tasks table
CREATE TABLE IF NOT EXISTS volunteer_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES user_profiles(id),
    task_type VARCHAR(50) NOT NULL, -- 'pickup', 'delivery', 'sorting'
    pickup_location TEXT NOT NULL,
    delivery_location TEXT,
    pickup_latitude DECIMAL(10, 8) NOT NULL,
    pickup_longitude DECIMAL(11, 8) NOT NULL,
    delivery_latitude DECIMAL(10, 8),
    delivery_longitude DECIMAL(11, 8),
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_duration INTEGER, -- minutes
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    status task_status DEFAULT 'pending',
    instructions TEXT,
    completion_notes TEXT,
    points_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create food hubs table
CREATE TABLE IF NOT EXISTS food_hubs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    operating_hours JSONB NOT NULL, -- {mon: "9:00-17:00", tue: "9:00-17:00", etc}
    capacity_kg INTEGER,
    current_inventory_kg INTEGER DEFAULT 0,
    verification_status verification_status DEFAULT 'pending',
    managed_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create conversations table for messaging
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    donation_id UUID REFERENCES donations(id),
    task_id UUID REFERENCES volunteer_tasks(id),
    participants UUID[] NOT NULL, -- array of user IDs
    subject VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES user_profiles(id),
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'location', 'system'
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create volunteer rewards table
CREATE TABLE IF NOT EXISTS volunteer_rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    volunteer_id UUID NOT NULL REFERENCES user_profiles(id),
    points_earned INTEGER NOT NULL,
    reward_type VARCHAR(100) NOT NULL, -- 'task_completion', 'milestone', 'bonus'
    description TEXT,
    task_id UUID REFERENCES volunteer_tasks(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create standard indexes for performance (without geospatial ones for now)
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_expiry ON donations(expiry_date);
CREATE INDEX IF NOT EXISTS idx_donations_category ON donations(food_category);
CREATE INDEX IF NOT EXISTS idx_donations_latitude ON donations(latitude);
CREATE INDEX IF NOT EXISTS idx_donations_longitude ON donations(longitude);
CREATE INDEX IF NOT EXISTS idx_volunteer_tasks_status ON volunteer_tasks(status);
CREATE INDEX IF NOT EXISTS idx_volunteer_tasks_volunteer ON volunteer_tasks(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_food_hubs_latitude ON food_hubs(latitude);
CREATE INDEX IF NOT EXISTS idx_food_hubs_longitude ON food_hubs(longitude);
CREATE INDEX IF NOT EXISTS idx_user_profiles_type ON user_profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_latitude ON user_profiles(latitude) WHERE latitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_longitude ON user_profiles(longitude) WHERE longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteer_tasks_updated_at BEFORE UPDATE ON volunteer_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_hubs_updated_at BEFORE UPDATE ON food_hubs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for donations
CREATE POLICY "Public can view available donations" ON donations
    FOR SELECT USING (status = 'available');

CREATE POLICY "Donors can manage their donations" ON donations
    FOR ALL USING (auth.uid() = donor_id);

CREATE POLICY "Recipients can view claimed donations" ON donations
    FOR SELECT USING (auth.uid() = claimed_by);

CREATE POLICY "Volunteers can view assigned donations" ON donations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM volunteer_tasks 
            WHERE volunteer_tasks.donation_id = donations.id 
            AND volunteer_tasks.volunteer_id = auth.uid()
        )
    );

-- RLS Policies for volunteer tasks
CREATE POLICY "Volunteers can view their tasks" ON volunteer_tasks
    FOR SELECT USING (volunteer_id = auth.uid());

CREATE POLICY "Volunteers can update their tasks" ON volunteer_tasks
    FOR UPDATE USING (volunteer_id = auth.uid());

CREATE POLICY "System can create tasks" ON volunteer_tasks
    FOR INSERT WITH CHECK (true);

-- RLS Policies for food hubs
CREATE POLICY "Public can view verified hubs" ON food_hubs
    FOR SELECT USING (verification_status = 'verified');

CREATE POLICY "Hub managers can manage their hubs" ON food_hubs
    FOR ALL USING (auth.uid() = managed_by);

-- RLS Policies for conversations
CREATE POLICY "Users can view their conversations" ON conversations
    FOR SELECT USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can update their conversations" ON conversations
    FOR UPDATE USING (auth.uid() = ANY(participants));

-- RLS Policies for messages
CREATE POLICY "Users can view conversation messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = messages.conversation_id 
            AND auth.uid() = ANY(conversations.participants)
        )
    );

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = conversation_id 
            AND auth.uid() = ANY(conversations.participants)
        )
    );

-- RLS Policies for analytics
CREATE POLICY "Users can view their analytics" ON analytics_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create analytics" ON analytics_events
    FOR INSERT WITH CHECK (true);

-- RLS Policies for volunteer rewards
CREATE POLICY "Volunteers can view their rewards" ON volunteer_rewards
    FOR SELECT USING (auth.uid() = volunteer_id);

CREATE POLICY "System can create rewards" ON volunteer_rewards
    FOR INSERT WITH CHECK (true);