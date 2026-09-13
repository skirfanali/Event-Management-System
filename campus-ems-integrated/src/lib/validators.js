import { z } from 'zod';

export const loginSchema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name:            z.string().min(2, 'Name must be at least 2 characters'),
  email:           z.string().email('Invalid email'),
  password:        z.string().min(8, 'Password must be at least 8 characters')
                     .regex(/[A-Z]/, 'Must contain uppercase').regex(/[0-9]/, 'Must contain number'),
  confirmPassword: z.string(),
  role:            z.enum(['USER', 'ORGANIZER']).default('USER'),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
});

export const resetPasswordSchema = z.object({
  password:        z.string().min(8),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export const eventSchema = z.object({
  title:       z.string().min(3, 'Title too short').max(100),
  description: z.string().min(20, 'Description too short'),
  category:    z.string().min(1, 'Select a category'),
  date:        z.string().min(1, 'Date is required'),
  time:        z.string().min(1, 'Time is required'),
  endDate:     z.string().optional(),
  venue:       z.string().min(3, 'Venue is required'),
  capacity:    z.number().min(1).max(100000),
  price:       z.number().min(0),
  isFree:      z.boolean().default(false),
  tags:        z.array(z.string()).optional(),
});

export const reviewSchema = z.object({
  rating:  z.number().min(1, 'Rating required').max(5),
  comment: z.string().min(10, 'Comment too short').max(500),
});

export const profileSchema = z.object({
  name:  z.string().min(2),
  phone: z.string().optional(),
  bio:   z.string().max(250).optional(),
  college: z.string().optional(),
  year:    z.string().optional(),
});
