import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, { message: 'Name must be at least 2 characters' }).max(100),
  email: z.string().trim().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email({ message: 'Please enter a valid email address' }),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const addressSchema = z.object({
  full_name: z.string().trim().min(2, { message: 'Name is required' }).max(100),
  phone: z.string().trim().min(10, { message: 'Valid phone number is required' }).max(15),
  address_line_1: z.string().trim().min(5, { message: 'Address is required' }).max(200),
  address_line_2: z.string().optional(),
  city: z.string().trim().min(2, { message: 'City is required' }).max(100),
  state: z.string().trim().min(2, { message: 'State is required' }).max(100),
  pincode: z.string().trim().min(6, { message: 'Valid pincode is required' }).max(10),
  is_default: z.boolean().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().trim().min(10, { message: 'Review must be at least 10 characters' }).max(1000),
});

export const couponSchema = z.object({
  code: z.string().trim().min(3).max(20).toUpperCase(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type CouponFormData = z.infer<typeof couponSchema>;
