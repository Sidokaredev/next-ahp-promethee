'use client'

import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, CircleCheck, EllipsisVertical } from "lucide-react";
import { useState } from "react";

export default function RiwayatSeleksiPeserta() {
  // /* state */
  const [paginate, setPaginate] = useState<{
    current: number;
    startRange: number;
    endRange: number;
  }>({
    current: 1,
    startRange: 0,
    endRange: 7
  });
  console.log(paginate);
  const totalData = 16;
  const paginationItems = Array.from({ length: totalData }, (_, idx) => idx + 1).slice(paginate.startRange, paginate.endRange);

  /* handler */
  const handlePrevious = () => {
    if (paginate.current == 1) {
      return;
    }
    if ((paginate.current - 1) == paginate.startRange) {
      setPaginate(prev => ({
        ...prev,
        current: prev.current - 1,
        startRange: prev.startRange - 7,
        endRange: prev.startRange
      }))
      return
    }
    setPaginate(prev => ({
      ...prev,
      current: prev.current - 1
    }))
  }
  const handleNext = () => {
    if (paginate.current == totalData) {
      return
    }
    if (paginate.current == paginate.endRange) {
      if (paginate.endRange + 7 > totalData) {
        setPaginate(prev => ({
          current: prev.current + 1,
          startRange: totalData - 7,
          endRange: totalData
        }))
        return
      }
      setPaginate(prev => ({
        current: prev.current + 1,
        startRange: prev.endRange,
        endRange: prev.endRange + 7
      }))
      return
    }
    setPaginate(prev => ({
      ...prev,
      current: prev.current + 1
    }))
  }
  return (
    <div className="ps-[0em] pe-[0em] pt-[0.7em] pb-[0.7em]">
      <div>
        <p className="font-semibold text-lg text-gray-800">
          Riwayat Seleksi Peserta
        </p>

      </div>
      {[0, 1, 2, 3, 4].map((_, index) => {
        return (
          <div key={index} className="mt-[1em] mb-[1.5em] ps-2 pe-2 border bg-white rounded-sm">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-gray-700">
                Penerimaan Mahasiswa Magang Periode 2021 - 2022
              </p>
              <Button variant={"ghost"} size={"icon"} className="cursor-pointer">
                <EllipsisVertical />
              </Button>
            </div>
            <div className="">
              <p className="font-semibold text-gray-600 text-sm">
                Deskripsi
              </p>
              <p className="text-gray-600 text-sm">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
              </p>
            </div>
            <Separator orientation="horizontal" className="mt-3 mb-3" />
            <div className="pt-2 pb-2 flex justify-between items-center">
              <div className="flex items-center gap-x-[0.8em]">
                <div>
                  <p className="text-gray-600 text-sm">
                    Total Pendaftar
                  </p>
                  <p className="font-semibold text-gray-600 text-sm">
                    43 Peserta
                  </p>
                </div>
                <div className="v-separator h-[2em] w-[1px] rounded-sm bg-gray-300" />
                <div>
                  <p className="text-gray-600 text-sm">
                    Tanggal Pendaftaran
                  </p>
                  <p className="font-semibold text-gray-600 text-sm">
                    Sabtu, 30 Mei 2024 - Kamis, 3 Juli 2024
                  </p>
                </div>
                <div className="v-separator h-[2em] w-[1px] rounded-sm bg-gray-300" />
                <div>
                  <p className="text-gray-600 text-sm">
                    Total diterima
                  </p>
                  <p className="font-semibold text-gray-600 text-sm">
                    13 Peserta
                  </p>
                </div>
                <div className="v-separator h-[2em] w-[1px] rounded-sm bg-gray-300" />
                <div>
                  <p className="text-gray-600 text-sm">
                    Status
                  </p>
                  <div className="flex gap-x-[0.3em] items-center">
                    <CircleCheck size={15} className="text-green-700" />
                    <p className="font-semibold text-green-700 text-sm">
                      Selesai
                    </p>
                  </div>
                </div>
              </div>
              <Button className="cursor-pointer border-primary text-primary hover:text-white hover:bg-primary" variant={"outline"} size={"sm"}>
                Lihat detail
                <ChevronRight />
              </Button>
            </div>
          </div>
        )
      })}
      <Pagination className="justify-end">
        <PaginationContent>
          <PaginationItem className={paginate.current == 1 ? "pointer-events-none text-gray-400" : "" + "select-none cursor-pointer"}>
            <PaginationPrevious onClick={handlePrevious} />
          </PaginationItem>
          {paginate.startRange !== 0 && (
            <>
              <PaginationItem className="cursor-pointer">
                <PaginationLink onClick={() => setPaginate(prev => ({
                  ...prev,
                  current: 1,
                  startRange: 0,
                  endRange: 7
                }))}>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationEllipsis />
            </>
          )}
          {paginationItems.map((page) => {
            return (
              <PaginationItem key={page} className={"cursor-pointer"}>
                <PaginationLink isActive={page == paginate.current} className={page == paginate.current ? "bg-primary text-white hover:bg-primary hover:text-white border-0" : ""} onClick={() => setPaginate(prev => ({ ...prev, current: page }))}>
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          })}
          {paginate.endRange < totalData && (
            <>
              <PaginationEllipsis />
              <PaginationItem className="cursor-pointer">
                <PaginationLink onClick={() => setPaginate(prev => ({
                  ...prev,
                  current: totalData,
                  startRange: totalData - 7,
                  endRange: totalData
                }))}>
                  {totalData}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
          <PaginationItem className={paginate.current == totalData ? "pointer-events-none text-gray-400" : "" + "select-none cursor-pointer"}>
            <PaginationNext onClick={handleNext} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}