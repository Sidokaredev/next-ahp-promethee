import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { ArrowUpRight, X } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";

export default function DialogPeriodeSeleksi({
  alurPendaftaran,
  setAlurPendaftaran
}: {
  alurPendaftaran: Record<string, boolean>;
  setAlurPendaftaran: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  return (
    <Dialog
      open={Boolean(alurPendaftaran["periode-seleksi"])}
    >
      <DialogContent className="[&>button]:hidden !max-w-3xl">
        <DialogHeader>
          <div className="flex items-center">
            <p className="grow text-lg font-medium">Pilih periode seleksi yang tersedia</p>
            <X className="cursor-pointer" size={20}
              onClick={() => {
                setAlurPendaftaran(prev => ({
                  ...prev,
                  ["periode-seleksi"]: false,
                }))
              }}
            />
          </div>
        </DialogHeader>
        <div className="text-sm">
          <p>
            Pada halaman dashboard peserta, klik untuk menuju halaman
            <span className="font-medium text-blue-500 cursor-pointer" onClick={() => {
              window.open("/peserta", "_blank")
            }}> Periode Pendaftaran <ArrowUpRight className="inline" size={15} /></span>.
            Silahkan memilih periode seleksi yang memiliki status <span className="font-medium text-orange-400">Berlangsung</span>
          </p>
        </div>
        <div className="relative w-full h-[25em] border">
          <Image
            src={"/images/periode-pendaftaran.png"}
            fill
            className="object-contain"
            alt="Periode Seleksi yang tersedia"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}