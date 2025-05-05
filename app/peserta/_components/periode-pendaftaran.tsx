'use client';

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatterDateIndonesian, statuStyler } from "@/lib/utils";
import { tablePeriodeSeleksi } from "@/src/databases/mysql/schema";
import { AddPendaftarPeriodeSeleksi, GetPeriodeSeleksi, GetTerdaftarPeriodeSeleksi } from "@/src/services/peserta/periode-seleksi";
import { CalendarClock, CalendarX, CircleDot } from "lucide-react"
import React, { SetStateAction, useEffect, useState } from "react";
import FormDaftarPeriodeSeleksi from "./form-daftar-periode-seleksi";
import { DaftarPeriodeSeleksiValuesType } from "@/src/services/peserta/zod-schema";
import { UseFormReturn } from "react-hook-form";
import { NotificationType } from "@/app/globals-type";

export default function PeriodePendaftaran({
  setNotification,
}: {
  setNotification: React.Dispatch<SetStateAction<NotificationType>>;
}) {
  // state@data
  const [dataPeriodeSeleksi, setDataPeriodeSeleksi] = useState<typeof tablePeriodeSeleksi.$inferSelect[]>([]);
  const [selected, setSelected] = useState<typeof tablePeriodeSeleksi.$inferSelect>();
  const [terdaftar, setTerdaftar] = useState<number[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<Error>();
  const [openDialog, setOpendDialog] = useState<boolean>(false);
  const [refetch, setRefetch] = useState<boolean>(false);

  // handler@dialog
  const onCloseDialog = () => {
    setOpendDialog(false);
  }
  // handler@onSubmit
  const onSubmit = (form: UseFormReturn<any>) => async (formValues: DaftarPeriodeSeleksiValuesType) => {
    setLoading(true);
    const daftar = await AddPendaftarPeriodeSeleksi(selected!.id, formValues);
    if (daftar instanceof Error) {
      setLoading(false);
      return setErr(err);
    }

    form.reset()

    setLoading(false);
    setOpendDialog(false);
    setRefetch(prev => !prev);
    setNotification({
      show: true,
      name: daftar.name,
      message: daftar.message,
    });
  }

  /* fetch */
  useEffect(() => {
    // getAll@periode-seleksi
    (async () => {
      const data = await GetPeriodeSeleksi();
      if (data instanceof Error) {
        return setErr(data);
      }

      return setDataPeriodeSeleksi(data);
    })();
  }, []);
  useEffect(() => {
    // getAll@periode-seleksi[terdaftar]
    (async () => {
      const data = await GetTerdaftarPeriodeSeleksi();
      if (data instanceof Error) {
        return setErr(data);
      }

      return setTerdaftar(data);
    })();
  }, [refetch]);
  return (
    <div className="mt-[1em]">
      {dataPeriodeSeleksi.map((data, idx) => {
        return (
          <div key={idx} className="mb-[1em] border border-[#d6ddf7] bg-white rounded-sm shadow-sm">
            <p className="pt-2 pb-2 ps-3 pe-3 font-semibold text-primary">
              {data.nama}
            </p>
            <div className="mb-2 ps-3 pe-3">
              <Separator className="bg-[#d6ddf7]" />
            </div>
            <div className="ps-3 pe-3 pb-3">
              <p className="font-semibold text-gray-400 text-sm">
                Deskripsi
              </p>
              <p className="text-gray-800 text-sm whitespace-pre-line">
                {data.deskripsi}
              </p>
            </div>
            <Separator orientation="horizontal" className="bg-[#d6ddf7]" />
            <div className="pt-3 pb-3 ps-3 pe-3 flex justify-between items-center">
              <div className="flex items-center gap-x-[0.8em]">
                <div>
                  <div className="flex gap-x-1 items-center">
                    <CalendarClock size={15} className="text-gray-400" />
                    <p className="font-semibold text-gray-400 text-sm">
                      Tanggal Pendaftaran Dibuka
                    </p>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">
                    {formatterDateIndonesian.format(data.tanggal_dibuka)}
                  </p>
                </div>
                <div className="v-separator h-[2em] w-[1px] rounded-sm bg-gray-300" />
                <div>
                  <div className="flex gap-x-1 items-center">
                    <CalendarX size={15} className="text-gray-400" />
                    <p className="font-semibold text-gray-400 text-sm">
                      Batas Pendaftaran
                    </p>
                  </div>
                  <p className="font-semibold text-red-500 text-sm">
                    {formatterDateIndonesian.format(data.batas_pendaftaran)}
                  </p>
                </div>
                <div className="v-separator h-[2em] w-[1px] rounded-sm bg-gray-300" />
                <div>
                  <div className="flex gap-x-1 items-center">
                    <CircleDot size={15} className="text-gray-400" />
                    <p className="font-semibold text-gray-400 text-sm">
                      Status
                    </p>
                  </div>
                  <div className="flex gap-x-[0.3em] items-center">
                    <Badge className={`${statuStyler(data.status as string)}`}>
                      {data.status}
                    </Badge>
                  </div>
                </div>
              </div>
              {terdaftar && terdaftar.includes(data.id) && (
                <Button
                  variant={"secondary"} size={"sm"}
                  disabled
                >
                  Terdaftar
                </Button>
              )}
              {terdaftar && !terdaftar.includes(data.id) && (
                <Button className="cursor-pointer"
                  variant={"default"} size={"sm"}
                  onClick={() => {
                    setSelected(data);
                    setOpendDialog(true);
                  }}
                >
                  Daftar sekarang
                </Button>
              )}
            </div>
          </div>
        )
      })}
      {/* form@daftar-periode-seleksi */}
      <FormDaftarPeriodeSeleksi
        openDialog={openDialog}
        onCloseDialog={onCloseDialog}
        onSubmit={onSubmit}
        loading={loading}
        error={err}
      />
    </div>
  )
}