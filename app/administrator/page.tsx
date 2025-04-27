'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { CalendarClock, CalendarPlus, ChevronRight, CircleDot, Pencil, Search, UserRound, UserRoundCheck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import FormPeriodeSeleksi from "./_components/form-periode-seleksi";
import MessageNotification from "@/components/notifications/message";
import { NotificationType } from "../globals-type";
import { AddPeriodeSeleksi, ChangePeriodeSeleksi, GetPeriodeSeleksi, PeriodeSeleksiDetailType, PeriodeSeleksiType } from "@/src/services/administrator/periode-seleksi";
import { PeriodeSeleksiValuesType } from "@/src/services/administrator/zod-schema";
import { SuccessMessage } from "@/src/services/base";
import { UseFormReturn } from "react-hook-form";
import { formatterDateIndonesian, statuStyler } from "@/lib/utils";
import { useDebounce, useDebouncedCallback } from "use-debounce";

export default function RiwayatSeleksiPeserta() {
  /* hook */
  const router = useRouter();
  const pathname = usePathname();

  // state@data
  const [dataPeriodeSeleksi, setDataPeriodeSeleksi] = useState<PeriodeSeleksiDetailType>();
  const [selected, setSelected] = useState<PeriodeSeleksiType>();
  const [query, setQuery] = useState<string>("");
  const [debouncedQuery] = useDebounce(query, 800)
  const [paginate, setPaginate] = useState<{
    current: number;
    startRange: number;
    endRange: number;
  }>({
    current: 1,
    startRange: 0,
    endRange: 7
  });
  // state@condition
  const [openDialog, setOpenDialog] = useState<{ add: boolean, change: boolean }>({ add: false, change: false });
  const [loading, setLoading] = useState<boolean>(false);
  const [refetch, setRefetch] = useState<boolean>(false);
  // state@message
  const [notification, setNotification] = useState<NotificationType>({
    show: false,
    name: "",
    message: ""
  });
  const [err, setErr] = useState<Error>();
  // var@pagination
  const totalData = dataPeriodeSeleksi ? dataPeriodeSeleksi.info.count : 0;
  const totalPagination = Math.ceil(totalData / 7);
  const paginationItems = Array.from({ length: totalPagination }, (_, idx) => idx + 1).slice(paginate.startRange, paginate.endRange);

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
  const onCloseDialog = () => {
    if (openDialog.add) {
      setOpenDialog(prev => ({ ...prev, add: false }));
    } else {
      setOpenDialog(prev => ({ ...prev, change: false }));
    }
  }

  /* submit@periode-seleksi */
  const onSubmit = (form: UseFormReturn<PeriodeSeleksiValuesType>) => async (formValues: PeriodeSeleksiValuesType) => {
    setLoading(true);
    let insert: Awaited<SuccessMessage | Error>;
    if (openDialog.change && selected) {
      insert = await ChangePeriodeSeleksi(selected.id, formValues);
    } else {
      insert = await AddPeriodeSeleksi(formValues);
    }

    if (insert instanceof Error) {
      setLoading(false);
      return setErr(insert);
    }
    setLoading(false);

    form.reset();

    if (openDialog.change) {
      setOpenDialog(prev => {
        return {
          ...prev,
          change: false
        }
      });
    } else {
      setOpenDialog(prev => {
        return {
          ...prev,
          add: false
        }
      });
    }
    setRefetch(prev => !prev);

    return setTimeout(() => {
      setNotification({
        show: true,
        name: insert.name,
        message: insert.message,
      })
    }, 1000)
  };

  /* fetch */
  useEffect(() => {
    // get-all@periode-seleksi
    (async () => {
      const data = await GetPeriodeSeleksi({
        query: debouncedQuery,
        page: paginate.current
      });
      if (data instanceof Error) {
        return setErr(data);
      }

      return setDataPeriodeSeleksi(data)
    })();
  }, [refetch, paginate.current, debouncedQuery]);
  return (
    <div className="ps-[0em] pe-[0em] pt-[1em] pb-[2em]">
      {/* message@notification */}
      <MessageNotification
        show={notification.show}
        setShow={setNotification}
        name={notification.name}
        message={notification.message}
        timeoutS={notification.seconds}
      />
      <div className="mb-3 flex justify-between items-center rounded-sm">
        <p className="font-semibold text-lg text-[#3457D5]">
          Riwayat Seleksi Peserta
        </p>
        <div className="flex items-center gap-x-[0.7em]">
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
          <Button size={"sm"} className="cursor-pointer bg-[#3457D5] hover:bg-[#3457D5]"
            onClick={() => {
              setOpenDialog(prev => ({ ...prev, add: true }));
            }}
          >
            <CalendarPlus />
            Buat Seleksi Baru
          </Button>
          {/* form@change */}
          <FormPeriodeSeleksi
            openDialog={openDialog.add}
            onCloseDialog={onCloseDialog}
            onSubmit={onSubmit}
            loading={loading}
            error={err}
          />
        </div>
      </div>
      {/* data@periode-seleksi */}
      {dataPeriodeSeleksi && dataPeriodeSeleksi.data.map((data, idx) => {
        return (
          <div key={idx} className="mb-[0.5em] border border-[#d6ddf7] bg-white rounded-sm">
            <div className="pt-2 pb-2 ps-3 pe-3 flex justify-between items-center">
              <p className="font-semibold text-gray-700">
                {data.nama}
              </p>
              <Button variant={"ghost"} size={"sm"} className="cursor-pointer border"
                onClick={() => {
                  setSelected(data);
                  setOpenDialog(prev => ({ ...prev, change: true }));
                }}
              >
                <Pencil color="#243d95" />
              </Button>
            </div>
            <div className="mb-2 ps-3 pe-3">
              <Separator className="bg-[#d6ddf7]" />
            </div>
            <div className="ps-3 pe-3 pb-3">
              <p className="font-semibold text-[#243d95] text-sm">
                Deskripsi
              </p>
              <p className="text-gray-600 text-sm whitespace-pre-line">
                {data.deskripsi}
              </p>
            </div>
            <Separator orientation="horizontal" className="bg-[#d6ddf7]" />
            <div className="pt-3 pb-3 ps-3 pe-3 flex justify-between items-center">
              <div className="flex items-center gap-x-[0.8em]">
                <div>
                  <div className="flex gap-x-1 items-center">
                    <UserRound size={15} color="#859ae6" className="mt-[-0.25em]" />
                    <p className="font-semibold text-[#859ae6] text-sm">
                      Total Pendaftar
                    </p>
                  </div>
                  <p className="font-semibold text-[#243d95] text-sm">
                    {data.total_pendaftar} Peserta
                  </p>
                </div>
                <div className="v-separator h-[2em] w-[1px] rounded-sm bg-gray-300" />
                <div>
                  <div className="flex gap-x-1 items-center">
                    <CalendarClock size={15} color="#859ae6" className="mt-[-0.25em]" />
                    <p className="font-semibold text-[#859ae6] text-sm">
                      Tanggal Pendaftaran
                    </p>
                  </div>
                  <p className="font-semibold text-[#243d95] text-sm">
                    {formatterDateIndonesian.format(data.tanggal_dibuka)} - {formatterDateIndonesian.format(data.batas_pendaftaran)}
                  </p>
                </div>
                <div className="v-separator h-[2em] w-[1px] rounded-sm bg-gray-300" />
                <div>
                  <div className="flex gap-x-1 items-center">
                    <UserRoundCheck size={15} color="#859ae6" className="mt-[-0.25em]" />
                    <p className="font-semibold text-[#859ae6] text-sm">
                      Total Diterima
                    </p>
                  </div>
                  <p className="font-semibold text-[#243d95] text-sm">
                    {data.total_diterima} Peserta
                  </p>
                </div>
                <div className="v-separator h-[2em] w-[1px] rounded-sm bg-gray-300" />
                <div>
                  <div className="flex gap-x-1 items-center">
                    <CircleDot size={15} color="#859ae6" className="mt-[-0.25em]" />
                    <p className="font-semibold text-[#859ae6] text-sm">
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
              <Button className="cursor-pointer
              bg-[#c2cdf2] hover:bg-[#7189e2] text-[#243d95] hover:text-white
              border-[#aebcee]"
                variant={"outline"} size={"sm"}
                onClick={() => router.push(`${pathname}/${data.id}`)}
              >
                Lihat detail
                <ChevronRight />
              </Button>
            </div>
          </div>
        )
      })}
      {/* form@change */}
      {selected && openDialog.change && (
        <FormPeriodeSeleksi
          openDialog={openDialog.change}
          onCloseDialog={onCloseDialog}
          onSubmit={onSubmit}
          loading={loading}
          data={selected}
        />
      )}
      {/* data@pagination */}
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
                <PaginationLink isActive={page == paginate.current} className={page == paginate.current ? "bg-[#3457d5] text-white hover:bg-[#3457d5] hover:text-white border-0" : ""}
                  onClick={() => {
                    setPaginate(prev => ({ ...prev, current: page }))
                  }
                  }
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          })}
          {totalPagination > 7 && paginate.current !== totalPagination && (
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
          <PaginationItem className={paginate.current == totalPagination ? "pointer-events-none text-gray-400" : "" + "select-none cursor-pointer"}>
            <PaginationNext onClick={handleNext} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}