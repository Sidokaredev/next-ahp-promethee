'use server';

import { db } from "@/src/databases/mysql/init";
import { tableDokumen, tablePendaftar, tablePeriodeSeleksi } from "@/src/databases/mysql/schema";
import { and, desc, eq, gte, like, not, sql } from "drizzle-orm";
import * as jose from "jose";
import { DaftarPeriodeSeleksiValuesType } from "./zod-schema";
import { cookies } from "next/headers";
import { TokenPayload } from "../accounts/auth";
/**
 * Type
 */
export type PeriodeSeleksiSukses = {
  name: string;
  message: string;
}
export type StatusTerdaftarType = {
  pendaftar: typeof tablePendaftar.$inferSelect;
  periode_seleksi: typeof tablePeriodeSeleksi.$inferSelect;
}
/**
 * PeriodeSeleksiFn
 */
export async function GetPeriodeSeleksi(): Promise<typeof tablePeriodeSeleksi.$inferSelect[] | Error> {
  try {
    const dataPeriodeSeleksi = await db.select()
      .from(tablePeriodeSeleksi)
      .where(and(
        gte(tablePeriodeSeleksi.batas_pendaftaran, new Date()),
        not(eq(tablePeriodeSeleksi.status, "selesai"))
      ))
      .orderBy(desc(tablePeriodeSeleksi.created_at))
      .limit(10);

    return dataPeriodeSeleksi;
  } catch (err) {
    if (err instanceof Error) {
      return err;
    }

    console.log("unknown err\t:", err);
    return err as Error;
  }
}

export async function AddPendaftarPeriodeSeleksi(periodeSeleksiId: number, data: DaftarPeriodeSeleksiValuesType): Promise<PeriodeSeleksiSukses | Error> {
  const cookieStore = await cookies();
  const token = cookieStore.get("enc-cre");
  if (!token) {
    const err = new Error(
      "Sesi anda pada sistem telah habis, silahkan masuk kembali",
      { cause: "token pengguna tidak ditemukan" }
    );
    err.name = "token invalid";

    return err;
  }

  const secretToken = new Uint8Array(Buffer.from(process.env.SECRET_TOKEN!, "base64"));
  try {
    const { payload } = await jose.jwtDecrypt(token.value, secretToken);
    const { ID } = payload as TokenPayload;

    await db.transaction(async (tx) => {
      // insert@sp_universitas
      const arrayBuffer_sp_universitas = await data.sp_universitas.arrayBuffer();
      const spUniversitas = await tx.insert(tableDokumen).values({
        tujuan_dokumen: "Surat Pengantar Perguruan Tinggi",
        origin_name: data.sp_universitas.name,
        mime_type: data.sp_universitas.type,
        size: data.sp_universitas.size,
        blob: Buffer.from(arrayBuffer_sp_universitas),
      }).$returningId();
      // insert@sp_bakesbangpol_provinsi
      const arrayBuffer_sp_bakesbangpol_provinsi = await data.sp_bakesbangpol_provinsi.arrayBuffer();
      const spBakesBangpolProvinsi = await tx.insert(tableDokumen).values({
        tujuan_dokumen: "Surat Pengantar Bakesbangpol Provinsi",
        origin_name: data.sp_bakesbangpol_provinsi.name,
        mime_type: data.sp_bakesbangpol_provinsi.type,
        size: data.sp_bakesbangpol_provinsi.size,
        blob: Buffer.from(arrayBuffer_sp_bakesbangpol_provinsi),
      }).$returningId();
      // insert@sp_bakesbangpol_daerah
      const arrayBuffer_sp_bakesbangpol_daerah = await data.sp_bakesbangpol_daerah.arrayBuffer();
      const spBakesbangpolDaerah = await tx.insert(tableDokumen).values({
        tujuan_dokumen: "Surat Pengantar Bakesbangpol Daerah",
        origin_name: data.sp_bakesbangpol_daerah.name,
        mime_type: data.sp_bakesbangpol_daerah.type,
        size: data.sp_bakesbangpol_daerah.size,
        blob: Buffer.from(arrayBuffer_sp_bakesbangpol_daerah)
      }).$returningId();
      // insert@pendaftar
      await tx.insert(tablePendaftar).values({
        indek_prestasi_kumulatif: data.indek_prestasi_kumulatif,
        semester: data.semester,
        status: "diproses",
        periode_seleksi_id: periodeSeleksiId,
        peserta_id: ID,
        sp_universitas_id: spUniversitas[0].id,
        sp_bakesbangpol_provinsi_id: spBakesBangpolProvinsi[0].id,
        sp_bakesbangpol_daerah_id: spBakesbangpolDaerah[0].id,
      })
      // update@periode-seleksi:[total_pendaftar]
      await tx.update(tablePeriodeSeleksi).set({
        total_pendaftar: sql`${tablePeriodeSeleksi.total_pendaftar} + 1`,
      }).where(eq(tablePeriodeSeleksi.id, periodeSeleksiId));
    });

    return {
      name: "peserta:periode-seleksi@daftar",
      message: "Berhasil mendaftar periode seleksi"
    }
  } catch (err) {

    console.log("unknown err \t:", err);
    return err as Error;
  }
}

