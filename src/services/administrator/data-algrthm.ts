'use server'

import { db } from "@/src/databases/mysql/init"
import { tableBobotKriteria, tableFungsiPreferensi, tableKriteria, tablePendaftar, tablePeserta, tableSkalaPerbandingan } from "@/src/databases/mysql/schema"
import { and, desc, eq } from "drizzle-orm";
import { PrometheeInit, PrometheeUnstable } from "../promethee-algrthm/draft-main";
import { prometheeInitKeyFn } from "./constants";

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
export async function GetKriteria(): Promise<KriteriaType[] | Error> {
  try {
    const dataKriteria = await db.select({ id: tableKriteria.id, nama: tableKriteria.nama }).from(tableKriteria);
    return dataKriteria;
  } catch (err) {

    console.log("unknown err\t:", err);
    return err as Error;
  }
}

export async function GetSkalaPerbandingan(periodeSeleksiId: number): Promise<Record<string, SkalaPerbandinganType> | Error> {
  try {
    const dataSkalaPerbandingan = await db.select({
      id: tableSkalaPerbandingan.id,
      matrix_ref: tableSkalaPerbandingan.matrix_ref,
      nilai: tableSkalaPerbandingan.nilai,
    }).from(tableSkalaPerbandingan).where(eq(tableSkalaPerbandingan.periode_seleksi_id, periodeSeleksiId));

    if (dataSkalaPerbandingan.length == 0) {
      /*
      const kriteria = await db.select().from(tableKriteria);
      if (kriteria.length == 0) {
        const err = new Error("Data kriteria tidak tersedia, input data kriteria terlebih dahulu", {
          cause: "data tidak tersedia"
        });
        err.name = "Data kriteria tidak tersedia";

        return err;
      }
      */

      /*
      const scaleMatrix = new AHP({
        criteria: kriteria.map(data => {
          return data.nama;
        })
      }).PairwiseComparisonFields();

      return scaleMatrix.reduce((previous, current) => {
        current.forEach(matrixRef => {
          previous[matrixRef] = 0
        });

        return previous;
      }, {} as Record<string, number>);
      */

      // kasih Error aja lah yaw:)
      const err = new Error("Data skala perbandingan berpasangan tidak ditemukan", {
        cause: "[skala-perbandingan] tidak ditemukan",
      });
      err.name = "Data tidak ditemukan";

      return err;
    }

    /**
     * Step
     * 1. Get Kriteria :: string[]
     * 2. Get Skala Perbandingan :: string[][]
     * 3. Hitung total skala perbandingan :: string[]
     * 4. Hitung Normalisasi :: string[][]
     * 5. Hitung Konsistensi Rasio :: 
     */

    // console.log("pairwise \t:", dataSkalaPerbandingan.map(data => data.nilai));

    return dataSkalaPerbandingan.reduce((previous, current) => {
      previous[current.matrix_ref] = current;
      return previous;
    }, {} as Record<string, SkalaPerbandinganType>);
  } catch (err) {
    console.log("unknown err\t:", err);
    return err as Error;
  }
}

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
    console.log("unknown err\t:", err);
    return err as Error;
  }
}

export async function AddSkalaPerbandingan(periodeSeleksiId: number, skalaPerbandinganBerpasangan: Record<string, string>): Promise<DataAlgorithmSuccess | Error> {
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
      name: "administrator:skala-perbandingan@add",
      message: "Berhasil menambahkan data skala perbandingan"
    }
  } catch (err) {
    console.log("unknown err\t:", err);
    return err as Error;
  }
}

export async function ChangeSkalaPerbandingan(periodeSeleksiId: number, skalaPerbandinganBerpasangan: Record<string, SkalaPerbandinganType>): Promise<DataAlgorithmSuccess | Error> {
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
      name: "administrator:skala-perbandingan@change",
      message: `${allUpdates.length} dari ${updatePromises.length} data berhasil diubah`
    };
  } catch (err) {
    console.log("unknown err\t:", err);
    return err as Error;
  }
}

