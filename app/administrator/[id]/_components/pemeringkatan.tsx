'use client'

import { NotificationType } from "@/app/globals-type";
import StandardPagination from "@/components/navigations/standard-pagination";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { prometheeInitKategori, prometheeInitKeyProps } from "@/src/services/administrator/constants";
import { GetPemeringkatan, RankingAlternatifType } from "@/src/services/administrator/data-algrthm";
import { GetPendaftarDiterima, UpdateStatusPendaftar } from "@/src/services/administrator/pendaftar";
import { CloudAlert, MoreVertical, Search, UserCheck } from "lucide-react";
import { useParams } from "next/navigation"
import { ChangeEvent, SetStateAction, useEffect, useState } from "react";

export default function Pemeringkatan({
  setNotification,
}: {
  setNotification: React.Dispatch<SetStateAction<NotificationType>>;
}) {
  // hook@params
  const params = useParams<{ id: string; }>();

  // state@ranking
  const [ranking, setRanking] = useState<RankingAlternatifType[]>([]);
  const [selectedRanking, setSelectedRanking] = useState<RankingAlternatifType>();
  // state@diterima
  const [pesertaDiterima, setPesertaDiterima] = useState<number[]>([]);
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
  // state@condition
  const [query, setQuery] = useState<string>("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [refetch, setRefetch] = useState<boolean>(false);
  const [err, setErr] = useState<Error>();
  // constant@ranking
  const filteredRanking = ranking.filter((alt) => alt.nama_lengkap.toLowerCase().includes(query.toLowerCase()));
  const paginatedRanking = filteredRanking.slice(((10 * paginate.current) - 10), 10 * paginate.current);

  // onSubmit@konfirmasi
  const fetchKonfirmasiPendaftar = async () => {
    setLoading(true);

    const update = await UpdateStatusPendaftar({
      id: selectedRanking?.id as number,
      status: "diterima",
    });

    switch (update.response) {
      case "error":
        setLoading(false);
        return setNotification({
          show: true,
          name: update.name,
          message: update.message,
        });

      case "success":
        setLoading(false);
        setOpen(prev => ({
          ...prev,
          ["dialog"]: false,
        }));
        setRefetch(prev => !prev);
        return setNotification({
          show: true,
          name: update.name,
          message: update.message,
        })

      default:
        break;
    }
  }

  useEffect(() => {
    (async () => {
      const req = await GetPemeringkatan(
        Number(params.id),
        {
          keyProps: prometheeInitKeyProps,
          kategori: prometheeInitKategori,
        }
      );
      switch (req.response) {
        case "error":
          const err = new Error(req.message, { cause: req.cause });
          err.name = req.name;
          setErr(err);
          return setNotification({
            show: true,
            name: req.name,
            message: req.message,
          })

        case "data":
          return setRanking(req.data);

        default:
          break;
      }
    })();
  }, []);
  useEffect(() => {
    (async () => {
      const req = await GetPendaftarDiterima(Number(params.id));
      switch (req.response) {
        case "error":
          const err = new Error(req.message, { cause: req.cause });
          err.name = req.name;
          setErr(err);
          return setNotification({
            show: true,
            name: req.name,
            message: req.message,
          })

        case "data":
          return setPesertaDiterima(req.data.map(alt => alt.id));

        default:
          break;
      }
    })();
  }, [refetch]);
  return (
    <div className="">
      {/* message@error */}
      {err && (
        <div className="m-3 pt-2 pb-2 ps-3 pe-3 flex gap-x-3 bg-red-50 border border-red-200 rounded-sm">
          <CloudAlert className="text-red-500" />
          <p className="font-bold text-base text-red-500">
            {err.name}
            <br />
            <span className="font-normal text-sm text-gray-600">
              {err.message}
            </span>
          </p>
        </div>
      )}
      <div className="mt-[1em] flex justify-between items-center">
        <p className="font-semibold text-gray-800">
          Hasil Pemeringkatan Alternatif
        </p>
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
      <div className="custom-table mt-[1em] mb-[1em]">
        <div className="row flex bg-primary font-semibold text-sm text-white rounded-t-sm">
          <div className="basis-[5%] column p-3 border-r">
            No.
          </div>
          <div className="column basis-[25%] p-3 border-r">
            Nama Lengkap
          </div>
          <div className="column basis-[19%] p-3 border-r">
            Indek Prestasi Kumulatif
          </div>
          <div className="column basis-[13%] p-3 border-r">
            Semester
          </div>
          <div className="column basis-[16%] p-3 border-r">
            Jurusan
          </div>
          <div className="column basis-[9%] p-3 border-r">
            Akreditasi
          </div>
          <div className="column basis-[8%] p-3 border-r">
            Net Flow
          </div>
          <div className="column basis-[5%] p-3">
            Opsi
          </div>
        </div>
        {paginatedRanking.map((alt, altIdx) => {
          return (
            <div key={altIdx} className={`row flex font-semibold text-sm text-gray-600 border-b border-x ${pesertaDiterima.includes(alt.id) ? "bg-green-50 hover:bg-green-100 border-green-200" : "hover:bg-gray-100"}`}>
              <div className="basis-[5%] column p-3 border-r text-gray-700">
                {altIdx + 1 + ((10 * paginate.current) - 10) + "."}
              </div>
              <div className="column basis-[25%] p-3 border-r">
                <p>
                  {alt.nama_lengkap}
                </p>
                <p className="font-normal">
                  {alt.universitas}
                </p>
              </div>
              <div className="column basis-[19%] p-3 border-r">
                {alt.indek_prestasi_kumulatif}
              </div>
              <div className="column basis-[13%] p-3 border-r">
                {alt.semester}
              </div>
              <div className="column basis-[16%] p-3 border-r">
                {alt.jurusan}
              </div>
              <div className="column basis-[9%] p-3 border-r">
                {alt.akreditasi}
              </div>
              <div className="column basis-[8%] p-3 border-r">
                {alt.net_flow.toFixed(3)}
              </div>
              <div className="column basis-[5%] p-3">
                <DropdownMenu
                  open={open[`${altIdx}dropdown`]}
                  onOpenChange={(open: boolean) => {
                    setOpen(prev => ({
                      ...prev,
                      [`${altIdx}dropdown`]: open,
                    }))
                  }}
                >
                  <DropdownMenuTrigger asChild className="cursor-pointer"
                  >
                    <Button size={"icon"} variant={"ghost"} className="cursor-pointer"
                      onClick={() => {
                        setOpen(prev => ({
                          ...prev,
                          [`${altIdx}dropdown`]: true,
                        }))
                      }}
                    >
                      <MoreVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[17em]">
                    <DropdownMenuItem className="font-semibold text-gray-800 cursor-pointer"
                      disabled={pesertaDiterima.includes(alt.id)}
                      onClick={() => {
                        setSelectedRanking(alt);
                        setOpen(prev => ({
                          ...prev,
                          ["dialog"]: true,
                          [`${altIdx}dropdown`]: false,
                        }));
                      }}
                    >
                      {pesertaDiterima.includes(alt.id) ? "Peserta telah diterima" : "Terima sebagai peserta magang"}
                      <DropdownMenuShortcut>
                        <UserCheck />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div >
          )
        })}
      </div >
      <StandardPagination
        paginate={paginate}
        setPaginate={setPaginate}
        totalData={filteredRanking.length}
      />
      <Dialog
        open={Boolean(open["dialog"])}
      >
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault() // ⛔ cegah dialog dari tertutup saat klik luar
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault() // ⛔ cegah dialog dari tertutup via tombol Esc
          }}
          className="[&>button]:hidden !max-w-lg"
        // forceMount
        >
          <DialogHeader>
            <DialogTitle className="text-base">
              Konfirmasi Penerimaan Peserta Magang
            </DialogTitle>
          </DialogHeader>
          <div>
            <p className="text-gray-600">
              Dengan ini dinyatakan bahwa peserta bernama <span className="text-blue-600 font-semibold">{selectedRanking?.nama_lengkap}</span> dari <span className="text-blue-600 font-semibold">{selectedRanking?.universitas}</span> diterima sebagai peserta magang di Dinas Perpustakaan dan Kearsipan.
            </p>
          </div>
          <DialogFooter>
            <Button variant={"secondary"} size={"sm"} className="cursor-pointer"
              disabled={loading}
              onClick={() => {
                setOpen(prev => ({
                  ...prev,
                  ["dialog"]: false,
                }))
              }}
            >
              Batal
            </Button>
            <Button size={"sm"} className="cursor-pointer"
              disabled={loading}
              onClick={async () => {
                await fetchKonfirmasiPendaftar();
              }}
            >
              Konfirmasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  )
}