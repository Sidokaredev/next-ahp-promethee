import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

function SuratPengantarPerguruanTinggi() {
  return (
    <div className="px-3 block">
      <p className="text-sm">
        <span className="text-sm font-medium text-blue-500">Surat Pengantar dari Perguruan Tinggi adalah</span> dokumen resmi yang diterbitkan oleh fakultas, jurusan, atau bagian akademik sebuah universitas atau perguruan tinggi sebagai bukti bahwa mahasiswa yang bersangkutan telah mendapatkan izin dan rekomendasi untuk mengikuti kegiatan magang atau praktik kerja lapangan di suatu instansi atau lembaga tertentu.
      </p>
    </div>
  )
}
function SuratPengantarBakesbangpolDaerah() {
  return (
    <div className="px-3 block">
      <p className="text-sm">
        <span className="text-sm font-medium text-blue-500">Surat Pengantar dari Badan Kesatuan Bangsa dan Politik (Bakesbangpol)</span> daerah adalah dokumen resmi yang diterbitkan oleh Bakesbangpol Kabupaten/Kota sebagai rekomendasi administratif untuk keperluan magang di Dinas Perpustakaan dan Kearsipan Kabupaten Sidoarjo
      </p>
    </div>
  )
}
function TranskripNilai() {
  return (
    <div className="px-3 block">
      <p className="text-sm">
        <span className="text-sm font-medium text-blue-500">Transkrip Nilai</span> adalah dokumen resmi yang dikeluarkan oleh perguruan tinggi atau sekolah sebagai bukti pencapaian akademik seorang mahasiswa atau pelajar selama menempuh pendidikan. Dokumen ini memuat daftar mata kuliah atau pelajaran yang telah ditempuh, beserta nilai atau indeks prestasi yang diperoleh.
      </p>
    </div>
  )
}

export default function DialogKelengkapanDokumen({
  alurPendaftaran,
  setAlurPendaftaran
}: {
  alurPendaftaran: Record<string, boolean>;
  setAlurPendaftaran: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  return (
    <Dialog
      open={Boolean(alurPendaftaran["kelengkapan-dokumen"])}
    >
      <DialogContent className="[&>button]:hidden !max-w-3xl">
        <DialogHeader>
          <div className="flex items-center">
            <p className="grow text-lg font-medium">Periksa kelengkapan dokumen dan daftarkan</p>
            <X className="cursor-pointer" size={20}
              onClick={() => {
                setAlurPendaftaran(prev => ({
                  ...prev,
                  ["kelengkapan-dokumen"]: false,
                  ["kelengkapan-dokumen.1"]: false,
                  ["kelengkapan-dokumen.2"]: false,
                  ["kelengkapan-dokumen.3"]: false
                }))
              }}
            />
          </div>
        </DialogHeader>
        <p className="text-sm">
          Pastikan ketiga kelengkapan dokumen dibawah telah disiapkan, setelah itu klik <span className="font-medium">Daftar Sekarang</span>
        </p>
        <div className="grid grid-cols-2 gap-y-2">
          {/* Alur Registrasi */}
          <div className="cursor-pointer"
            onClick={() => {
              setAlurPendaftaran(prev => ({
                ...prev,
                ["kelengkapan-dokumen.3"]: false,
                ["kelengkapan-dokumen.2"]: false,
                ["kelengkapan-dokumen.1"]: true,
              }))
            }}
          >
            <div className={`p-1 flex items-center gap-[1em] rounded-sm ${Boolean(alurPendaftaran["kelengkapan-dokumen.1"]) && 'bg-blue-100'}`}>
              <div className={`w-[2em] h-[2em] flex items-center justify-center ${Boolean(alurPendaftaran["kelengkapan-dokumen.1"]) ? 'bg-blue-300' : 'bg-gray-200'} text-sm rounded-2xl`}>
                1
              </div>
              <div>
                <p className="text-sm">Surat Pengantar Perguruan Tinggi</p>
              </div>
            </div>
          </div>
          <div className="row-span-2">
            {Boolean(alurPendaftaran["kelengkapan-dokumen.1"]) ? (
              <SuratPengantarPerguruanTinggi />
            ) :
              Boolean(alurPendaftaran["kelengkapan-dokumen.2"]) ? (
                <TranskripNilai />
              ) :
                Boolean(alurPendaftaran["kelengkapan-dokumen.3"]) ? (
                  <SuratPengantarBakesbangpolDaerah />
                ) : ""
            }
          </div>
          <div className="cursor-pointer"
            onClick={() => {
              setAlurPendaftaran(prev => ({
                ...prev,
                ["kelengkapan-dokumen.3"]: false,
                ["kelengkapan-dokumen.1"]: false,
                ["kelengkapan-dokumen.2"]: true,
              }))
            }}
          >
            <div className={`p-1 flex items-center gap-[1em] rounded-sm ${Boolean(alurPendaftaran["kelengkapan-dokumen.2"]) && 'bg-blue-100'}`}>
              <div className={`w-[2em] h-[2em] flex items-center justify-center ${Boolean(alurPendaftaran["kelengkapan-dokumen.2"]) ? 'bg-blue-300' : 'bg-gray-200'} text-sm rounded-2xl`}>
                2
              </div>
              <div>
                <p className="text-sm">Transkrip Nilai</p>
              </div>
            </div>
          </div>
          <div className="cursor-pointer"
            onClick={() => {
              setAlurPendaftaran(prev => ({
                ...prev,
                ["kelengkapan-dokumen.2"]: false,
                ["kelengkapan-dokumen.1"]: false,
                ["kelengkapan-dokumen.3"]: true,
              }))
            }}
          >
            <div className={`p-1 flex items-center gap-[1em] rounded-sm ${Boolean(alurPendaftaran["kelengkapan-dokumen.3"]) && 'bg-blue-100'}`}>
              <div className={`w-[2em] h-[2em] flex items-center justify-center ${Boolean(alurPendaftaran["kelengkapan-dokumen.3"]) ? 'bg-blue-300' : 'bg-gray-200'} text-sm rounded-2xl`}>
                3
              </div>
              <div>
                <p className="text-sm">Surat Pengantar Bakesbangpol Daerah</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}