/* -> Promethee */
export async function GetBobotKriteria(periodeSeleksiId: number): Promise<Record<string, BobotKriteriaType> | Error> {
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
      const err = new Error("Mohon untuk mendefinisikan bobot kriteria terlebih dahulu", {
        cause: "bobot kriteria tidak tersedia"
      });
      err.name = "Bobot kriteria tidak terdefinisi"

      return err;
    }
    return dataBobotKriteria.reduce((previous, current) => {
      previous[current.nama_kriteria] = {
        id: current.id,
        kriteria_id: current.kriteria_id,
        nilai: current.nilai
      };
      return previous;
    }, {} as Record<string, BobotKriteriaType>);
  } catch (err) {
    console.log("unknown err\t:", err);
    return err as Error;
  }
}

export async function GetFungsiPreferensi(periodeSeleksiId: number): Promise<Record<string, FungsiKriteriaType> | Error> {
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
      const err = new Error("Mohon untuk mendefinisikan fungsi preferensi kriteria terlebih dahulu", {
        cause: "fungsi preferensi tidak tersedia"
      });
      err.name = "Fungsi preferensi kriteria tidak terdefinisi"

      return err;
    }

    return dataFnPreferensi.reduce((previous, current) => {
      previous[current.nama_kriteria] = {
        id: current.id,
        kriteria_id: current.kriteria_id,
        tipe: current.tipe,
        q: current.q,
        p: current.p,
        s: current.s,
      };
      return previous;
    }, {} as Record<string, FungsiKriteriaType>);
  } catch (err) {
    console.log("unknown err\t:", err);
    return err as Error;
  }
}

export async function AddBobotKriteria(periodeSeleksiId: number, data: Record<string, { kriteria_id: number; nilai: string; }>): Promise<DataAlgorithmSuccess | Error> {
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
      name: "administrator:bobot-kriteria@add",
      message: "Berhasil menambahkan data bobot kriteria",
    }
  } catch (err) {
    console.log("unknown err\t:", err);
    return err as Error;
  }
}

export async function ChangeBobotKriteria(periodeSeleksiId: number, data: Record<string, BobotKriteriaType>): Promise<DataAlgorithmSuccess | Error> {
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
      name: "administrator:bobot-kriteria@change",
      message: "Berhasil mengubah data bobot kriteria"
    }
  } catch (err) {
    console.log("unknown err\t:", err);
    return err as Error;
  }
}

export async function AddFnPreferensi(periodeSeleksiId: number, data: Record<string, {
  kriteria_id: number;
  tipe: string;
  q: string | null;
  p: string | null;
  s: string | null;
}>): Promise<DataAlgorithmSuccess | Error> {
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
      name: "administrator:fungsi-preferensi@add",
      message: "Berhasil menambahkan data fungsi preferensi"
    }
  } catch (err) {
    console.log("unknown err\t:", err);
    return err as Error;
  }
}

export async function ChangeFnPreferensi(periodeSeleksiId: number, data: Record<string, FungsiKriteriaType>): Promise<DataAlgorithmSuccess | Error> {
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
      name: "administrator:fungsi-preferensi@change",
      message: "Berhasil mengubah data fungsi preferensi"
    }
  } catch (err) {
    console.log("unknown err\t:", err);
    return err as Error;
  }
}

export async function GetDifferenceMatrix(periodeSeleksiId: number, options: {
  keyProps: Record<string, string>;
  kategori: Record<string, "maksimasi" | "minimasi">;
  kriteria: string;
}) {
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
      const err = new Error("Anda belum mendefinisikan bobot kriteria, input data terlebih dahulu", { cause: "bobot kriteria tidak terdefinisi" });
      err.name = "bobot kriteria tidak ditemukan";

      return err;
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
      const err = new Error("Anda belum mendefinisikan tipe fungsi preferensi untuk setiap kriteria, input data terlebih dahulu", { cause: "tipe fungsi preferensi tidak terdefinisi" });
      err.name = "tipe fungsi preferensi tidak ditemukan";

      return err;
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
    return prometheeInstance.ScoreDifferenceMatrix()[options.kriteria];
  } catch (err) {
    console.info("unknown err\t:", err);
    return err as Error;
  }
}

