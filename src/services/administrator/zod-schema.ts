import { z } from "zod";

/**
 * Type
 */
export type PeriodeSeleksiValuesType = z.infer<typeof PeriodeSeleksiSchema>;
/**
 * Schema
 */
export const PeriodeSeleksiSchema = z.object({
  nama: z.string().min(3),
  deskripsi: z.string().optional(),
  tanggal_dibuka: z.date(),
  batas_pendaftaran: z.date(),
});