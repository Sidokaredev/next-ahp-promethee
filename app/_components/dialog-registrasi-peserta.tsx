import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { ArrowUpRight, BookText, X } from "lucide-react";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";

function KunjungiHalamanPendaftaran() {
  return (
    <div className="p-2 block">
      <p className="mb-2 text-sm">
        Kunjungi halaman pendaftaran dengan klik tombol berikut:
      </p>
      <Button size={"sm"} asChild className="flex justify-self-center">
        <Link href={"/accounts/signup"} target="_blank">
          Halaman Pendaftaran <ArrowUpRight size={20} />
        </Link>
      </Button>
    </div>
  )
}

function IsiDataDiri() {
  return (
    <div className="p-2 block">
      <div className="mb-2 flex items-center gap-1 text-blue-500">
        <BookText size={20} />
        <p className="text-sm font-medium">
          Lengkapi data diri sebagai mahasiswa/i.
        </p>
      </div>
      <div className="grid grid-cols-[10%_90%]">
        <div className="w-[2em]">
          1.
        </div>
        <div>
          <p className="text-sm">
            Pastikan untuk mengisi data nama lengkap, NIM, nomor telepon aktif dan email dengan benar
          </p>
        </div>
        <div className="w-[2em]">
          2.
        </div>
        <div>
          <p className="text-sm">
            Isikan nama perguruan tinggi dan pilih akreditasi yang sesuai.
          </p>
        </div>
        <div className="w-[2em]">
          3.
        </div>
        <div>
          <p className="text-sm">
            Pastikan memilih program studi berdasarkan opsi bidang ilmu yang tersedia.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function DialogRegistrasiPeserta({
  alurPendaftaran,
  setAlurPendaftaran
}: {
  alurPendaftaran: Record<string, boolean>;
  setAlurPendaftaran: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  return (
    <Dialog
      open={Boolean(alurPendaftaran["registrasi"])}
    >
      <DialogContent className="[&>button]:hidden !max-w-3xl">
        <DialogHeader>
          <div className="flex items-center">
            <p className="grow text-lg font-medium">Tahapan Registrasi Peserta</p>
            <X className="cursor-pointer" size={20}
              onClick={() => {
                setAlurPendaftaran(prev => ({
                  ...prev,
                  ["registrasi"]: false,
                  ["registrasi.step1"]: false,
                  ["registrasi.step2"]: false,
                }))
              }}
            />
          </div>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-y-2">
          {/* Alur Registrasi */}
          <div className="cursor-pointer"
            onClick={() => {
              setAlurPendaftaran(prev => ({
                ...prev,
                ["registrasi.step2"]: false,
                ["registrasi.step1"]: true,
              }))
            }}
          >
            <div className={`p-1 flex items-center gap-[1em] rounded-sm ${Boolean(alurPendaftaran["registrasi.step1"]) && 'bg-blue-100'}`}>
              <div className={`w-[2em] h-[2em] flex items-center justify-center ${Boolean(alurPendaftaran["registrasi.step1"]) ? 'bg-blue-300' : 'bg-gray-200'} text-sm rounded-2xl`}>
                1
              </div>
              <div>
                <p className="text-sm">Kunjungi halaman pendaftaran</p>
              </div>
            </div>
          </div>
          <div className="row-span-2">
            {Boolean(alurPendaftaran["registrasi.step1"]) ? (
              <KunjungiHalamanPendaftaran />
            ) : (
              <IsiDataDiri />
            )}
          </div>
          <div className="cursor-pointer"
            onClick={() => {
              setAlurPendaftaran(prev => ({
                ...prev,
                ["registrasi.step1"]: false,
                ["registrasi.step2"]: true,
              }))
            }}
          >
            <div className={`p-1 flex items-center gap-[1em] rounded-sm ${Boolean(alurPendaftaran["registrasi.step2"]) && 'bg-blue-100'}`}>
              <div className={`w-[2em] h-[2em] flex items-center justify-center ${Boolean(alurPendaftaran["registrasi.step2"]) ? 'bg-blue-300' : 'bg-gray-200'} text-sm rounded-2xl`}>
                2
              </div>
              <div>
                <p className="text-sm">Isikan seluruh data sesuai dengan form</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}