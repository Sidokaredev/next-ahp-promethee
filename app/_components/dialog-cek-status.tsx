import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { ArrowUpRight, X } from "lucide-react";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";

export default function DialogCekStatus({
  alurPendaftaran,
  setAlurPendaftaran
}: {
  alurPendaftaran: Record<string, boolean>;
  setAlurPendaftaran: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  return (
    <Dialog
      open={Boolean(alurPendaftaran["cek-status"])}
    >
      <DialogContent className="[&>button]:hidden !max-w-3xl">
        <DialogHeader>
          <div className="flex items-center">
            <p className="grow text-lg font-medium">Pengguna tidak ter-autentikasi</p>
            <X className="cursor-pointer" size={20}
              onClick={() => {
                setAlurPendaftaran(prev => ({
                  ...prev,
                  ["cek-status"]: false,
                }))
              }}
            />
          </div>
        </DialogHeader>
        <div className="flex gap-1">
          <p className="mb-2 text-sm">Masuk terlebih dahulu sebagai peserta untuk melihat status pendfataran periode seleksi. </p>
          {/* <Button size={"sm"} asChild className="flex justify-self-center"> */}
          <Link href={"/accounts/signin"} className="flex gap-1 text-sm text-blue-500 font-medium">
            Masuk <ArrowUpRight size={20} />
          </Link>
          {/* </Button> */}
        </div>
      </DialogContent>
    </Dialog>
  )
}