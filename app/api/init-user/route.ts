import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/src/databases/mysql/init";
import { tableAdministrator, tablePengguna } from "@/src/databases/mysql/schema";

const admuserschema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nama_lengkap: z.string().min(3),
  jabatan: z.string().min(3)
});

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({
        name: err.name,
        cause: err.cause,
        message: err.message
      }, { status: 400 });
    }
  }

  const validate = admuserschema.safeParse(body);
  if (!validate.success) {
    const err = validate.error.flatten().fieldErrors;
    return NextResponse.json(err, { status: 400 });
  }

  const check = await db.query.tablePengguna.findFirst({
    where: eq(tablePengguna.email, validate.data.email)
  });
  if (check) {
    return NextResponse.json({
      name: "duplikasi email",
      cause: `email ${validate.data.email} telah digunakan oleh administrator lain`,
      message: "email yang anda gunakan telah didaftarkan oleh administrator lain, ulangi dengan menggunakan email lain"
    }, { status: 400 });
  }

  const uniqueIdPengguna = uuidv4();
  const uniqueIdAdministrator = uuidv4();
  const rounds = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(validate.data.password, rounds);

  try {
    await db.transaction(async (tx) => {
      await tx.insert(tablePengguna).values({
        id: uniqueIdPengguna,
        email: validate.data.email,
        password: hashed
      });
      await tx.insert(tableAdministrator).values({
        id: uniqueIdAdministrator,
        nama_lengkap: validate.data.nama_lengkap,
        jabatan: validate.data.jabatan,
        pengguna_id: uniqueIdPengguna,
      });
    });

    return NextResponse.json({
      message: "berhasil membuat akun administrator",
    }, { status: 201 });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({
        name: err.name,
        cause: err.cause,
        message: err.message
      }, { status: 500 });
    }

    console.log("unknown error \t:", err);
    return NextResponse.json(err, { status: 500 });
  }
}