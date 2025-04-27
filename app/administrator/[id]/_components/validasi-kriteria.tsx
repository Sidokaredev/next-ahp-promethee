'use client'

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BadgeCheck, Book, BookOpen, ChartBar, GraduationCap, Pencil } from "lucide-react";
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

export default function ValidasiKriteria() {
  const criteria = [
    "IPK",
    "Semester",
    "Jurusan",
    "Akreditasi"
  ];
  const pairwiseScale = [
    {
      nilai: "1",
      tingkat_kepentingan: "Sama penting",
      keterangan: "Kedua elemen sama pentingnya",
    },
    {
      nilai: "3",
      tingkat_kepentingan: "Sedikit lebih penting",
      keterangan: "Satu elemen sedikit lebih penting dari yang lain",
    },
    {
      nilai: "5",
      tingkat_kepentingan: "Lebih penting",
      keterangan: "Satu elemen lebih penting dari yang lain",
    },
    {
      nilai: "7",
      tingkat_kepentingan: "Sangat penting",
      keterangan: "Satu elemen sangat lebih penting dari yang lain",
    },
    {
      nilai: "9",
      tingkat_kepentingan: "Ekstrem penting",
      keterangan: "Satu elemen mutlak lebih penting dari yang lain",
    },
    {
      nilai: "2, 4, 6, 8",
      tingkat_kepentingan: "Nilai antara",
      keterangan: "Kompromi antara dua nilai yang berdekatan",
    }
  ];
  const saatyScales = [
    { jumlah_kriteria: 1, RI: 0.00 },
    { jumlah_kriteria: 2, RI: 0.00 },
    { jumlah_kriteria: 3, RI: 0.58 },
    { jumlah_kriteria: 4, RI: 0.90 },
    { jumlah_kriteria: 5, RI: 1.12 },
    { jumlah_kriteria: 6, RI: 1.24 },
    { jumlah_kriteria: 7, RI: 1.32 },
    { jumlah_kriteria: 8, RI: 1.41 },
    { jumlah_kriteria: 9, RI: 1.45 },
    { jumlah_kriteria: 10, RI: 1.49 },
    // { jumlah_kriteria: 11, RI: 1.51 },
    // { jumlah_kriteria: 12, RI: 1.48 },
    // { jumlah_kriteria: 13, RI: 1.56 },
    // { jumlah_kriteria: 14, RI: 1.57 },
    // { jumlah_kriteria: 15, RI: 1.59 },
  ]
  const scaleValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, (1 / 2), (1 / 3), (1 / 4), (1 / 5), (1 / 6), (1 / 7), (1 / 8), (1 / 9)];

  /* handler */
  const scaleHumanReadable = (scale: number): string => {
    const penyebut = Math.floor((10 / (scale * 10)));
    return `1/${penyebut}`;
  }
  return (
    <div className="">
      <div className="informasi-kriteria mb-3">
        <p className="mb-3 font-semibold">
          Kriteria Seleksi
        </p>
        <div className="ps-[5em] pe-[5em] flex space-x-5">
          <div className="pt-3 pb-3 flex-1 border border-[#d6ddf7] rounded-sm">
            <div className="mb-2 flex justify-center items-center">
              <ChartBar size={40} color="white" className="p-2 bg-[#3457d5] rounded-3xl" />
            </div>
            <p className="font-semibold text-sm text-center">
              Indeks Prestasi Kumulatif (IPK)
            </p>
          </div>
          <div className="pt-3 pb-3 flex-1 border border-[#d6ddf7] rounded-sm">
            <div className="mb-2 flex justify-center items-center">
              <BookOpen size={40} color="white" className="p-2 bg-[#3457d5] rounded-3xl" />
            </div>
            <p className="font-semibold text-sm text-center">
              Semester
            </p>
          </div>
          <div className="pt-3 pb-3 flex-1 border border-[#d6ddf7] rounded-sm">
            <div className="mb-2 flex justify-center items-center">
              <GraduationCap size={40} color="white" className="p-2 bg-[#3457d5] rounded-3xl" />
            </div>
            <p className="font-semibold text-sm text-center">
              Jurusan
            </p>
          </div>
          <div className="pt-3 pb-3 flex-1 border border-[#d6ddf7] rounded-sm">
            <div className="mb-2 flex justify-center items-center">
              <BadgeCheck size={40} color="white" className="p-2 bg-[#3457d5] rounded-3xl" />
            </div>
            <p className="font-semibold text-sm text-center">
              Akreditasi Perguruan Tinggi
            </p>
          </div>
        </div>
      </div>
      <div className="skala-perbandingan mb-3">
        <p className="mb-3 font-semibold">
          Skala Perbandingan Berpasangan (Pairwise Comparison Scale)
        </p>
        <div className="ps-[5em] pe-[5em]">
          <Table className="">
            <TableHeader className="bg-[#3457d5]">
              <TableRow className="hover:bg-primary">
                <TableHead className="text-white rounded-ss-sm">Nilai</TableHead>
                <TableHead className="text-white">Tingkat Kepentingan</TableHead>
                <TableHead className="text-white rounded-se-sm">Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pairwiseScale.map((scale, idx) => {
                return (
                  <TableRow key={idx}>
                    <TableCell>{scale.nilai}</TableCell>
                    <TableCell>{scale.tingkat_kepentingan}</TableCell>
                    <TableCell>{scale.keterangan}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="matriks-skala-perbandingan-berpasangan mb-3">
        <p className="mb-3 font-semibold">
          Matriks Skala Perbandingan Berpasangan (Pairwise Matrix)
        </p>
        <div className="ps-[5em] pe-[5em]">
          <div className="matrix-table grid grid-cols-5 font-semibold text-base text-gray-600">
            <div className="p-3 font-bold text-[#3457d5]">
              Nilai Matrik
            </div>
            <div className="p-3 bg-gray-100 text-gray-800 border border-[#ebeefb]">
              IPK
            </div>
            <div className="p-3 bg-gray-100 text-gray-800 border border-[#ebeefb]">
              Semester
            </div>
            <div className="p-3 bg-gray-100 text-gray-800 border border-[#ebeefb]">
              Jurusan
            </div>
            <div className="p-3 bg-gray-100 text-gray-800 border border-[#ebeefb] rounded-se-sm">
              Akreditasi
            </div>
            {Array.from({ length: 20 }).map((_, idx) => {
              if (idx % (criteria.length + 1) == 0) {
                let criteriaIdx = criteria.length + 1
                return (
                  <div key={idx} className="p-2 bg-gray-100 text-gray-800 border border-[#ebeefb]">
                    {criteria[idx / criteriaIdx]}
                  </div>
                )
              }
              return (
                <div key={idx} className="p-2 border border-[#ebeefb]">
                  <Select>
                    <SelectTrigger className="w-[100%] border-none shadow-none focus-visible:ring-[#9aabea]">
                      <SelectValue placeholder="Pilih nilai skala" />
                    </SelectTrigger>
                    <SelectContent>
                      {scaleValues.map((value, idx) => {
                        return (
                          <SelectItem key={idx} value={value.toString()}>
                            {value >= 1 ? value : scaleHumanReadable(value)}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )
            })}
            <div className="p-2 bg-[#3457d5] text-white rounded-es-sm">
              Total
            </div>
            <div className="p-2 font-bold text-sm border border-[#ebeefb]">
              Total Column 1
            </div>
            <div className="p-2 font-bold text-sm border border-[#ebeefb]">
              Total Column 2
            </div>
            <div className="p-2 font-bold text-sm border border-[#ebeefb]">
              Total Column 3
            </div>
            <div className="p-2 font-bold text-sm border border-[#ebeefb] rounded-ee-sm">
              Total Column 4
            </div>
          </div>
          <div className="mt-2 flex justify-end">
            <Button size={"sm"} className="cursor-pointer">
              <Pencil />
              Ubah nilai matrix
            </Button>
          </div>
        </div>
      </div>
      <div className="normalisasi-matrik-skala-perbandingan mb-3">
        <p className="mb-3 font-semibold">
          Normalisasi Nilai Matrik
        </p>
        <div className="ps-[5em] pe-[5em]">
          <div className="matrix-table grid grid-cols-6 font-semibold text-base text-gray-600">
            <div className="p-3 font-bold text-[#3457d5]">
              Normalisasi
            </div>
            <div className="p-3 bg-gray-100 text-gray-800 border border-[#ebeefb]">
              IPK
            </div>
            <div className="p-3 bg-gray-100 text-gray-800 border border-[#ebeefb]">
              Semester
            </div>
            <div className="p-3 bg-gray-100 text-gray-800 border border-[#ebeefb]">
              Jurusan
            </div>
            <div className="p-3 bg-gray-100 text-gray-800 border border-[#ebeefb] rounded-se-sm">
              Akreditasi
            </div>
            <div className="p-3 bg-gray-100 text-gray-800 border border-[#ebeefb] rounded-se-sm">
              Bobot Kriteria
            </div>
            {Array.from({ length: 24 }).map((_, idx) => {
              if (idx % (criteria.length + 2) == 0) {
                let criteriaIdx = criteria.length + 2
                return (
                  <div key={idx} className="p-2 bg-gray-100 text-gray-800 border border-[#ebeefb]">
                    {criteria[idx / criteriaIdx]}
                  </div>
                )
              }
              if ((idx + 1) % (criteria.length + 2) == 0) {
                return (
                  <div key={idx} className="p-2 border border-[#ebeefb]">
                    <p>
                      Bobot
                    </p>
                  </div>
                )
              }
              return (
                <div key={idx} className="p-2 border border-[#ebeefb]">
                  <p>
                    Nilai
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="konsistensi-rasio mb-3">
        <p className="mb-3 font-semibold">
          Konsistensi Rasio
        </p>
        <div className="ps-[5em] pe-[5em]">
          <p className="mb-3 font-semibold text-sm text-gray-600">
            Tabel Random Index (Saaty's Scale)
          </p>
          <div className="mb-3">
            <Table className="">
              <TableHeader className="bg-[#3457d5]">
                <TableRow className="hover:bg-primary">
                  <TableHead className="text-white rounded-ss-sm">
                    Jumlah Kriteria <InlineMath math="n" />
                  </TableHead>
                  <TableHead className="text-white">
                    Nilai <InlineMath math="RI" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saatyScales.map((scale, idx) => {
                  return (
                    <TableRow key={idx}>
                      <TableCell>{scale.jumlah_kriteria}</TableCell>
                      <TableCell>{scale.RI.toFixed(2)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          <div className="matrix-table grid grid-cols-7 font-semibold text-base text-gray-600">
            <div className="p-3 font-bold text-[#3457d5]">
              Konsistensi
            </div>
            <div className="p-3 bg-gray-100 text-gray-800 border border-[#ebeefb]">
              IPK
            </div>
            <div className="p-3 bg-gray-100 text-gray-800 border border-[#ebeefb]">
              Semester
            </div>
            <div className="p-3 bg-gray-100 text-gray-800 border border-[#ebeefb]">
              Jurusan
            </div>
            <div className="p-3 bg-gray-100 text-gray-800 border border-[#ebeefb] rounded-se-sm">
              Akreditasi
            </div>
            <div className="p-3 bg-gray-100 text-gray-800 border border-[#ebeefb] rounded-se-sm">
              Jumlah
            </div>
            <div className="p-3 bg-gray-100 text-gray-800 border border-[#ebeefb] rounded-se-sm">
              Nilai Konsistensi
            </div>
            {Array.from({ length: 28 }).map((_, idx) => {
              if (idx % (criteria.length + 3) == 0) {
                let criteriaIdx = criteria.length + 3
                return (
                  <div key={idx} className="p-2 bg-gray-100 text-gray-800 border border-[#ebeefb]">
                    {criteria[idx / criteriaIdx]}
                  </div>
                )
              }
              if ((idx + 1) % (criteria.length + 2) == 0) {
                return (
                  <div key={idx} className="p-2 border border-[#ebeefb]">
                    <p>
                      Bobot
                    </p>
                  </div>
                )
              }
              if ((idx + 1) % (criteria.length + 3) == 0) {
                return (
                  <div key={idx} className="p-2 border border-[#ebeefb]">
                    <p>
                      Konsistensi
                    </p>
                  </div>
                )
              }
              return (
                <div key={idx} className="p-2 border border-[#ebeefb]">
                  <p>
                    Nilai
                  </p>
                </div>
              )
            })}
          </div>
          <div className="mt-5">
            <div className="flex font-semibold">
              <p className="basis-[40%] p-2 bg-primary text-white rounded-ss-sm">
                Indek Konsistensi (Consistency Index)
              </p>
              <div className="basis-[60%] p-2 border border-gray-200 rounded-se-sm">
                <InlineMath math="CI = \frac{\lambda_{\text{max}} - n}{n - 1} = \frac{{value - n}}{n-1} = " />
              </div>
            </div>
            <div className="flex font-semibold">
              <p className="basis-[40%] p-2 bg-primary text-white rounded-es-sm">
                Rasio Konsistensi (Consistency Ratio)
              </p>
              <div className="basis-[60%] p-2 border border-gray-200 rounded-ee-sm">
                <InlineMath math="CR = \frac{CI}{RI}" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}