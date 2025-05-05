'use client'

import { ArrowLeft, ListChecks, ListOrdered, MessageCircleX, Settings2, UserRound } from "lucide-react";
import React, { useEffect, useState } from "react";
import Peserta from "./_components/peserta";
import ValidasiKriteria from "./_components/validasi-kriteria";
import DataAlternatif from "./_components/informasi-perangkingan";
import Pemeringkatan from "./_components/pemeringkatan";
import { GetPeriodeSeleksi, PeriodeSeleksiType } from "@/src/services/administrator/periode-seleksi";
import { useParams, useRouter } from "next/navigation";
import MessageNotification from "@/components/notifications/message";
import { NotificationType } from "@/app/globals-type";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function DetailSeleksi() {
  //  hook@params
  const params = useParams<{ id: string }>();
  const router = useRouter();
  // state@data
  const [tab, setTab] = useState<string>("peserta");
  const [periodeSeleksi, setPeriodeSeleksi] = useState<PeriodeSeleksiType>();
  // state@message
  const [notification, setNotification] = useState<NotificationType>({
    show: false,
    name: "",
    message: ""
  });
  const [err, setErr] = useState<Error>();

  /* tabs-component */
  const tabsComponent: Record<string, React.ReactElement> = {
    "peserta": <Peserta />,
    "validasi_kriteria": <ValidasiKriteria setNotification={setNotification} />,
    "data_alternatif": <DataAlternatif setNotification={setNotification} />,
    "pemeringkatan": <Pemeringkatan setNotification={setNotification} />,
    // "peserta_diterima": <PesertaDiterima />
  }

  useEffect(() => {
    (async () => {
      const data = await GetPeriodeSeleksi({ primaryKey: Number(params.id) });
      if (data instanceof Error) {
        return setErr(data);
      }

      return setPeriodeSeleksi(data.data[0]);
    })();
  }, []);
  return (
    <div className="ps-[0em] pe-[0em] pt-[1em] pb-[3em]">
      {/* message@notification */}
      <MessageNotification
        show={notification.show}
        setShow={setNotification}
        name={notification.name}
        message={notification.message}
        timeoutS={notification.seconds}
      />
      <div>
        <div>
          <Button size={"sm"} variant={"ghost"} className="cursor-pointer text-gray-600"
            onClick={() => {
              router.back();
            }}
          >
            <ArrowLeft />
            Kembali
          </Button>
        </div>
        <p className="mt-5 font-semibold text-lg text-[#3457D5]">
          {periodeSeleksi?.nama}
        </p>
        {/* notification@error-fetch */}
        {err && (
          <Alert className="mt-2 mb-2 pt-2 pb-2 ps-4 pe-4 bg-red-100 text-red-500 border-0">
            <MessageCircleX />
            <AlertTitle className="text-sm">
              {err.name}
            </AlertTitle>
            <AlertDescription className="text-sm text-red-500">
              {err.message}
            </AlertDescription>
          </Alert>
        )}
      </div>
      <div className="mt-5 rounded-b-sm">
        <div className="flex gap-x-[1em]">
          {/* TAB : PESERTA */}
          <div className={`
          ${Boolean(tab == "peserta") ?
              "bg-white text-[#3457d5]" :
              "text-gray-500"
            }
            ps-4 pe-4 pt-2 pb-2 flex items-center gap-x-[0.5em] font-semibold text-sm rounded-t-sm cursor-pointer`}
            onClick={() => {
              setTab("peserta")
            }}
          >
            <UserRound
              size={25}
              strokeWidth={2.5}
              color={`${Boolean(tab == "peserta") ? "#3457d5" : "#6a7282"}`}
              className={`${Boolean(tab == "peserta") ? "p-1 bg-[#c2cdf2] rounded-xl" : "p-1"} mt-[-0.25]`} />
            Peserta
          </div>
          {/* TAB : VALIDASI KRITERIA */}
          <div className={`
          ${Boolean(tab == "validasi_kriteria") ?
              "bg-white text-[#3457d5]" :
              "text-gray-500"
            }
            ps-4 pe-4 pt-2 pb-2 flex items-center gap-x-[0.5em] font-semibold text-sm rounded-t-sm cursor-pointer`}
            onClick={() => {
              setTab("validasi_kriteria")
            }}
          >
            <ListChecks
              size={25}
              strokeWidth={2.5}
              color={`${Boolean(tab == "validasi_kriteria") ? "#3457d5" : "#6a7282"}`}
              className={`${Boolean(tab == "validasi_kriteria") ? "p-1 bg-[#c2cdf2] rounded-xl" : "p-1"} mt-[-0.25]`} />
            Validasi Kriteria
          </div>
          {/* TAB : DATA ALTERNATIF */}
          <div className={`
          ${Boolean(tab == "data_alternatif") ?
              "bg-white text-[#3457d5]" :
              "text-gray-500"
            }
            ps-4 pe-4 pt-2 pb-2 flex items-center gap-x-[0.5em] font-semibold text-sm rounded-t-sm cursor-pointer`}
            onClick={() => {
              setTab("data_alternatif")
            }}>
            <Settings2
              size={25}
              strokeWidth={2.5}
              color={`${Boolean(tab == "data_alternatif") ? "#3457d5" : "#6a7282"}`}
              className={`${Boolean(tab == "data_alternatif") ? "p-1 bg-[#c2cdf2] rounded-xl" : "p-1"} mt-[-0.25]`} />
            Informasi Perangkingan
          </div>
          {/* TAB : PEMERINGKATAN */}
          <div className={`
          ${Boolean(tab == "pemeringkatan") ?
              "bg-white text-[#3457d5]" :
              "text-gray-500"
            }
            ps-4 pe-4 pt-2 pb-2 flex items-center gap-x-[0.5em] font-semibold text-sm rounded-t-sm cursor-pointer`}
            onClick={() => {
              setTab("pemeringkatan")
            }}>
            <ListOrdered
              size={25}
              strokeWidth={2.5}
              color={`${Boolean(tab == "pemeringkatan") ? "#3457d5" : "#6a7282"}`}
              className={`${Boolean(tab == "pemeringkatan") ? "p-1 bg-[#c2cdf2] rounded-xl" : "p-1"} mt-[-0.25]`} />
            Ranking
          </div>
          {/* TAB : PESERTA DITERIMA */}
          {/* <div className={`
          ${Boolean(tab == "peserta_diterima") ?
              "bg-white text-[#3457d5]" :
              "text-gray-500"
            }
            ps-4 pe-4 pt-2 pb-2 flex items-center gap-x-[0.5em] font-semibold text-sm rounded-t-sm cursor-pointer`}
            onClick={() => {
              setTab("peserta_diterima")
            }}>
            <UserRoundCheck
              size={25}
              strokeWidth={2.5}
              color={`${Boolean(tab == "peserta_diterima") ? "#3457d5" : "#6a7282"}`}
              className={`${Boolean(tab == "peserta_diterima") ? "p-1 bg-[#c2cdf2] rounded-xl" : "p-1"} mt-[-0.25]`} />
            Peserta Diterima
          </div> */}
        </div>
        {/* Tab Content */}
        <div className="p-2 bg-white rounded-b-sm">
          {tabsComponent[tab]}
        </div>
      </div>
    </div >
  )
}