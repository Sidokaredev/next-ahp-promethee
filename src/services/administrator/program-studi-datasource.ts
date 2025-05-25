'use server'

import { db } from "@/src/databases/mysql/init";
import { tableProgramStudi, tableSkorProgramStudi } from "@/src/databases/mysql/schema";
import { and, desc, eq, like } from "drizzle-orm";
import { ServerActionResponse } from "../base";

export type ProgramStudiType = {
  id: number;
  nama: string;
  bidang_ilmu_id: number;
}

export type BidangIlmuType = {
  id: number;
  nama: string;
}

export type SkorProgramStudiType = {
  total: number;
  arr: {
    id: number;
    skor: number;
    program_studi_id: number;
    program_studi_nama: string;
    bidang_ilmu_id: number;
  }[];
}

export async function ProgramStudiGet(options: { bidang_ilmu_id: number }): Promise<ServerActionResponse<ProgramStudiType[]>> {
  try {
    const dataProgramStudi = await db.query.tableProgramStudi.findMany({
      columns: {
        id: true,
        nama: true,
        bidang_ilmu_id: true,
      },
      where: and(
        eq(tableProgramStudi.bidang_ilmu_id, options.bidang_ilmu_id)
      )
    });

    return {
      response: "data",
      data: dataProgramStudi
    }
  } catch (err) {
    const errCatched = err as Error;
    return {
      response: "error",
      name: errCatched.name,
      cause: errCatched.cause as string,
      message: errCatched.message
    }
  }
}

export async function BidangIlmuGet(): Promise<ServerActionResponse<BidangIlmuType[]>> {
  try {
    const dataBidangIlmu = await db.query.tableBidangIlmu.findMany({
      columns: {
        id: true,
        nama: true,
      }
    });

    return {
      response: "data",
      data: dataBidangIlmu,
    }
  } catch (err) {
    const errCatched = err as Error;
    return {
      response: "error",
      name: errCatched.name,
      cause: errCatched.cause as string,
      message: errCatched.message
    }
  }
}

export async function SkorProgramStudiGet(periodeSeleksiId: number, page: number): Promise<ServerActionResponse<SkorProgramStudiType>> {
  const offset = (page * 5) - 5;
  try {
    const countSkorProgramStudi = await db.$count(
      tableSkorProgramStudi,
      eq(tableSkorProgramStudi.periode_seleksi_id, periodeSeleksiId)
    );
    const dataSkorProgramStudi = await db.query.tableSkorProgramStudi.findMany({
      limit: 5,
      offset: offset,
      columns: {
        id: true,
        skor: true,
      },
      with: {
        program_studi: {
          columns: {
            id: true,
            nama: true,
            bidang_ilmu_id: true,
          }
        }
      },
      where: eq(tableSkorProgramStudi.periode_seleksi_id, periodeSeleksiId),
      orderBy: [desc(tableSkorProgramStudi.created_at)],
    });

    return {
      response: "data",
      data: {
        total: countSkorProgramStudi,
        arr: dataSkorProgramStudi.map(value => {
          return {
            id: value.id,
            skor: value.skor,
            program_studi_id: value.program_studi.id,
            program_studi_nama: value.program_studi.nama,
            bidang_ilmu_id: value.program_studi.bidang_ilmu_id,
          }
        })
      }
    }
  } catch (err) {
    const errCatched = err as Error;
    return {
      response: "error",
      name: errCatched.name,
      cause: errCatched.cause as string,
      message: errCatched.message,
    }
  }
}