import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export const listingSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  price: z.number().positive('Le prix doit être positif'),
  unit: z.string().min(1, 'L\'unité est requise'),
  quantity: z.number().int().positive('La quantité doit être un nombre positif'),
  categoryId: z.string().min(1, 'La catégorie est requise'),
  subcategory: z.string().optional(),
  type: z.enum(['SELL', 'BUY']),
  availableFrom: z.date().optional(),
  expiresAt: z.date().optional(),
  images: z.array(z.string()).min(1, 'Au moins une image est requise'),
  location: z.object({
    city: z.string().min(1, 'La ville est requise'),
    region: z.string().optional(),
    address: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, 'Le commentaire doit contenir au moins 10 caractères').optional(),
  reviewedId: z.string().min(1, 'L\'ID de l\'utilisateur évalué est requis'),
  listingId: z.string().optional(),
});

export const messageSchema = z.object({
  content: z.string().min(1, 'Le message ne peut pas être vide'),
  receiverId: z.string(),
  listingId: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ListingInput = z.infer<typeof listingSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type MessageInput = z.infer<typeof messageSchema>;

