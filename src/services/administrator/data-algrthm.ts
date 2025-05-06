'use server'

import { db } from "@/src/databases/mysql/init"
import { tableBobotKriteria, tableFungsiPreferensi, tableKriteria, tablePendaftar, tablePeserta, tableSkalaPerbandingan } from "@/src/databases/mysql/schema"
import { and, desc, eq } from "drizzle-orm";
import { EnteringFlowType, IndexPreferenceMatrix, LeavingFlowType, NetFlowType, PrometheeInit, PrometheeUnstable, RowMatrixType } from "../promethee-algrthm/draft-main";
import { prometheeInitKeyFn } from "./constants";
import { ServerActionResponse } from "../base";

/**
 * Type
 */
export type DataAlgorithmSuccess = {
  name: string;
  message: string;
}
export type KriteriaType = {
  id: number;
  nama: string;
}
export type SkalaPerbandinganType = {
  id: number;
  matrix_ref: string;
  nilai: string;
}
export type BobotKriteriaType = {
  id: number;
  kriteria_id: number;
  nilai: string;
}
export type FungsiKriteriaType = {
  id: number;
  kriteria_id: number;
  tipe: string;
  q: string | null;
  p: string | null;
  s: string | null;
}
export type RankingAlternatifType = {
  id: number;
  nama_lengkap: string;
  universitas: string;
  akreditasi: string;
  jurusan: string;
  semester: number;
  indek_prestasi_kumulatif: string;
  net_flow: number;
}

/**
 * DataAlgorithmFn
 */

