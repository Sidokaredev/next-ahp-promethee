import { z } from "zod";

/**
 * Type
 */
export type PeriodeSeleksiValuesType = z.infer<typeof PeriodeSeleksiSchema>;
export type SkorProgramStudiValuesType = z.infer<typeof SkorProgramStudiSchema>;
/**
 * Schema
 */
export const PeriodeSeleksiSchema = z.object({
  nama: z.string().min(3),
  deskripsi: z.string().optional(),
  tanggal_dibuka: z.date(),
  batas_pendaftaran: z.date(),
});

export const BobotKriteriaSchema = z.object({
  "Akreditasi Perguruan Tinggi": z.string().max(5),
  "Indeks Prestasi Kumulatif (IPK)": z.string().max(5),
  "Jurusan": z.string().max(5),
  "Semester": z.string().max(5)
}).refine(data => {
  let total: number = 0;
  for (const key in data) {
    total += Number(data[key as keyof typeof data])
  }

  return Math.round(total) == 1;
}, {
  path: ["form"],
  message: "Total dari nilai bobot keseluruhan harus == 1"
})

export const SkorProgramStudiSchema = z.object({
  id: z.number().nullable().optional(),
  skor: z.number().gt(0, { message: "nilai 1 - 10" }),
  program_studi_id: z.number().positive({ message: "harap pilih program studi terlebih dahulu" }),
})