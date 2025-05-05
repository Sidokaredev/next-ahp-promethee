'use server'

import { tablePendaftarColumns, tablePesertaColumns } from "@/src/databases/mysql/define-columns";
import { db } from "@/src/databases/mysql/init";
import { tablePendaftar, tablePengguna, tablePeserta } from "@/src/databases/mysql/schema";
import { and, desc, eq, like, or } from "drizzle-orm";

/**
 * PendaftarType
 */
export type DataPesertaPeriodeSeleksiType = {
  pendaftar: typeof tablePendaftar.$inferSelect;
  peserta: typeof tablePeserta.$inferSelect & {
    email: string;
  }
}
export type DataAlternatifType = {
  id: number;
  nama_lengkap: string;
  universitas: string;
  akreditasi: string;
  jurusan: string;
  semester: number;
  indek_prestasi_kumulatif: string;
}
export type DataAlternatifDiterimaType = DataAlternatifType;
type PendaftarSuccessOps = {
  name: string;
  message: string;
}

/**
 * PendaftarFn
 */
export async function GetDaftarPeserta(options: {
  periodeSeleksiId: number;
  query?: string;
  page?: number;
}): Promise<{ data: DataPesertaPeriodeSeleksiType[]; totalData: number; } | Error> {
  try {
    const offset = options.page ? ((options.page * 10) - 10) : 0;

    const sq = db.select({
      id: tablePendaftar.id,
    })
      .from(tablePendaftar)
      .innerJoin(tablePeserta, eq(tablePendaftar.peserta_id, tablePeserta.id))
      .where(and(
        eq(tablePendaftar.periode_seleksi_id, options.periodeSeleksiId),
        or(
          options.query ? like(tablePeserta.nama_lengkap, `%${options.query}%`) : undefined,
          options.query ? like(tablePeserta.nim, `%${options.query}%`) : undefined,
        )
      )).as("peserta");
    const count = await db.$count(sq);

    const dataPeserta = await db.select({
      pendaftar: {
        ...tablePendaftarColumns
      },
      peserta: {
        ...tablePesertaColumns,
        email: tablePengguna.email
      },
    })
      .from(tablePendaftar)
      .innerJoin(tablePeserta, eq(tablePendaftar.peserta_id, tablePeserta.id))
      .innerJoin(tablePengguna, eq(tablePengguna.id, tablePeserta.pengguna_id))
      .where(and(
        eq(tablePendaftar.periode_seleksi_id, options.periodeSeleksiId),
        or(
          options.query ? like(tablePeserta.nama_lengkap, `%${options.query}%`) : undefined,
          options.query ? like(tablePeserta.nim, `%${options.query}%`) : undefined,
        )
      ))
      .orderBy(desc(tablePendaftar.created_at))
      .limit(10)
      .offset(offset);

    return {
      data: dataPeserta,
      totalData: count,
    };
  } catch (err) {

    console.log("unknown err\t:", err);
    return err as Error;
  }
}

export async function GetDataAlternatif(options: {
  periodeSeleksiId: number;
  query?: string;
  page?: number;
}): Promise<{
  data: DataAlternatifType[];
  totalData: number;
} | Error> {
  try {
    const offset = options.page ? ((10 * options.page) - 10) : 0;

    const sq = db.select({
      id: tablePendaftar.id
    }).from(tablePendaftar)
      .innerJoin(tablePeserta, eq(tablePendaftar.peserta_id, tablePeserta.id))
      .where(and(
        eq(tablePendaftar.periode_seleksi_id, options.periodeSeleksiId),
        or(
          options.query ? like(tablePeserta.nama_lengkap, `%${options.query}%`) : undefined,
          options.query ? like(tablePeserta.nim, `%${options.query}%`) : undefined,
        )
      )).as("alternatif");
    const count = await db.$count(sq);

    const dataAlternatif = await db.select({
      id: tablePendaftar.id,
      nama_lengkap: tablePeserta.nama_lengkap,
      universitas: tablePeserta.universitas,
      akreditasi: tablePeserta.akreditasi,
      jurusan: tablePeserta.jurusan,
      semester: tablePendaftar.semester,
      indek_prestasi_kumulatif: tablePendaftar.indek_prestasi_kumulatif,
    })
      .from(tablePendaftar)
      .innerJoin(tablePeserta, eq(tablePendaftar.peserta_id, tablePeserta.id))
      .orderBy(desc(tablePendaftar.created_at))
      .where(and(
        eq(tablePendaftar.periode_seleksi_id, options.periodeSeleksiId),
        or(
          options.query ? like(tablePeserta.nama_lengkap, `%${options.query}%`) : undefined,
          options.query ? like(tablePeserta.nim, `%${options.query}%`) : undefined,
        )
      ))
      .limit(10)
      .offset(offset);

    if (dataAlternatif.length == 0) {
      const err = new Error("Data alternatif belum tersedia, tidak ada peserta yang terdaftar", {
        cause: "Tidak terdapat peserta yang terdaftar pada periode seleksi"
      });
      err.name = "Data tidak ditemukan"
    }

    return {
      data: dataAlternatif,
      totalData: count,
    };
  } catch (err) {
    console.log("unknown err\t:", err);
    return err as Error;
  }
}

export async function UpdateStatusPendaftar(options: {
  id: number,
  status: "diproses" | "diterima";
}): Promise<PendaftarSuccessOps | Error> {
  try {
    await db.update(tablePendaftar).set({ status: options.status }).where(eq(tablePendaftar.id, options.id));
    return {
      name: "administrator:pendaftar@update",
      message: "Berhasil mengubah status pendaftar",
    }
  } catch (err) {
    console.log("unknown err\t:", err);
    return err as Error;
  }
}

export async function GetPendaftarDiterima(periodeSeleksiId: number): Promise<DataAlternatifDiterimaType[] | Error> {
  try {
    const pendaftarDiterima = await db.select({
      id: tablePendaftar.id,
      nama_lengkap: tablePeserta.nama_lengkap,
      universitas: tablePeserta.universitas,
      akreditasi: tablePeserta.akreditasi,
      jurusan: tablePeserta.jurusan,
      semester: tablePendaftar.semester,
      indek_prestasi_kumulatif: tablePendaftar.indek_prestasi_kumulatif,
    })
      .from(tablePendaftar)
      .innerJoin(tablePeserta, eq(tablePendaftar.peserta_id, tablePeserta.id))
      .where(and(
        eq(tablePendaftar.periode_seleksi_id, periodeSeleksiId),
        eq(tablePendaftar.status, "diterima"),
      ))
      .orderBy(desc(tablePendaftar.created_at));

    return pendaftarDiterima;
  } catch (err) {
    console.log("unknown err\t:", err);
    return err as Error;
  }
}