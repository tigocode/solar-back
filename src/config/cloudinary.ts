import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export const uploadBase64Image = async (base64String: string) => {
  try {
    const result = await cloudinary.uploader.upload(base64String, {
      folder: 'solar_evidence', 
      resource_type: 'image',
      timeout: 120000 // <--- AUMENTADO PARA 120 SEGUNDOS (2 Minutos)
    });
    
    return result.secure_url;
  } catch (error) {
    console.error("Erro no upload Cloudinary:", error);
    throw error;
  }
};