export async function GetTerdaftarPeriodeSeleksi(): Promise<number[] | Error> {
  const cookieStore = await cookies();
  const token = cookieStore.get("enc-cre");
  if (!token) {
    const err = new Error(
      "Sesi anda pada sistem telah habis, silahkan masuk kembali",
      { cause: "token pengguna tidak ditemukan" }
    );
    err.name = "token invalid";

    return err;
  }

  const secretToken = new Uint8Array(Buffer.from(process.env.SECRET_TOKEN!, "base64"));
  try {
    const { payload } = await jose.jwtDecrypt(token.value, secretToken);
    const { ID } = payload as TokenPayload;
    const terdaftarPeriodeSeleksi = await db.select({
      periode_seleksi_id: tablePendaftar.periode_seleksi_id
    })
      .from(tablePendaftar)
      .where(eq(tablePendaftar.peserta_id, ID));

    return terdaftarPeriodeSeleksi.map((terdaftar) => {
      return terdaftar.periode_seleksi_id
    })
  } catch (err) {

    console.log("unknown err\t:", err);
    return err as Error;
  }
}

export async function GetDataStatusTerdaftar(options: {
  query?: string;
  page?: number;
} = {}): Promise<StatusTerdaftarType[] | Error> {
  const cookieStore = await cookies();
  const token = cookieStore.get("enc-cre");
  if (!token) {
    const err = new Error(
      "Sesi anda pada sistem telah habis, silahkan masuk kembali",
      { cause: "token pengguna tidak ditemukan" }
    );
    err.name = "token invalid";

    return err;
  }

  const secretToken = new Uint8Array(Buffer.from(process.env.SECRET_TOKEN!, "base64"));
  try {
    const { payload } = await jose.jwtDecrypt(token.value, secretToken);
    const { ID } = payload as TokenPayload;

    const offset = options.page ? (options.page * 10 - 10) : 0;
    const dataTerdaftarPeriodeSeleksi = await db.select()
      .from(tablePendaftar)
      .innerJoin(tablePeriodeSeleksi, eq(tablePendaftar.periode_seleksi_id, tablePeriodeSeleksi.id))
      .where(and(
        eq(tablePendaftar.peserta_id, ID),
        options.query ? like(tablePeriodeSeleksi.nama, `%${options.query}%`) : undefined
      ))
      .orderBy(desc(tablePendaftar.created_at))
      .limit(10)
      .offset(offset);

    return dataTerdaftarPeriodeSeleksi;
  } catch (err) {

    console.log("unknown err \t:", err);
    return err as Error;
  }
}