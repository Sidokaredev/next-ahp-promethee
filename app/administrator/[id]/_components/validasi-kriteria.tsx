'use client'

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BadgeCheck, BookOpen, ChartBar, CloudAlert, GraduationCap, Pencil } from "lucide-react";
import 'katex/dist/katex.min.css'
import { InlineMath } from 'react-katex'
import React, { SetStateAction, useEffect, useState } from "react";
import { AHP } from "@/src/services/ahp-algrthm/main";
import { AddSkalaPerbandingan, ChangeSkalaPerbandingan, GetKriteria, GetSkalaPerbandingan, SkalaPerbandinganType } from "@/src/services/administrator/data-algrthm";
import { useParams } from "next/navigation";
import { NotificationType } from "@/app/globals-type";

export default function ValidasiKriteria({
  setNotification,
}: {
  setNotification: React.Dispatch<SetStateAction<NotificationType>>;
}) {
  // hook@params
  const params = useParams<{ id: string }>();
  // state@kriteria
  const [dataKriteria, setDataKriteria] = useState<string[]>([]);
  // state@pairwise-matrix
  const [dataSkalaPerbandingan, setDataSkalaPerbandingan] = useState<Record<string, SkalaPerbandinganType>>();
  const [formSkalaPerbandingan, setFormSkalaPerbandingan] = useState<Record<string, string>>({});
  const [editMatrix, setEditMatrix] = useState<boolean>(false);
  // state@message
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<Error>();

  // data@constant
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
  ]
  const scaleValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, (1 / 2), (1 / 3), (1 / 4), (1 / 5), (1 / 6), (1 / 7), (1 / 8), (1 / 9)];

  // class@AHP
  const ahpInstance = new AHP({ criteria: dataKriteria });
  const scaleMatrix = ahpInstance.PairwiseComparisonFields();
  if (dataSkalaPerbandingan) {
    ahpInstance.StorePairwiseMatrix(dataSkalaPerbandingan).Validate();
  }

  /* handler */
  const scaleHumanReadable = (scale: number): string => {
    const penyebut = Math.floor((10 / (scale * 10)));
    return `1/${penyebut}`;
  }

  // onSubmit@skala-perbandingan
  const AddOrChangeSkalaPerbandingan = async () => {
    setLoading(true);

    if (dataSkalaPerbandingan) {
      const values: Record<string, SkalaPerbandinganType> = {};
      for (const key in formSkalaPerbandingan) {
        values[key] = {
          ...dataSkalaPerbandingan[key],
          nilai: formSkalaPerbandingan[key],
        };
      }

      const change = await ChangeSkalaPerbandingan(Number(params.id), values);
      switch (change.response) {
        case "error":
          setLoading(false);
          const err = new Error(change.message, { cause: change.cause });
          err.name = change.name;
          return setErr(err);

        case "success":
          setLoading(false);
          setEditMatrix(false);
          setDataSkalaPerbandingan(values);
          return setNotification({
            show: true,
            name: change.name,
            message: change.message
          });

        default:
          break;
      }
    }

    const add = await AddSkalaPerbandingan(Number(params.id), formSkalaPerbandingan);
    if (add.response === "error") {
      setLoading(false);
      return setErr(add);
    } else if (add.response == "success") {
      const select = await GetSkalaPerbandingan(Number(params.id));
      switch (select.response) {
        case "error":
          setLoading(false);
          return setErr(select);

        case "data":
          setLoading(false);
          setEditMatrix(false);
          setErr(undefined);
          setDataSkalaPerbandingan(select.data);
          return setNotification({
            show: true,
            name: add.name,
            message: add.message
          });

        default:
          break;
      }
    }
  }

  useEffect(() => {
    // getAll@kriteria
    (async () => {
      const req = await GetKriteria();
      switch (req.response) {
        case "error":
          const err = new Error(req.message, { cause: req.cause });
          err.name = req.name;
          return setErr(err);

        case "data":
          return setDataKriteria(req.data.map(data => data.nama));

        default:
          break;
      }
    })();
    // getAll@skala-perbandingan
    (async () => {
      const req = await GetSkalaPerbandingan(Number(params.id));
      switch (req.response) {
        case "error":
          setNotification({
            show: true,
            name: req.name,
            message: req.message,
          });

          const err = new Error(req.message, { cause: req.cause });
          err.name = req.name;
          return setErr(err);

        case "data":
          const form: Record<string, string> = {};
          for (const key in req.data) {
            form[key] = req.data[key].nilai;
          }

          setFormSkalaPerbandingan(form);
          return setDataSkalaPerbandingan(req.data);

        default:
          break;
      }
    })();
  }, []);
  return (
    <div className="">
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
      <div className="informasi-kriteria mb-5">
        <p className="mb-3 ps-3 font-semibold">
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
      <div className="skala-perbandingan mb-5">
        <p className="mb-3 ps-3 font-semibold">
          Skala Perbandingan Berpasangan (Pairwise Comparison Scale)
        </p>
        <div className="ps-[5em] pe-[5em]">
          <Table>
            <TableHeader className="bg-[#3457d5]">
              <TableRow className="hover:bg-primary">
                <TableHead className="text-white border-r rounded-ss-sm">Nilai</TableHead>
                <TableHead className="text-white border-r">Tingkat Kepentingan</TableHead>
                <TableHead className="text-white rounded-se-sm">Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pairwiseScale.map((scale, idx) => {
                return (
                  <TableRow key={idx}>
                    <TableCell className="border">{scale.nilai}</TableCell>
                    <TableCell className="border">{scale.tingkat_kepentingan}</TableCell>
                    <TableCell className="border">{scale.keterangan}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="matriks-skala-perbandingan-berpasangan mb-5">
        <p className="mb-3 ps-3 font-semibold">
          Matriks Skala Perbandingan Berpasangan (Pairwise Matrix)
        </p>
        <div className="ps-[5em] pe-[5em]">
          <div className="row-data flex items-stretch text-sm">
            <div className="basis-[20%] p-3 font-bold text-[#3457d5] border border-[#ebeefb] rounded-ss-sm">
              Nilai Matrik
            </div>
            {dataKriteria.map((data, idx) => {
              const isLastIndex = (idx == dataKriteria.length - 1);
              return (
                <div key={idx} className={`basis-[20%] p-3 bg-gray-100 font-semibold text-gray-800 border border-[#ebeefb] ${isLastIndex ? "rounded-se-sm" : ""}`}>
                  {data}
                </div>
              )
            })}
          </div>
          {/* pairwise@matrix-scale */}
          {scaleMatrix.map((matrixRow, rowIdx) => {
            return (
              <div key={rowIdx} className="row-data flex items-stretch font-semibold text-sm text-gray-800">
                <div className="basis-[20%] p-3 flex items-center bg-gray-100 border border-[#ebeefb]">
                  <p>
                    {dataKriteria[rowIdx]}
                  </p>
                </div>
                {matrixRow.map((matrixColumn, columnIdx) => {
                  const value = formSkalaPerbandingan[matrixColumn];
                  const isPriorityMatrix = columnIdx >= rowIdx;
                  return (
                    <div key={columnIdx} className={`basis-[20%] p-1 ${isPriorityMatrix ? "bg-amber-200 border-amber-300 text-black" : "border-[#ebeefb]"} border`}>
                      <Select
                        disabled={!editMatrix}
                        onValueChange={(value: string) => {
                          setFormSkalaPerbandingan(prev => ({ ...prev, [matrixColumn]: value }));
                        }}
                        value={Number(value).toFixed(3)}
                      >
                        <SelectTrigger className="w-[100%] font-semibold border-none shadow-none focus-visible:ring-[#9aabea] cursor-pointer">
                          <SelectValue placeholder="Pilih nilai skala" />
                        </SelectTrigger>
                        <SelectContent>
                          {scaleValues.map((value, idx) => {
                            return (
                              <SelectItem key={idx} value={value.toFixed(3)}>
                                {value >= 1 ? value : scaleHumanReadable(value)}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  )
                })}
              </div>
            )
          })}
          {/* pairwise@total */}
          <div className="row-data flex items-stretch font-semibold text-sm">
            <div className="basis-[20%] p-3 bg-[#3457d5] text-white rounded-es-sm">
              Total
            </div>
            {!dataSkalaPerbandingan && dataKriteria.map((data, idx) => {
              return (
                <div key={idx} className="basis-[20%] p-3 border border-[#ebeefb]">
                  {data}
                </div>
              )
            })}
            {dataSkalaPerbandingan && dataKriteria.map((data, idx) => {
              const isLastIndex = idx == dataKriteria.length - 1;
              const pairwiseInTotal = ahpInstance.pairwiseMatrixInTotal[data];
              return (
                <div key={idx} className={`basis-[20%] p-2 font-semibold text-sm text-gray-800 border bg-blue-100 border-blue-200 ${isLastIndex ? "rounded-ee-sm" : ""}`}>
                  {pairwiseInTotal.toFixed(3)}
                </div>
              )
            })}
          </div>
          <div className="mt-2 flex justify-end">
            {editMatrix && (
              <div className="flex gap-x-2">
                <Button size={"default"} variant={"secondary"} className="cursor-pointer border"
                  disabled={loading}
                  onClick={() => setEditMatrix(false)}
                >
                  Batal
                </Button>
                <Button size={"default"} variant={"default"} className="cursor-pointer"
                  disabled={loading}
                  onClick={AddOrChangeSkalaPerbandingan}
                >
                  Simpan
                </Button>
              </div>
            )}
            {!editMatrix && (
              <Button size={"default"} className="cursor-pointer"
                onClick={() => setEditMatrix(true)}
              >
                <Pencil />
                Ubah Skala Perbandingan
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="normalisasi-matrik-skala-perbandingan mb-5">
        <p className="mb-3 ps-3 font-semibold">
          Normalisasi Nilai Matrik
        </p>
        <div className="ps-[5em] pe-[5em]">
          <div className="matrix-table flex items-stretch font-semibold text-sm text-gray-800">
            <div className="basis-[16.666%] p-2 flex items-center font-bold text-base text-[#3457d5] border border-[#ebeefb] rounded-ss-sm">
              Normalisasi
            </div>
            {dataKriteria.map((data, idx) => {
              return (
                <div key={idx} className="basis-[16.666%] p-2 flex items-center bg-gray-100 border border-[#ebeefb]">
                  {data}
                </div>
              )
            })}
            <div className="basis-[16.666%] p-3 flex items-center bg-primary text-white rounded-se-sm">
              Bobot Kriteria
            </div>
          </div>
          {dataKriteria.map((row, rowIndex) => {
            const isLastIndex = rowIndex == dataKriteria.length - 1;
            const weight = ahpInstance.pairwiseMatrixInWeight[row];
            return (
              <div key={rowIndex} className="flex items-stretch font-semibold text-sm text-gray-800">
                <div className={`basis-[16.666%] p-2 flex items-center bg-gray-100 border border-[#ebeefb] ${isLastIndex ? "rounded-es-sm" : ""}`}>
                  <p>
                    {dataKriteria[rowIndex]}
                  </p>
                </div>
                {dataKriteria.map((column, columnIndex) => {
                  const normalizedMatrix = ahpInstance.pairwiseMatrixInNormalized[`${row}@${column}`];
                  return (
                    <div key={columnIndex} className="basis-[16.666%] p-3 flex items-center text-gray-500 border border-[#ebeefb]">
                      {normalizedMatrix?.toFixed(3)}
                    </div>
                  )
                })}
                <div className={`basis-[16.666%] p-3 flex items-center border bg-blue-100 border-blue-200 ${isLastIndex ? "rounded-ee-sm" : ""}`}>
                  {weight?.toFixed(3)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="konsistensi-rasio mb-3">
        <p className="mb-3 ps-3 font-semibold">
          Konsistensi Rasio
        </p>
        <div className="ps-[5em] pe-[5em]">
          <p className="mb-3 font-semibold text-sm text-gray-600">
            Tabel Random Index (Saaty&apos;s Scale)
          </p>
          <div className="mb-3">
            <Table>
              <TableHeader className="bg-[#3457d5]">
                <TableRow className="hover:bg-primary">
                  <TableHead className="text-white rounded-ss-sm">
                    Jumlah Kriteria <InlineMath math="n" />
                  </TableHead>
                  <TableHead className="text-white rounded-se-sm">
                    Nilai <InlineMath math="RI" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saatyScales.map((scale, idx) => {
                  return (
                    <TableRow key={idx}>
                      <TableCell className="border">{scale.jumlah_kriteria}</TableCell>
                      <TableCell className="border">{scale.RI.toFixed(2)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          <div className="matrix-table flex items-stretch font-semibold text-sm text-gray-800">
            <div className="basis-[calc(100%/7)] p-2 flex items-center font-bold text-base text-[#3457d5] border border-[#ebeefb] rounded-ss-sm">
              Konsistensi
            </div>
            {dataKriteria.map((data, idx) => {
              return (
                <div key={idx} className="basis-[calc(100%/7)] p-2 flex items-center bg-gray-100 border border-[#ebeefb]">
                  {data}
                </div>
              )
            })}
            <div className="basis-[calc(100%/7)] p-3 flex items-center bg-amber-300 border-none border-[#ebeefb]">
              Jumlah
            </div>
            <div className="basis-[calc(100%/7)] p-3 flex items-center bg-blue-400 border-none border-[#ebeefb] rounded-se-sm">
              Nilai Konsistensi
            </div>
          </div>
          {dataKriteria.map((row, rowIndex) => {
            const consistencyInTotal = ahpInstance.consistencyInTotal[row];
            const consistencyInLamda = ahpInstance.consistencyInLamda[row];
            return (
              <div key={rowIndex} className="flex items-stretch font-semibold text-sm text-gray-800">
                <div className="basis-[calc(100%/7)] p-2 flex items-center bg-gray-100 border border-[#ebeefb]">
                  <p>
                    {dataKriteria[rowIndex]}
                  </p>
                </div>
                {dataKriteria.map((column, columnIndex) => {
                  const matrixConsistency = ahpInstance.pairwiseMatrixInConsistency[`${row}@${column}`];
                  return (
                    <div key={columnIndex} className="basis-[calc(100%/7)] p-3 flex items-center text-gray-500 border border-[#ebeefb]">
                      {matrixConsistency?.toFixed(3)}
                    </div>
                  )
                })}
                <div className="basis-[calc(100%/7)] p-3 flex items-center bg-amber-50 text-gray-500 border border-[#ebeefb]">
                  {consistencyInTotal?.toFixed(3)}
                </div>
                <div className="basis-[calc(100%/7)] p-3 flex items-center bg-blue-50 text-gray-500 border border-blue-200">
                  {consistencyInLamda?.toFixed(3)}
                </div>
              </div>
            )
          })}
          <div className="flex items-stretch font-semibold text-white">
            <div className="grow p-3 text-sm border border-[#ebeefb] rounded-es-sm">
            </div>
            <div className="basis-[calc(100%/7)] p-3 flex items-center bg-primary text-base border-r">
              <InlineMath math="\lambda_{\text{max}}" />
            </div>
            <div className="basis-[calc(100%/7)] p-3 flex items-center bg-primary text-sm rounded-ee-sm">
              {ahpInstance.consistencyLamdaMax?.toFixed(3)}
            </div>
          </div>
          <div className="mt-5">
            <div className="flex font-semibold">
              <p className="basis-[40%] p-2 bg-primary text-white rounded-ss-sm">
                Indek Konsistensi (Consistency Index)
              </p>
              <div className="basis-[60%] p-2 border border-gray-200 rounded-se-sm">
                <InlineMath math={`CI = \\frac{\\lambda_{\\text{max}} - n}{n - 1} = \\frac{${ahpInstance.consistencyLamdaMax?.toFixed(3)} - ${dataKriteria.length}}{${dataKriteria.length} - 1} = ${ahpInstance.consistencyIndex.toFixed(3)}`} />
              </div>
            </div>
            <div className="flex font-semibold">
              <p className="basis-[40%] p-2 bg-primary text-white rounded-es-sm">
                Rasio Konsistensi (Consistency Ratio)
              </p>
              <div className="basis-[60%] p-2 border border-gray-200 rounded-ee-sm">
                <InlineMath math={`CR = \\frac{CI}{RI} = \\frac{${ahpInstance.consistencyIndex?.toFixed(3)}}{${ahpInstance.randomIndex[dataKriteria.length]?.toFixed(2)}} = ${ahpInstance.consistencyRatio.toFixed(3)}`} />
              </div>
            </div>
          </div>
          {dataSkalaPerbandingan && ahpInstance.consistencyRatio < 0.1 && (
            <div className="mt-5 p-3 bg-green-50 border border-green-200 rounded-sm">
              <p className="mb-2 font-bold text-lg text-green-500">
                Perhitungan Konsisten
              </p>
              <p className="text-gray-600">
                Nilai Consistency Ratio (CR) yang diperoleh adalah <strong>{ahpInstance.consistencyRatio?.toFixed(3)}</strong>. Karena <strong>CR</strong> &lt; <strong>0.1</strong>, maka tingkat konsistensi penilaian dianggap memadai. Anda dapat melanjutkan ke tahap selanjutnya dalam proses pengambilan keputusan.
              </p>
            </div>
          )}
          {dataSkalaPerbandingan && ahpInstance.consistencyRatio > 0.1 && (
            <div className="mt-5 p-3 bg-red-50 border border-red-200 rounded-sm">
              <p className="mb-2 font-bold text-lg text-red-500">
                Perhitungan Tidak Konsisten
              </p>
              <p className="text-gray-600">
                Nilai <strong>Consistency Ratio (CR)</strong> yang diperoleh adalah <strong>{ahpInstance.consistencyRatio?.toFixed(3)}</strong>, yang berarti nilai ini lebih dari atau sama dengan <strong>0.1</strong>. Ini menunjukkan bahwa terdapat ketidakkonsistenan dalam skala perbandingan berpasangan yang telah Anda isi.
                <br /><br />
                Untuk meningkatkan konsistensi, Anda disarankan melakukan hal-hal berikut:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-600">
                <li>Periksa kembali setiap nilai pada tabel perbandingan berpasangan, terutama yang tampak ekstrem atau tidak seimbang.</li>
                <li>Pastikan hubungan antar kriteria bersifat logis dan transitif. Misalnya, jika A lebih penting dari B, dan B lebih penting dari C, maka A seharusnya lebih penting dari C.</li>
                <li>Gunakan skala AHP (1–9) secara wajar — hindari nilai sangat tinggi kecuali benar-benar diperlukan.</li>
                <li>Lakukan penyesuaian kecil pada perbandingan yang menyebabkan inkonsistensi tinggi.</li>
              </ul>
              <p className="mt-2 text-gray-600">
                Setelah perbaikan, sistem akan menghitung ulang nilai konsistensi.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}