import { z } from 'zod';

export const MasukSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid!" }),
  password: z.string().min(6, { message: "Kata sandi minimum 6 karakter!" })
});

export const DaftarSchema = z.object({
  nama_lengkap: z.string().email({ message: "Format email tidak valid!" }),
  nim: z.string().min(6, { message: "Kata sandi minimum 6 karakter!" }),
  universitas: z.string().min(6, { message: "Kata sandi minimum 6 karakter!" }),
  jurusan: z.string().min(6, { message: "Kata sandi minimum 6 karakter!" }),
  email: z.string().min(6, { message: "Kata sandi minimum 6 karakter!" }),
  no_telepon: z.string().min(6, { message: "Kata sandi minimum 6 karakter!" }),
  password: z.string().min(6, { message: "Kata sandi minimum 6 karakter!" }),
  confirm_password: z.string().min(6, { message: "Kata sandi minimum 6 karakter!" }),
});