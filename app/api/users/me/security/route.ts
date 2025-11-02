import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const securityUpdateSchema = z.object({
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
  newPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = securityUpdateSchema.parse(body);

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    // OAuth users don't have passwords
    if (!user.password) {
      return NextResponse.json(
        { error: 'Les utilisateurs OAuth ne peuvent pas changer de mot de passe' },
        { status: 400 }
      );
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      validatedData.currentPassword,
      user.password
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Mot de passe actuel incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating password:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du mot de passe' },
      { status: 500 }
    );
  }
}

