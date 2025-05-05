'use server';

import { PeriodeSeleksiValuesType } from "./zod-schema";
import { db } from "@/src/databases/mysql/init";
import { tablePeriodeSeleksi } from "@/src/databases/mysql/schema";
import { SuccessMessage } from "../base";
import { and, desc, eq, like } from "drizzle-orm";

/**
 * Type
 */
export type PeriodeSeleksiType = typeof tablePeriodeSeleksi.$inferSelect;
export type PeriodeSeleksiDetailType = {
  data: typeof tablePeriodeSeleksi.$inferSelect[];
  info: {
    query: string;
    offset: number;
    page: number;
    count: number;
  }
}
/**
 * PeriodeSeleksiFn
 */
// periode-seleksi@create
export async function AddPeriodeSeleksi(data: PeriodeSeleksiValuesType): Promise<SuccessMessage | Error> {
  try {
    await db.insert(tablePeriodeSeleksi).values({
      nama: data.nama,
      deskripsi: data.deskripsi,
      tanggal_dibuka: data.tanggal_dibuka,
      batas_pendaftaran: data.batas_pendaftaran,
    });

    return {
      name: "administrator:periode-seleksi@insert",
      message: "Berhasil menambahkan periode seleksi."
    }
  } catch (err) {
    if (err instanceof Error) {
      return err;
    }

    console.log("unknown err\t:", err);
    return err as Error;
  }
}
// periode-seleksi@read
export async function GetPeriodeSeleksi(options: {
  primaryKey?: number;
  query?: string;
  page?: number;
} = {
    page: 1
  }): Promise<PeriodeSeleksiDetailType | Error> {
  try {
    const countPeriodeSeleksi: Promise<number> = db.$count(
      tablePeriodeSeleksi,
      options.query ? like(tablePeriodeSeleksi.nama, `%${options.query}%`) : undefined
    );

    const limit = options.primaryKey ? 1 : 10;
    const offset = options.page ? ((limit * options.page) - limit) : (0);

    const dataPeriodeSeleksi: Promise<typeof tablePeriodeSeleksi.$inferSelect[]> = db
      .select()
      .from(tablePeriodeSeleksi)
      .where(
        and(
          options.primaryKey ? eq(tablePeriodeSeleksi.id, options.primaryKey) : undefined,
          options.query ? like(tablePeriodeSeleksi.nama, `%${options.query}%`) : undefined
        )
      )
      .orderBy(desc(tablePeriodeSeleksi.created_at))
      .limit(limit)
      .offset(offset);

    const [count, data] = await Promise.all([countPeriodeSeleksi, dataPeriodeSeleksi]);
    return {
      data,
      info: {
        query: options.query ? options.query : "",
        offset: offset,
        page: options.page ? options.page : 1,
        count: count,
      }
    };
  } catch (err) {
    if (err instanceof Error) {
      return err;
    }

    console.log("unknown err\t:", err);
    return err as Error;
  }
}
// periode-seleksi@change
export async function ChangePeriodeSeleksi(id: number, data: PeriodeSeleksiValuesType): Promise<SuccessMessage | Error> {
  try {
    await db.update(tablePeriodeSeleksi)
      .set({ ...data, updated_at: new Date() })
      .where(eq(tablePeriodeSeleksi.id, id));

    return {
      name: "administrator:periode-seleksi@change",
      message: "Berhasil mengubah data periode seleksi"
    }
  } catch (err) {
    if (err instanceof Error) {
      return err;
    }

    console.log("unknown err\t:", err);
    return err as Error;
  }
}