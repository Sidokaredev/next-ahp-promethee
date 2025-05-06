import { File } from "node:buffer";
import { z } from "zod";

/**
 * Type
 */
export type DaftarPeriodeSeleksiValuesType = z.infer<typeof DaftarPeriodeSeleksiSchema>;
/**
 * Schema
 */
export const DaftarPeriodeSeleksiSchema = z.object({
  indek_prestasi_kumulatif: z.string().min(4, { message: "Gunakan format 3.xx dengan angka valid" }).max(4, { message: "Gunakan format 3.xx dengan angka valid" }).refine(val => {
    const validNumber = !isNaN(Number(val));
    const lessThanEqual = Number(val) <= 4;

    return validNumber && lessThanEqual;
  }, {
    message: "IPK harus berupa angka valid dengan format (3.xx)"
  }),
  semester: z.number().positive({
    message: "Harus berupa angka valid lebih besar dari 0"
  }),
  // sp_universitas: z.instanceof(File, { message: "Pilih file terlebih dahulu" }).refine(file => {
  //   const maxSize = file.size <= 1024 * 1024;
  //   return maxSize;
  // }, { message: "File harus kurang dari 1MB" }),
  // sp_bakesbangpol_provinsi: z.instanceof(File, { message: "Pilih file terlebih dahulu" }).refine(file => {
  //   const maxSize = file.size <= 1024 * 1024;
  //   return maxSize;
  // }, { message: "File harus kurang dari 1MB" }),
  // sp_bakesbangpol_daerah: z.instanceof(File, { message: "Pilih file terlebih dahulu" }).refine(file => {
  //   const maxSize = file.size <= 1024 * 1024;
  //   return maxSize;
  // }, { message: "File harus kurang dari 1MB" })
  sp_universitas: z.any().superRefine((file, ctx) => {
    if (file === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "File tidak boleh kosong / undefined",
      });
    } else {
      const asFile = file as File;
      if (asFile.size > 1024 * 1024) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "File harus kurang dari 1MB",
        });
      }
    }
  }),
  sp_bakesbangpol_provinsi: z.any().superRefine((file, ctx) => {
    if (file === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "File tidak boleh kosong / undefined",
      });
    } else {
      const asFile = file as File;
      if (asFile.size > 1024 * 1024) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "File harus kurang dari 1MB",
        });
      }
    }
  }),
  sp_bakesbangpol_daerah: z.any().superRefine((file, ctx) => {
    if (file === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "File tidak boleh kosong / undefined",
      });
    } else {
      const asFile = file as File;
      if (asFile.size > 1024 * 1024) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "File harus kurang dari 1MB",
        });
      }
    }
  })
});