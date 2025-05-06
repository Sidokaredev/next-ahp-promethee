'use server'

import { tablePendaftarColumns, tablePesertaColumns } from "@/src/databases/mysql/define-columns";
import { db } from "@/src/databases/mysql/init";
import { tablePendaftar, tablePengguna, tablePeserta } from "@/src/databases/mysql/schema";
import { and, desc, eq, like, or } from "drizzle-orm";
import { ServerActionResponse } from "../base";

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
}): Promise<ServerActionResponse<{ arr: DataPesertaPeriodeSeleksiType[]; totalData: number; }>> {
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
      response: "data",
      data: {
        arr: dataPeserta,
        totalData: count
      }
    };
  } catch (err) {
    const catchedErr = err as Error;
    console.log("unknown err\t:", err);
    return {
      response: "error",
      name: catchedErr.name,
      message: catchedErr.message,
      cause: catchedErr.cause as string,
    }
  }
}

export async function GetDataAlternatif(options: {
  periodeSeleksiId: number;
  query?: string;
  page?: number;
}): Promise<ServerActionResponse<{
  arr: DataAlternatifType[];
  totalData: number;
}>> {
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
      response: "data",
      data: {
        arr: dataAlternatif,
        totalData: count,
      }
    };
  } catch (err) {
    const catchedErr = err as Error;
    console.log("unknown err\t:", err);
    return {
      response: "error",
      name: catchedErr.name,
      message: catchedErr.message,
      cause: catchedErr.cause as string,
    }
  }
}

export async function UpdateStatusPendaftar(options: {
  id: number,
  status: "diproses" | "diterima";
}): Promise<ServerActionResponse<unknown>> {
  try {
    await db.update(tablePendaftar).set({ status: options.status }).where(eq(tablePendaftar.id, options.id));
    return {
      response: "success",
      name: "administrator:pendaftar@update",
      message: "Berhasil mengubah status pendaftar",
    }
  } catch (err) {
    const catchedErr = err as Error;
    console.log("unknown err\t:", err);
    return {
      response: "error",
      name: catchedErr.name,
      message: catchedErr.message,
      cause: catchedErr.cause as string,
    }
  }
}

export async function GetPendaftarDiterima(periodeSeleksiId: number): Promise<ServerActionResponse<DataAlternatifDiterimaType[]>> {
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

    return {
      response: "data",
      data: pendaftarDiterima
    }
  } catch (err) {
    const catchedErr = err as Error;
    console.log("unknown err\t:", err);
    return {
      response: "error",
      name: catchedErr.name,
      message: catchedErr.message,
      cause: catchedErr.cause as string,
    }
  }
}