/* -> AHP */
export async function GetKriteria(): Promise<ServerActionResponse<KriteriaType[]>> {
  try {
    const dataKriteria = await db.select({ id: tableKriteria.id, nama: tableKriteria.nama }).from(tableKriteria);
    return {
      response: 'data',
      data: dataKriteria,
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

export async function GetSkalaPerbandingan(periodeSeleksiId: number): Promise<ServerActionResponse<Record<string, SkalaPerbandinganType>>> {
  try {
    const dataSkalaPerbandingan = await db.select({
      id: tableSkalaPerbandingan.id,
      matrix_ref: tableSkalaPerbandingan.matrix_ref,
      nilai: tableSkalaPerbandingan.nilai,
    }).from(tableSkalaPerbandingan).where(eq(tableSkalaPerbandingan.periode_seleksi_id, periodeSeleksiId));

    if (dataSkalaPerbandingan.length == 0) {
      return {
        response: "error",
        name: "Data tidak ditemukan",
        message: "Data skala perbandingan berpasangan tidak ditemukan",
        cause: "[skala-perbandingan] tidak ditemukan"
      }
    }

    return {
      response: 'data',
      data: dataSkalaPerbandingan.reduce((previous, current) => {
        previous[current.matrix_ref] = current;
        return previous;
      }, {} as Record<string, SkalaPerbandinganType>),
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

// PROBABLY UNUSED
export async function ValidasiKriteriaAHP(periodeSeleksiId: number) {
  try {
    const kriteria = await db.select().from(tableKriteria);
    if (kriteria.length == 0) {
      const err = new Error("Data kriteria belum ditambahkan, tambahkan terlebih dahulu", {
        cause: "data kriteria tidak ditemukan"
      });
      err.name = "Data tidak ditemukan";

      return err;
    }

    const skalaPerbandingan = await db.select({
      id: tableSkalaPerbandingan.id,
      matrix_ref: tableSkalaPerbandingan.matrix_ref,
      nilai: tableSkalaPerbandingan.nilai,
    }).from(tableSkalaPerbandingan).where(eq(tableSkalaPerbandingan.periode_seleksi_id, periodeSeleksiId));
    if (skalaPerbandingan.length == 0) {
      const err = new Error("Anda belum menambahkan data skala perbandingan berpasangan, tambahkan terlebih dahulu", {
        cause: "data skala perbandingan berpasangan tidak ditemukan"
      });
      err.name = "Data tidak ditemukan";

      return err;
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

export async function AddSkalaPerbandingan(periodeSeleksiId: number, skalaPerbandinganBerpasangan: Record<string, string>): Promise<ServerActionResponse<unknown>> {
  const values = Object.entries(skalaPerbandinganBerpasangan).map(([key, value]) => {
    return {
      periode_seleksi_id: periodeSeleksiId,
      matrix_ref: key,
      nilai: value,
    }
  });

  try {
    await db.insert(tableSkalaPerbandingan).values(values);

    return {
      response: "success",
      name: "administrator:skala-perbandingan@add",
      message: "Berhasil menambahkan data skala perbandingan"
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

export async function ChangeSkalaPerbandingan(periodeSeleksiId: number, skalaPerbandinganBerpasangan: Record<string, SkalaPerbandinganType>): Promise<ServerActionResponse<unknown>> {
  const updatedValues = Object.entries(skalaPerbandinganBerpasangan).map(([key, value]) => {
    return value;
  });
  const updatePromises = updatedValues.map(value => {
    return db.update(tableSkalaPerbandingan).set({ nilai: value.nilai }).where(
      and(
        eq(tableSkalaPerbandingan.id, value.id),
        eq(tableSkalaPerbandingan.periode_seleksi_id, periodeSeleksiId)
      )
    )
  });

  try {
    const allUpdates = await Promise.all(updatePromises);
    return {
      response: "success",
      name: "administrator:skala-perbandingan@change",
      message: `${allUpdates.length} dari ${updatePromises.length} data berhasil diubah`
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

/* -> Promethee */
export async function GetBobotKriteria(periodeSeleksiId: number): Promise<ServerActionResponse<Record<string, BobotKriteriaType>>> {
  try {
    const dataBobotKriteria = await db.select({
      id: tableBobotKriteria.id,
      nama_kriteria: tableKriteria.nama,
      kriteria_id: tableKriteria.id,
      nilai: tableBobotKriteria.nilai,
    })
      .from(tableBobotKriteria)
      .innerJoin(tableKriteria, eq(tableBobotKriteria.kriteria_id, tableKriteria.id))
      .where(eq(tableBobotKriteria.periode_seleksi_id, periodeSeleksiId));

    if (dataBobotKriteria.length == 0) {
      return {
        response: "error",
        name: "Bobot kriteria tidak terdefinisi",
        message: "Mohon untuk mendefinisikan bobot kriteria terlebih dahulu",
        cause: "Bobot kriteria tidak tersedia"
      }
    }
    return {
      response: 'data',
      data: dataBobotKriteria.reduce((previous, current) => {
        previous[current.nama_kriteria] = {
          id: current.id,
          kriteria_id: current.kriteria_id,
          nilai: current.nilai
        };
        return previous;
      }, {} as Record<string, BobotKriteriaType>),
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

export async function GetFungsiPreferensi(periodeSeleksiId: number): Promise<ServerActionResponse<Record<string, FungsiKriteriaType>>> {
  try {
    const dataFnPreferensi = await db.select({
      id: tableFungsiPreferensi.id,
      nama_kriteria: tableKriteria.nama,
      kriteria_id: tableKriteria.id,
      tipe: tableFungsiPreferensi.tipe,
      q: tableFungsiPreferensi.q,
      p: tableFungsiPreferensi.p,
      s: tableFungsiPreferensi.s,
    })
      .from(tableFungsiPreferensi)
      .innerJoin(tableKriteria, eq(tableFungsiPreferensi.kriteria_id, tableKriteria.id))
      .where(eq(tableFungsiPreferensi.periode_seleksi_id, periodeSeleksiId));

    if (dataFnPreferensi.length == 0) {
      return {
        response: "error",
        name: "Fungsi preferensi kriteria tidak terdefinisi",
        message: "Mohon untuk mendefinisikan fungsi preferensi kriteria terlebih dahulu",
        cause: "Fungsi preferensi tidak tersedia"
      }
    }

    return {
      response: "data",
      data: dataFnPreferensi.reduce((previous, current) => {
        previous[current.nama_kriteria] = {
          id: current.id,
          kriteria_id: current.kriteria_id,
          tipe: current.tipe,
          q: current.q,
          p: current.p,
          s: current.s,
        };
        return previous;
      }, {} as Record<string, FungsiKriteriaType>),
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

export async function AddBobotKriteria(periodeSeleksiId: number, data: Record<string, { kriteria_id: number; nilai: string; }>): Promise<ServerActionResponse<unknown>> {
  try {
    const valuesToBeInserted = Object.entries(data).map(([_, value]) => {
      return {
        nilai: value.nilai,
        kriteria_id: value.kriteria_id,
        periode_seleksi_id: periodeSeleksiId
      }
    })
    await db.insert(tableBobotKriteria).values(valuesToBeInserted);

    return {
      response: "success",
      name: "administrator:bobot-kriteria@add",
      message: "Berhasil menambahkan data bobot kriteria",
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

export async function ChangeBobotKriteria(periodeSeleksiId: number, data: Record<string, BobotKriteriaType>): Promise<ServerActionResponse<unknown>> {
  try {
    const updateInPromises = Object.entries(data).map(([_, value]) => {
      return db.update(tableBobotKriteria)
        .set({ nilai: value.nilai })
        .where(and(
          eq(tableBobotKriteria.id, value.id),
          eq(tableBobotKriteria.kriteria_id, value.kriteria_id),
          eq(tableBobotKriteria.periode_seleksi_id, periodeSeleksiId),
        ))
    });

    await Promise.all(updateInPromises);

    return {
      response: "success",
      name: "administrator:bobot-kriteria@change",
      message: "Berhasil mengubah data bobot kriteria"
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

export async function AddFnPreferensi(periodeSeleksiId: number, data: Record<string, {
  kriteria_id: number;
  tipe: string;
  q: string | null;
  p: string | null;
  s: string | null;
}>): Promise<ServerActionResponse<unknown>> {
  try {
    const valuesToBeInserted = Object.entries(data).map(([_, value]) => {
      return {
        tipe: value.tipe,
        kriteria_id: value.kriteria_id,
        periode_seleksi_id: periodeSeleksiId,
        q: value.q,
        p: value.p,
        s: value.s,
      }
    });

    await db.insert(tableFungsiPreferensi).values(valuesToBeInserted);

    return {
      response: "success",
      name: "administrator:fungsi-preferensi@add",
      message: "Berhasil menambahkan data fungsi preferensi"
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

export async function ChangeFnPreferensi(periodeSeleksiId: number, data: Record<string, FungsiKriteriaType>): Promise<ServerActionResponse<unknown>> {
  try {
    const updateInPromises = Object.entries(data).map(([_, value]) => {
      return db.update(tableFungsiPreferensi).set({
        tipe: value.tipe,
        q: value.q,
        p: value.p,
        s: value.s,
      }).where(and(
        eq(tableFungsiPreferensi.id, value.id),
        eq(tableFungsiPreferensi.kriteria_id, value.kriteria_id),
        eq(tableFungsiPreferensi.periode_seleksi_id, periodeSeleksiId),
      ));
    });

    await Promise.all(updateInPromises);
    return {
      response: "success",
      name: "administrator:fungsi-preferensi@change",
      message: "Berhasil mengubah data fungsi preferensi"
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

export async function GetDifferenceMatrix(periodeSeleksiId: number, options: {
  keyProps: Record<string, string>;
  kategori: Record<string, "maksimasi" | "minimasi">;
  kriteria: string;
}): Promise<ServerActionResponse<RowMatrixType[]>> {
  try {
    const bobotKriteria = await db.select({
      id: tableBobotKriteria.id,
      nilai: tableBobotKriteria.nilai,
      nama_kriteria: tableKriteria.nama,
    })
      .from(tableBobotKriteria)
      .innerJoin(tableKriteria, eq(tableBobotKriteria.kriteria_id, tableKriteria.id))
      .where(eq(tableBobotKriteria.periode_seleksi_id, periodeSeleksiId));

    if (bobotKriteria.length == 0) {
      return {
        response: "error",
        name: "Bobot kriteria tidak ditemukan",
        message: "Anda belum mendefinisikan bobot kriteria, input data terlebih dahulu",
        cause: "Bobot kriteria tidak terdefinisi"
      }
    }

    const fnPreferensi = await db.select({
      id: tableFungsiPreferensi.id,
      tipe: tableFungsiPreferensi.tipe,
      q: tableFungsiPreferensi.q,
      p: tableFungsiPreferensi.p,
      s: tableFungsiPreferensi.s,
      nama_kriteria: tableKriteria.nama,
    })
      .from(tableFungsiPreferensi)
      .innerJoin(tableKriteria, eq(tableFungsiPreferensi.kriteria_id, tableKriteria.id))
      .where(eq(tableFungsiPreferensi.periode_seleksi_id, periodeSeleksiId));

    if (fnPreferensi.length == 0) {
      return {
        response: "error",
        name: "Tipe fungsi preferensi tidak ditemukan",
        message: "Anda belum mendefinisikan tipe fungsi preferensi untuk setiap kriteria, input data terlebih dahulu",
        cause: "Tipe fungsi preferensi tidak terdefinisi"
      }
    }

    const alternatif = await db.select({
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
      .where(eq(tablePendaftar.periode_seleksi_id, periodeSeleksiId));

    const bobotKriteriaRecord = bobotKriteria.reduce((prev, curr) => {
      prev[curr.nama_kriteria] = {
        id: curr.id,
        nilai: curr.nilai,
      }
      return prev;
    }, {} as Record<string, { id: number, nilai: string; }>);
    const fnPreferensiRecord = fnPreferensi.reduce((prev, curr) => {
      prev[curr.nama_kriteria] = {
        id: curr.id,
        tipe: curr.tipe,
        q: curr.q,
        p: curr.p,
        s: curr.s,
      }
      return prev;
    }, {} as Record<string, {
      id: number,
      tipe: string,
      q: string | null,
      p: string | null,
      s: string | null,
    }>);

    const prometheeInit: PrometheeInit[] = bobotKriteria.map((data, _) => {
      const key = data.nama_kriteria;

      return {
        namaKriteria: key,
        keyProp: options.keyProps[key],
        // keyFn: options.keyFn[key],
        keyFn: prometheeInitKeyFn[key],
        kategori: options.kategori[key],
        tipeFnPreferensi: fnPreferensiRecord[key],
        weight: Number(bobotKriteriaRecord[key]["nilai"]),
      }
    });
    const prometheeInstance = new PrometheeUnstable(alternatif, prometheeInit);
    return {
      response: "data",
      data: prometheeInstance.ScoreDifferenceMatrix()[options.kriteria],
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

export async function GetPreferenceMatrix(periodeSeleksiId: number, options: {
  keyProps: Record<string, string>;
  kategori: Record<string, "maksimasi" | "minimasi">;
  kriteria: string;
}): Promise<ServerActionResponse<RowMatrixType[]>> {
  try {
    const bobotKriteria = await db.select({
      id: tableBobotKriteria.id,
      nilai: tableBobotKriteria.nilai,
      nama_kriteria: tableKriteria.nama,
    })
      .from(tableBobotKriteria)
      .innerJoin(tableKriteria, eq(tableBobotKriteria.kriteria_id, tableKriteria.id))
      .where(eq(tableBobotKriteria.periode_seleksi_id, periodeSeleksiId));

    if (bobotKriteria.length == 0) {
      return {
        response: "error",
        name: "Bobot kriteria tidak ditemukan",
        message: "Anda belum mendefinisikan bobot kriteria, input data terlebih dahulu",
        cause: "Bobot kriteria tidak terdefinisi"
      }
    }

    const fnPreferensi = await db.select({
      id: tableFungsiPreferensi.id,
      tipe: tableFungsiPreferensi.tipe,
      q: tableFungsiPreferensi.q,
      p: tableFungsiPreferensi.p,
      s: tableFungsiPreferensi.s,
      nama_kriteria: tableKriteria.nama,
    })
      .from(tableFungsiPreferensi)
      .innerJoin(tableKriteria, eq(tableFungsiPreferensi.kriteria_id, tableKriteria.id))
      .where(eq(tableFungsiPreferensi.periode_seleksi_id, periodeSeleksiId));

    if (fnPreferensi.length == 0) {
      return {
        response: "error",
        name: "Tipe fungsi preferensi tidak ditemukan",
        message: "Anda belum mendefinisikan tipe fungsi preferensi untuk setiap kriteria, input data terlebih dahulu",
        cause: "Tipe fungsi preferensi tidak terdefinisi"
      }
    }

    const alternatif = await db.select({
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
      .where(eq(tablePendaftar.periode_seleksi_id, periodeSeleksiId));

    const bobotKriteriaRecord = bobotKriteria.reduce((prev, curr) => {
      prev[curr.nama_kriteria] = {
        id: curr.id,
        nilai: curr.nilai,
      }
      return prev;
    }, {} as Record<string, { id: number, nilai: string; }>);
    const fnPreferensiRecord = fnPreferensi.reduce((prev, curr) => {
      prev[curr.nama_kriteria] = {
        id: curr.id,
        tipe: curr.tipe,
        q: curr.q,
        p: curr.p,
        s: curr.s,
      }
      return prev;
    }, {} as Record<string, {
      id: number,
      tipe: string,
      q: string | null,
      p: string | null,
      s: string | null,
    }>);

    const prometheeInit: PrometheeInit[] = bobotKriteria.map((data, _) => {
      const key = data.nama_kriteria;

      return {
        namaKriteria: key,
        keyProp: options.keyProps[key],
        // keyFn: options.keyFn[key],
        keyFn: prometheeInitKeyFn[key],
        kategori: options.kategori[key],
        tipeFnPreferensi: fnPreferensiRecord[key],
        weight: Number(bobotKriteriaRecord[key]["nilai"]),
      }
    });
    const prometheeInstance = new PrometheeUnstable(alternatif, prometheeInit);
    return {
      response: "data",
      data: prometheeInstance.ScoreFnPreferenceMatrix(prometheeInstance.ScoreDifferenceMatrix())[options.kriteria],
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

export async function GetIndexPreference(periodeSeleksiId: number, options: {
  keyProps: Record<string, string>;
  kategori: Record<string, "maksimasi" | "minimasi">;
}): Promise<ServerActionResponse<{
  indek_preferensi: IndexPreferenceMatrix,
  leaving_flow: LeavingFlowType,
  entering_flow: EnteringFlowType,
}>> {
  try {
    const bobotKriteria = await db.select({
      id: tableBobotKriteria.id,
      nilai: tableBobotKriteria.nilai,
      nama_kriteria: tableKriteria.nama,
    })
      .from(tableBobotKriteria)
      .innerJoin(tableKriteria, eq(tableBobotKriteria.kriteria_id, tableKriteria.id))
      .where(eq(tableBobotKriteria.periode_seleksi_id, periodeSeleksiId));

    if (bobotKriteria.length == 0) {
      return {
        response: "error",
        name: "Bobot kriteria tidak ditemukan",
        message: "Anda belum mendefinisikan bobot kriteria, input data terlebih dahulu",
        cause: "Bobot kriteria tidak terdefinisi"
      }
    }

    const fnPreferensi = await db.select({
      id: tableFungsiPreferensi.id,
      tipe: tableFungsiPreferensi.tipe,
      q: tableFungsiPreferensi.q,
      p: tableFungsiPreferensi.p,
      s: tableFungsiPreferensi.s,
      nama_kriteria: tableKriteria.nama,
    })
      .from(tableFungsiPreferensi)
      .innerJoin(tableKriteria, eq(tableFungsiPreferensi.kriteria_id, tableKriteria.id))
      .where(eq(tableFungsiPreferensi.periode_seleksi_id, periodeSeleksiId));

    if (fnPreferensi.length == 0) {
      return {
        response: "error",
        name: "Tipe fungsi preferensi tidak ditemukan",
        message: "Anda belum mendefinisikan tipe fungsi preferensi untuk setiap kriteria, input data terlebih dahulu",
        cause: "Tipe fungsi preferensi tidak terdefinisi"
      }
    }

    const alternatif = await db.select({
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
      .where(eq(tablePendaftar.periode_seleksi_id, periodeSeleksiId));

    const bobotKriteriaRecord = bobotKriteria.reduce((prev, curr) => {
      prev[curr.nama_kriteria] = {
        id: curr.id,
        nilai: curr.nilai,
      }
      return prev;
    }, {} as Record<string, { id: number, nilai: string; }>);
    const fnPreferensiRecord = fnPreferensi.reduce((prev, curr) => {
      prev[curr.nama_kriteria] = {
        id: curr.id,
        tipe: curr.tipe,
        q: curr.q,
        p: curr.p,
        s: curr.s,
      }
      return prev;
    }, {} as Record<string, {
      id: number,
      tipe: string,
      q: string | null,
      p: string | null,
      s: string | null,
    }>);

    const prometheeInit: PrometheeInit[] = bobotKriteria.map((data, idx) => {
      const key = data.nama_kriteria;

      return {
        namaKriteria: key,
        keyProp: options.keyProps[key],
        // keyFn: options.keyFn[key],
        keyFn: prometheeInitKeyFn[key],
        kategori: options.kategori[key],
        tipeFnPreferensi: fnPreferensiRecord[key],
        weight: Number(bobotKriteriaRecord[key]["nilai"]),
      }
    });
    const prometheeInstance = new PrometheeUnstable(alternatif, prometheeInit);
    const preferenceMatrix = prometheeInstance.ScoreFnPreferenceMatrix(prometheeInstance.ScoreDifferenceMatrix());
    const preferenceIndex = prometheeInstance.ScorePreferenceIndex(preferenceMatrix);
    const leavingFlow = prometheeInstance.ScoreLeavingFlow(preferenceIndex);
    const enteringFlow = prometheeInstance.ScoreEnteringFlow(preferenceIndex);
    return {
      response: "data",
      data: {
        indek_preferensi: preferenceIndex,
        leaving_flow: leavingFlow,
        entering_flow: enteringFlow,
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

export async function GetNetFlow(periodeSeleksiId: number, options: {
  keyProps: Record<string, string>;
  kategori: Record<string, "maksimasi" | "minimasi">;
}): Promise<ServerActionResponse<NetFlowType>> {
  try {
    const bobotKriteria = await db.select({
      id: tableBobotKriteria.id,
      nilai: tableBobotKriteria.nilai,
      nama_kriteria: tableKriteria.nama,
    })
      .from(tableBobotKriteria)
      .innerJoin(tableKriteria, eq(tableBobotKriteria.kriteria_id, tableKriteria.id))
      .where(eq(tableBobotKriteria.periode_seleksi_id, periodeSeleksiId));

    if (bobotKriteria.length == 0) {
      return {
        response: "error",
        name: "Bobot kriteria tidak ditemukan",
        message: "Anda belum mendefinisikan bobot kriteria, input data terlebih dahulu",
        cause: "Bobot kriteria tidak terdefinisi"
      }
    }

    const fnPreferensi = await db.select({
      id: tableFungsiPreferensi.id,
      tipe: tableFungsiPreferensi.tipe,
      q: tableFungsiPreferensi.q,
      p: tableFungsiPreferensi.p,
      s: tableFungsiPreferensi.s,
      nama_kriteria: tableKriteria.nama,
    })
      .from(tableFungsiPreferensi)
      .innerJoin(tableKriteria, eq(tableFungsiPreferensi.kriteria_id, tableKriteria.id))
      .where(eq(tableFungsiPreferensi.periode_seleksi_id, periodeSeleksiId));

    if (fnPreferensi.length == 0) {
      return {
        response: "error",
        name: "Tipe fungsi preferensi tidak ditemukan",
        message: "Anda belum mendefinisikan tipe fungsi preferensi untuk setiap kriteria, input data terlebih dahulu",
        cause: "Tipe fungsi preferensi tidak terdefinisi"
      }
    }

    const alternatif = await db.select({
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
      .where(eq(tablePendaftar.periode_seleksi_id, periodeSeleksiId));

    const bobotKriteriaRecord = bobotKriteria.reduce((prev, curr) => {
      prev[curr.nama_kriteria] = {
        id: curr.id,
        nilai: curr.nilai,
      }
      return prev;
    }, {} as Record<string, { id: number, nilai: string; }>);
    const fnPreferensiRecord = fnPreferensi.reduce((prev, curr) => {
      prev[curr.nama_kriteria] = {
        id: curr.id,
        tipe: curr.tipe,
        q: curr.q,
        p: curr.p,
        s: curr.s,
      }
      return prev;
    }, {} as Record<string, {
      id: number,
      tipe: string,
      q: string | null,
      p: string | null,
      s: string | null,
    }>);

    const prometheeInit: PrometheeInit[] = bobotKriteria.map((data, _) => {
      const key = data.nama_kriteria;

      return {
        namaKriteria: key,
        keyProp: options.keyProps[key],
        // keyFn: options.keyFn[key],
        keyFn: prometheeInitKeyFn[key],
        kategori: options.kategori[key],
        tipeFnPreferensi: fnPreferensiRecord[key],
        weight: Number(bobotKriteriaRecord[key]["nilai"]),
      }
    });
    const prometheeInstance = new PrometheeUnstable(alternatif, prometheeInit);
    const preferenceMatrix = prometheeInstance.ScoreFnPreferenceMatrix(prometheeInstance.ScoreDifferenceMatrix());
    const preferenceIndex = prometheeInstance.ScorePreferenceIndex(preferenceMatrix);
    const leavingFlow = prometheeInstance.ScoreLeavingFlow(preferenceIndex);
    const enteringFlow = prometheeInstance.ScoreEnteringFlow(preferenceIndex);
    return {
      response: "data",
      data: prometheeInstance.ScoreNetFlow(leavingFlow, enteringFlow),
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

export async function GetPemeringkatan(periodeSeleksiId: number, options: {
  keyProps: Record<string, string>;
  kategori: Record<string, "maksimasi" | "minimasi">;
}): Promise<ServerActionResponse<RankingAlternatifType[]>> {
  try {
    const bobotKriteria = await db.select({
      id: tableBobotKriteria.id,
      nilai: tableBobotKriteria.nilai,
      nama_kriteria: tableKriteria.nama,
    })
      .from(tableBobotKriteria)
      .innerJoin(tableKriteria, eq(tableBobotKriteria.kriteria_id, tableKriteria.id))
      .where(eq(tableBobotKriteria.periode_seleksi_id, periodeSeleksiId));

    if (bobotKriteria.length == 0) {
      return {
        response: "error",
        name: "Bobot kriteria tidak ditemukan",
        message: "Anda belum mendefinisikan bobot kriteria, input data terlebih dahulu",
        cause: "Bobot kriteria tidak terdefinisi"
      }
    }

    const fnPreferensi = await db.select({
      id: tableFungsiPreferensi.id,
      tipe: tableFungsiPreferensi.tipe,
      q: tableFungsiPreferensi.q,
      p: tableFungsiPreferensi.p,
      s: tableFungsiPreferensi.s,
      nama_kriteria: tableKriteria.nama,
    })
      .from(tableFungsiPreferensi)
      .innerJoin(tableKriteria, eq(tableFungsiPreferensi.kriteria_id, tableKriteria.id))
      .where(eq(tableFungsiPreferensi.periode_seleksi_id, periodeSeleksiId));

    if (fnPreferensi.length == 0) {
      return {
        response: "error",
        name: "Tipe fungsi preferensi tidak ditemukan",
        message: "Anda belum mendefinisikan tipe fungsi preferensi untuk setiap kriteria, input data terlebih dahulu",
        cause: "Tipe fungsi preferensi tidak terdefinisi"
      }
    }

    const alternatif = await db.select({
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
      .where(eq(tablePendaftar.periode_seleksi_id, periodeSeleksiId));

    const bobotKriteriaRecord = bobotKriteria.reduce((prev, curr) => {
      prev[curr.nama_kriteria] = {
        id: curr.id,
        nilai: curr.nilai,
      }
      return prev;
    }, {} as Record<string, { id: number, nilai: string; }>);
    const fnPreferensiRecord = fnPreferensi.reduce((prev, curr) => {
      prev[curr.nama_kriteria] = {
        id: curr.id,
        tipe: curr.tipe,
        q: curr.q,
        p: curr.p,
        s: curr.s,
      }
      return prev;
    }, {} as Record<string, {
      id: number,
      tipe: string,
      q: string | null,
      p: string | null,
      s: string | null,
    }>);

    const prometheeInit: PrometheeInit[] = bobotKriteria.map((data, _) => {
      const key = data.nama_kriteria;

      return {
        namaKriteria: key,
        keyProp: options.keyProps[key],
        // keyFn: options.keyFn[key],
        keyFn: prometheeInitKeyFn[key],
        kategori: options.kategori[key],
        tipeFnPreferensi: fnPreferensiRecord[key],
        weight: Number(bobotKriteriaRecord[key]["nilai"]),
      }
    });
    const prometheeInstance = new PrometheeUnstable(alternatif, prometheeInit);
    const preferenceMatrix = prometheeInstance.ScoreFnPreferenceMatrix(prometheeInstance.ScoreDifferenceMatrix());
    const preferenceIndex = prometheeInstance.ScorePreferenceIndex(preferenceMatrix);
    const leavingFlow = prometheeInstance.ScoreLeavingFlow(preferenceIndex);
    const enteringFlow = prometheeInstance.ScoreEnteringFlow(preferenceIndex);
    const netFlow = prometheeInstance.ScoreNetFlow(leavingFlow, enteringFlow).sort((a, b) => b.netFlow - a.netFlow);
    const rankedAlternatif: {
      id: number;
      nama_lengkap: string;
      universitas: string;
      akreditasi: string;
      jurusan: string;
      semester: number;
      indek_prestasi_kumulatif: string;
      net_flow: number;
    }[] = [];
    netFlow.forEach(data => {
      const alt = alternatif.find((alt) => alt.id === data.id);
      if (!alt) {
        throw new Error("cannot founf aternatif with id: " + data.id);
      }
      rankedAlternatif.push({
        ...alt,
        net_flow: data.netFlow,
      })
    });

    return {
      response: "data",
      data: rankedAlternatif
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