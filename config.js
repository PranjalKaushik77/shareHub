import dotenv from 'dotenv';
dotenv.config();

const cloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
};

export default cloudinaryConfig;

export const supabaseConfig = {
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_ANON_KEY,
};
