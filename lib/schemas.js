import { z } from 'zod';

const urlRegex = /^https?:\/\/.+/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').regex(emailRegex, 'Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .refine(
      (val) => {
        const words = val.trim().split(/\s+/);
        return words.length >= 2 && words.every((w) => w.length >= 2) && /^[A-Za-z\s]+$/.test(val);
      },
      { message: 'Enter your full name (letters only, min 2 characters per word)' }
    ),
  email: z.string().min(1, 'Email is required').regex(emailRegex, 'Invalid email format'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a digit')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain a special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').regex(emailRegex, 'Invalid email format'),
});

export const resetPasswordSchema = z.object({
  otp: z
    .array(z.string())
    .length(6, 'Enter all 6 digits')
    .refine((arr) => arr.every((d) => /^\d$/.test(d)), { message: 'Digits only' }),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a digit')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain a special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const profileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .refine(
      (val) => {
        const words = val.trim().split(/\s+/);
        return words.length >= 2 && words.every((w) => w.length >= 2) && /^[A-Za-z\s]+$/.test(val);
      },
      { message: 'Enter your full name (letters only, min 2 characters per word)' }
    ),
  dept: z.string().optional(),
  code: z.string().optional(),
});

export const securitySchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[0-9]/, 'Must contain a digit')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain a special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const socialLinksSchema = z.object({
  github: z.string().regex(urlRegex, 'Enter a valid URL (https://...)').optional().or(z.literal('')),
  linkedin: z.string().regex(urlRegex, 'Enter a valid URL (https://...)').optional().or(z.literal('')),
  instagram: z.string().regex(urlRegex, 'Enter a valid URL (https://...)').optional().or(z.literal('')),
  facebook: z.string().regex(urlRegex, 'Enter a valid URL (https://...)').optional().or(z.literal('')),
});

function formatErrors(errors) {
  const map = {};
  for (const issue of errors) {
    const path = issue.path.join('.');
    if (!map[path]) map[path] = [];
    map[path].push(issue.message);
  }
  const first = errors[0];
  return {
    fields: map,
    message: first ? (map[first.path.join('.')] || [first.message])[0] : 'Validation failed',
  };
}

export function validate(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) return { valid: true, data: result.data, errors: { fields: {} } };
  return { valid: false, data: null, errors: formatErrors(result.error.issues) };
}
