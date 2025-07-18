'use client'

import StandardPagination, { PaginateProps } from "@/components/navigations/standard-pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatterDateIndonesian } from "@/lib/utils";
import { GetDataStatusTerdaftar, StatusTerdaftarType } from "@/src/services/peserta/periode-seleksi";
import { ArrowUpRight, BookOpen, FileCheck, GraduationCap, Search, MessageCircleX } from "lucide-react";
import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react"
import { useDebounce } from "use-debounce";

export default function StatusPendaftaran() {
  // state@data
  const [statusTerdaftar, setStatusTerdaftar] = useState<StatusTerdaftarType[]>([]);
  const [err, setErr] = useState<Error>();
  const [query, setQuery] = useState<string>("");
  const [debouncedQuery] = useDebounce(query, 800);
  const [paginate, setPaginate] = useState<PaginateProps>({
    current: 1,
    startRange: 0,
    endRange: 7
  });

  useEffect(() => {
    // getAll@pendaftar&periode-seleksi[terdaftar]
    (async () => {
      const req = await GetDataStatusTerdaftar({
        query: debouncedQuery,
        page: paginate.current,
      });
      switch (req.response) {
        case "data":
          return setStatusTerdaftar(req.data);

        case "error":
          const err = new Error(req.message, { cause: req.cause });
          err.name = req.name;
          return setErr(err);

        default:
          break;
      }
    })();
  }, [debouncedQuery, paginate.current]);
  return (
    <div>
      {err && (
        <Alert className="mt-2 pt-2 pb-2 ps-4 pe-4 bg-red-100 text-red-500 border-0">
          <MessageCircleX />
          <AlertTitle className="text-sm">
            {err.name}
          </AlertTitle>
          <AlertDescription className="text-sm text-red-500">
            {err.message}
          </AlertDescription>
        </Alert>
      )}
      <div className="mt-1 mb-[1em] flex items-center">
        <p className="grow ps-1 pe-1 font-bold text-lg text-gray-800">
          Histori dan Pemantauan Status Pendaftaran
        </p>
        <div className="relative bg-white rounded-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            <Search size={15} color="#3457d5" />
          </span>
          <Input
            type="text"
            size={10}
            placeholder="Cari riwayat seleksi"
            className="min-w-[25em] ps-[2.5em] focus-visible:ring-[#d6ddf7] focus-visible:border-[#3457D5]"
            value={query}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const value = event.target.value;
              setPaginate(prev => ({ ...prev, current: 1 }));
              setQuery(value);
            }}
          />
        </div>
      </div>
      {statusTerdaftar.map((data, idx) => {
        return (
          <div key={idx} className="mb-[1em] border border-[#d6ddf7] bg-white rounded-sm shadow-sm">
            <div className="flex items-center">
              <div className="grow pt-2 pb-2 ps-3 pe-3">
                <p className="font-semibold text-primary">
                  {data.periode_seleksi.nama}
                </p>
                <div>
                  <p className="text-gray-500 text-[0.8em] italic">
                    Mendaftar pada tanggal {formatterDateIndonesian.format(data.pendaftar.created_at as Date)}
                  </p>
                </div>
              </div>
              <Badge variant={"secondary"} className={`me-3 ${data.pendaftar.status == "diterima" ? "bg-green-50 text-green-600 border border-green-200" : ""}`}>
                {data.pendaftar.status}
              </Badge>
            </div>
            <div className="mb-2 ps-3 pe-3">
              <Separator className="bg-[#d6ddf7]" />
            </div>
            <div className="ps-3 pe-3 pb-3">
              <div className="mb-3">
                <p className="font-semibold text-gray-800 text-sm">
                  Deskripsi
                </p>
                <p className="text-gray-600 text-sm whitespace-pre-line">
                  {data.periode_seleksi.deskripsi}
                </p>
              </div>
            </div>
            <Separator orientation="horizontal" className="bg-[#d6ddf7]" />
            <div className="pt-3 pb-3 ps-3 pe-3 flex justify-between items-center">
              <div className="flex w-full items-start gap-x-[0.8em]">
                <div>
                  <div className="flex gap-x-1 items-center">
                    <GraduationCap size={15} className="text-gray-600" />
                    <p className="font-semibold text-gray-600 text-sm">
                      Indek Prestasi Kumulatif (IPK)
                    </p>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">
                    {data.pendaftar.indek_prestasi_kumulatif}
                  </p>
                </div>
                <div className="v-separator h-[2em] w-[1px] rounded-sm bg-gray-300" />
                <div>
                  <div className="flex gap-x-1 items-center">
                    <BookOpen size={15} className="text-gray-600" />
                    <p className="font-semibold text-gray-600 text-sm">
                      Semester
                    </p>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">
                    {data.pendaftar.semester}
                  </p>
                </div>
                <div className="v-separator h-[2em] w-[1px] rounded-sm bg-gray-300" />
                <div className="grow">
                  <div className="flex gap-x-1 items-center">
                    <FileCheck size={15} className="text-gray-600" />
                    <p className="font-semibold text-gray-600 text-sm">
                      Kelengkapan Dokumen Pengantar
                    </p>
                  </div>
                  <div className="w-full mt-1 flex gap-x-[0.5em] items-center">
                    <Button
                      asChild
                      className="cursor-pointer text-primary bg-gray-100 hover:text-white hover:bg-primary"
                      variant={"ghost"}
                      size={"sm"}
                    >
                      <Link
                        href={`/api/dokumen?docid=${data.pendaftar.sp_universitas_id}`}
                        target="_blank"
                      >
                        Perguruan Tinggi
                        <ArrowUpRight />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="cursor-pointer text-primary bg-gray-100 hover:text-white hover:bg-primary"
                      variant={"ghost"}
                      size={"sm"}
                    >
                      <Link
                        href={`/api/dokumen?docid=${data.pendaftar.sp_bakesbangpol_provinsi_id}`}
                        target="_blank"
                      >
                        Transkrip Nilai
                        <ArrowUpRight />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="cursor-pointer text-primary bg-gray-100 hover:text-white hover:bg-primary"
                      variant={"ghost"}
                      size={"sm"}
                    >
                      <Link
                        href={`/api/dokumen?docid=${data.pendaftar.sp_bakesbangpol_daerah_id}`}
                        target="_blank"
                      >
                        Bakesbangpol Daerah Sidoarjo
                        <ArrowUpRight />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
      {/* component@pagination */}
      <StandardPagination
        paginate={paginate}
        setPaginate={setPaginate}
        totalData={statusTerdaftar.length}
      />
    </div >
  )
}