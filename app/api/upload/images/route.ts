import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Limiter à 10 images maximum
    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Trop de fichiers. Maximum: 10 images' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    // Valider tous les fichiers
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Format non supporté: ${file.name}. Formats acceptés: JPG, PNG, WEBP` },
          { status: 400 }
        );
      }
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `Fichier trop volumineux: ${file.name}. Taille maximum: 5MB` },
          { status: 400 }
        );
      }
    }

    // Upload tous les fichiers en parallèle
    const uploadPromises = files.map((file) => uploadImage(file));
    const imageUrls = await Promise.all(uploadPromises);

    return NextResponse.json(
      { urls: imageUrls },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error uploading images:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'upload des images' },
      { status: 500 }
    );
  }
}

