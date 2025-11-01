import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export async function uploadImage(file: File | string): Promise<string> {
  try {
    if (typeof file === 'string') {
      // If it's a base64 string
      const result = await cloudinary.uploader.upload(file, {
        folder: 'agrobissau',
      });
      return result.secure_url;
    } else {
      // If it's a File object, convert to base64
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const dataUri = `data:${file.type};base64,${base64}`;
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'agrobissau',
      });
      return result.secure_url;
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

export async function deleteImage(url: string): Promise<void> {
  try {
    // Extraire le public_id depuis l'URL Cloudinary
    // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/agrobissau/filename.jpg
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex((part) => part === 'upload');
    if (uploadIndex === -1) return;

    // Trouver l'index de 'agrobissau' ou prendre les derniers segments
    const agrobissauIndex = urlParts.findIndex((part) => part === 'agrobissau');
    if (agrobissauIndex !== -1) {
      const filename = urlParts
        .slice(agrobissauIndex + 1)
        .join('/')
        .split('.')[0];
      await cloudinary.uploader.destroy(`agrobissau/${filename}`);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    // Ne pas throw pour éviter de bloquer l'application si la suppression échoue
  }
}

