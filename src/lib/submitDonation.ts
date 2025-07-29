// lib/submitDonation.ts
import { supabase } from './supabaseClient'

export async function submitDonation(formData: any, user: any) {
  let imageUrl = null;

  // 1. Upload image to Supabase Storage
  if (formData.imageFile) {
    const fileName = `donations/${Date.now()}-${formData.imageFile.name}`;
    const { data, error } = await supabase.storage
      .from('donation-images')
      .upload(fileName, formData.imageFile);

    if (error) {
      console.error('Image upload failed:', error.message);
    } else {
      const { publicUrl } = supabase.storage
        .from('donation-images')
        .getPublicUrl(data.path);
      imageUrl = publicUrl;
    }
  }

  // 2. Insert donation into DB
  const { error: dbError } = await supabase.from('donations').insert({
    user_id: user.id,
    donor_type: formData.donorType,
    business_name: formData.businessName,
    food_type: formData.foodType,
    custom_food_type: formData.customFoodType,
    description: formData.description,
    quantity: formData.quantity,
    unit: formData.unit,
    expiry_date: formData.expiryDate,
    expiry_time: formData.expiryTime,
    image_url: imageUrl
  });

  return dbError;
}
