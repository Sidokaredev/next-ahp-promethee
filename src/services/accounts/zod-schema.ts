import { z } from "zod";

/**
 * Type
 */
export type SignUpValuesType = z.infer<typeof SignUpSchema>;
export type SignInValuesType = z.infer<typeof SignInSchema>;
export type AdmSignUpValuesType = z.infer<typeof AdmSignUpSchema>;
/**
 * Schema
 */
export const SignUpSchema = z.object({
  nama_lengkap: z.string().min(3),
  universitas: z.string().min(10),
  akreditasi: z.enum(["A", "B", "C", "Tidak Terakreditasi"]),
  jurusan: z.string().min(3),
  nim: z.string().min(3),
  nomor_telepon: z.number({ coerce: true }),
  email: z.string().email(),
  password: z.string().min(6),
  confirm_password: z.string().min(6),
}).refine((data) => data.confirm_password === data.password, {
  path: ["confirm_password"],
  message: "konfirmasi password tidak sesuai"
});
export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const AdmSignUpSchema = z.object({
  nama_lengkap: z.string().min(3),
  jabatan: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  confirm_password: z.string().min(6),
}).refine(data => data.confirm_password === data.password, {
  path: ["confirm_password"],
  message: "konfirmasi password tidak sesuai"
});