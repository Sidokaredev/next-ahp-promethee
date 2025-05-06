'use server';

import { cookies } from "next/headers";
import * as jose from "jose";
import { TokenPayload } from "./accounts/auth";
import { tablePengguna } from "@/src/databases/mysql/schema";
import { eq } from "drizzle-orm";
import { db } from "@/src/databases/mysql/init";

/**
 * Base Type
 */
export type SuccessMessage = {
  name: string;
  message: string;
}
type SuccessResponse = {
  response: "success";
  name: string;
  message: string;
}
type DataResponse<T> = {
  response: "data";
  data: T;
}
type FailResponse = {
  response: "error";
  name: string;
  message: string;
  cause: string;
}
export type ServerActionResponse<T> = SuccessResponse | DataResponse<T> | FailResponse;

/**
 * Base Server Action
 */
export async function GetNameNavigation(): Promise<string | Error> {
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
    const { id_pengguna, as: role } = payload as TokenPayload;
    const data = await db.query.tablePengguna.findFirst({
      columns: {},
      where: eq(tablePengguna.id, id_pengguna),
      with: {
        peserta: {
          columns: { nama_lengkap: true },
        },
        administrator: {
          columns: { nama_lengkap: true }
        }
      },
    });
    if (!data) {
      const err = new Error(
        `Data pengguna dengan id [${id_pengguna}] tidak dapat ditemukan`,
        { cause: "data pengguna tidak ditemukan atau id tidak valid" }
      );
      err.name = "data tidak ditemukan";

      return err;
    }

    return role === "administrator" ? data.administrator!.nama_lengkap : data.peserta!.nama_lengkap;
  } catch (err) {
    if (err instanceof Error) {
      return err;
    }

    console.log("unknown err\t:", err);
    return err as Error;
  }
}

export async function CheckCredential(): Promise<string | undefined> {
  const cookie = await cookies();
  const check = cookie.get("enc-cre")?.value;
  return check;
}