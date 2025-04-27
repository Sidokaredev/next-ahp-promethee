'use client'

import StandardPagination from "@/components/navigations/standard-pagination"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DataPesertaPeriodeSeleksiType, GetDaftarPeserta } from "@/src/services/administrator/periode-seleksi"
import { Award, FileCheck, MessageCircleX, Search } from "lucide-react"
import { useParams } from "next/navigation"
import { ChangeEvent, useEffect, useState } from "react"
import { useDebounce } from "use-debounce"

export default function Peserta() {
  // hook@params
  const params = useParams<{ id: string }>();
  // state@data
  const [dataPeserta, setDataPeserta] = useState<DataPesertaPeriodeSeleksiType[]>([]);
  // state@data-pagination
  const [paginate, setPaginate] = useState<{
    current: number;
    startRange: number;
    endRange: number;
  }>({
    current: 1,
    startRange: 0,
    endRange: 7
  });
  // state@query
  const [query, setQuery] = useState<string>("");
  const [debouncedQuery] = useDebounce(query, 800);
  // state@message
  const [err, setErr] = useState<Error>();

  /* fetch@data-peserta */
  useEffect(() => {
    (async () => {
      const data = await GetDaftarPeserta({
        periodeSeleksiId: Number(params.id),
        query: debouncedQuery,
        page: paginate.current,
      });
      if (data instanceof Error) {
        return setErr(data);
      }

      return setDataPeserta(data);
    })();
  }, [debouncedQuery]);
  return (
    <div className="">
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
      <div className="mt-2 mb-3 flex justify-between items-center">
        <div className="">
          <p className="font-semibold text-md text-gray-700">
            {dataPeserta.length} Peserta Terdaftar
          </p>
        </div>
        <div className="relative bg-white rounded-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            <Search size={15} color="#3457d5" />
          </span>
          <Input
            type="text"
            size={10}
            placeholder="Cari data peserta (Nama Lengkap atau NIM)"
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
      <div className="custom-table">
        <div className="custom-table-head p-2 rounded-sm grid grid-cols-[5%_20%_20%_15%_20%_20%] font-semibold text-[#3457d5] bg-[#c2cdf2]">
          <div className="text-base">
            No
          </div>
          <div className="text-base">
            Nama
          </div>
          <div className="text-base">
            Pendidikan
          </div>
          <div className="text-base">
            Kontak
          </div>
          <div className="text-base">
            Nilai
          </div>
          <div className="text-base">
            Kelengkapan Dokumen
          </div>
        </div>
        <div className="custom-table-body">
          {dataPeserta.map((data, idx) => {
            return (
              <div key={idx} className="p-2 grid grid-cols-[5%_20%_20%_15%_20%_20%] hover:bg-gray-100">
                <div className="flex items-center font-semibold">
                  {idx + 1 + "."}
                </div>
                <div className="flex flex-col justify-center">
                  <p className="font-semibold text-sm text-[#1f3480]">{data.peserta.nama_lengkap}</p>
                  <p className="text-sm text-gray-600 break-words">{data.peserta.email}</p>
                  <div className="bg-primary">
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="font-semibold text-sm text-[#1f3480] break-words">{data.peserta.universitas}</p>
                  <p className="text-sm text-gray-600 break-words">{data.peserta.jurusan}</p>
                  <p className="text-sm text-gray-800 break-words">{data.peserta.akreditasi === "Tidak Terakreditasi" ? data.peserta.akreditasi : "Akreditasi " + data.peserta.akreditasi}</p>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-sm text-gray-800 break-words">
                    <span>+(62) 85784464441</span>
                  </p>
                </div>
                <div className="flex items-center">
                  <div>
                    <p className="font-semibold text-sm text-[#1f3480]">
                      Indeks Prestasi Kumulatif (IPK)
                    </p>
                    <div className="w-[max-content] flex items-center space-x-1 ps-2 pe-3 font-normal text-sm text-[#3457d5] bg-[#ebeefb] border border-[#aebcee] rounded-sm">
                      <Award size={15} />
                      <p>{data.pendaftar.indek_prestasi_kumulatif}</p>
                    </div>
                    <Separator className="mt-2" />
                    <p className="mt-1 font-semibold text-sm text-gray-600">Semester {data.pendaftar.semester}</p>
                  </div>
                </div>
                <div className="">
                  <div className="flex flex-col space-y-[0.2em] text-sm">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="p-1 flex items-center gap-x-2 text-gray-700 hover:bg-primary hover:text-white cursor-pointer hover:rounded-sm border-b"
                            onClick={() => {
                              window.open("/api/dokumen?docid=" + data.pendaftar.sp_universitas_id, "_blank");
                            }}
                          >
                            <FileCheck size={15} />
                            <p>SP Perguruan Tinggi</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-gray-800 text-gray-200 [&>span>svg]:fill-gray-800 [&>span>svg]:bg-gray-800">
                          Lihat Surat Pengantar Perguruan Tinggi Negeri
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="p-1 flex items-center gap-x-2 text-gray-700 hover:bg-primary hover:text-white cursor-pointer hover:rounded-sm border-b"
                            onClick={() => {
                              window.open("/api/dokumen?docid=" + data.pendaftar.sp_bakesbangpol_provinsi_id, "_blank");
                            }}
                          >
                            <FileCheck size={15} />
                            <p>SP Bakesbangpol Provinsi</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-gray-800 text-gray-200 [&>span>svg]:fill-gray-800 [&>span>svg]:bg-gray-800">
                          Lihat Surat Pengantar Bakesbangpol Provinsi
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="p-1 flex items-center gap-x-2 text-gray-700 hover:bg-primary hover:text-white cursor-pointer hover:rounded-sm border-b"
                            onClick={() => {
                              window.open("/api/dokumen?docid=" + data.pendaftar.sp_bakesbangpol_daerah_id, "_blank");
                            }}
                          >
                            <FileCheck size={15} />
                            <p>SP Bakesbangpol Daerah</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-gray-800 text-gray-200 [&>span>svg]:fill-gray-800 [&>span>svg]:bg-gray-800">
                          Lihat Surat Pengantar Bakesbangpol Daerah
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <StandardPagination
        paginate={paginate}
        setPaginate={setPaginate}
        totalData={dataPeserta.length}
      />
    </div>
  )
}