export async function GetPreferenceMatrix(periodeSeleksiId: number, options: {
  keyProps: Record<string, string>;
  kategori: Record<string, "maksimasi" | "minimasi">;
  kriteria: string;
}) {
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
      const err = new Error("Anda belum mendefinisikan bobot kriteria, input data terlebih dahulu", { cause: "bobot kriteria tidak terdefinisi" });
      err.name = "bobot kriteria tidak ditemukan";

      return err;
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
      const err = new Error("Anda belum mendefinisikan tipe fungsi preferensi untuk setiap kriteria, input data terlebih dahulu", { cause: "tipe fungsi preferensi tidak terdefinisi" });
      err.name = "tipe fungsi preferensi tidak ditemukan";

      return err;
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
    return prometheeInstance.ScoreFnPreferenceMatrix(prometheeInstance.ScoreDifferenceMatrix())[options.kriteria];
  } catch (err) {
    console.log("unknown err\t:", err);
    return err as Error;
  }
}

export async function GetIndexPreference(periodeSeleksiId: number, options: {
  keyProps: Record<string, string>;
  kategori: Record<string, "maksimasi" | "minimasi">;
}) {
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
      const err = new Error("Anda belum mendefinisikan bobot kriteria, input data terlebih dahulu", { cause: "bobot kriteria tidak terdefinisi" });
      err.name = "bobot kriteria tidak ditemukan";

      return err;
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
      const err = new Error("Anda belum mendefinisikan tipe fungsi preferensi untuk setiap kriteria, input data terlebih dahulu", { cause: "tipe fungsi preferensi tidak terdefinisi" });
      err.name = "tipe fungsi preferensi tidak ditemukan";

      return err;
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
      indek_preferensi: preferenceIndex,
      leaving_flow: leavingFlow,
      entering_flow: enteringFlow,
    };
  } catch (err) {
    console.log("unknown err\t:", err);
    return err as Error;
  }
}

export async function GetNetFlow(periodeSeleksiId: number, options: {
  keyProps: Record<string, string>;
  kategori: Record<string, "maksimasi" | "minimasi">;
}) {
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
      const err = new Error("Anda belum mendefinisikan bobot kriteria, input data terlebih dahulu", { cause: "bobot kriteria tidak terdefinisi" });
      err.name = "bobot kriteria tidak ditemukan";

      return err;
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
      const err = new Error("Anda belum mendefinisikan tipe fungsi preferensi untuk setiap kriteria, input data terlebih dahulu", { cause: "tipe fungsi preferensi tidak terdefinisi" });
      err.name = "tipe fungsi preferensi tidak ditemukan";

      return err;
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
    return prometheeInstance.ScoreNetFlow(leavingFlow, enteringFlow);
  } catch (err) {
    console.log("unknown err\t:", err);
    return err as Error;
  }
}

export async function GetPemeringkatan(periodeSeleksiId: number, options: {
  keyProps: Record<string, string>;
  kategori: Record<string, "maksimasi" | "minimasi">;
}) {
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
      const err = new Error("Anda belum mendefinisikan bobot kriteria, input data terlebih dahulu", { cause: "bobot kriteria tidak terdefinisi" });
      err.name = "bobot kriteria tidak ditemukan";

      return err;
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
      const err = new Error("Anda belum mendefinisikan tipe fungsi preferensi untuk setiap kriteria, input data terlebih dahulu", { cause: "tipe fungsi preferensi tidak terdefinisi" });
      err.name = "tipe fungsi preferensi tidak ditemukan";

      return err;
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

    return rankedAlternatif;
  } catch (err) {
    console.log("unknown err\t:", err);
    return err as Error;
  }
}