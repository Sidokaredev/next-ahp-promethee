'use client'

import { NotificationType } from "@/app/globals-type";
import StandardPagination from "@/components/navigations/standard-pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { prometheeInitKategori, prometheeInitKeyProps } from "@/src/services/administrator/constants";
import { AddBobotKriteria, AddFnPreferensi, BobotKriteriaType, ChangeBobotKriteria, ChangeFnPreferensi, FungsiKriteriaType, GetBobotKriteria, GetDifferenceMatrix, GetFungsiPreferensi, GetIndexPreference, GetKriteria, GetNetFlow, GetPreferenceMatrix, KriteriaType } from "@/src/services/administrator/data-algrthm";
import { DataAlternatifType, GetDataAlternatif } from "@/src/services/administrator/pendaftar"
import { BobotKriteriaSchema } from "@/src/services/administrator/zod-schema";
import { IndexPreferenceMatrix, PrometheeUnstable, RowMatrixType } from "@/src/services/promethee-algrthm/draft-main";
import { Ban, ChevronsUpDown, CloudAlert, Pencil, Search, X } from "lucide-react";
import { useParams } from "next/navigation";
import { ChangeEvent, SetStateAction, useEffect, useState } from "react"
import { InlineMath } from "react-katex";
import { useDebounce } from "use-debounce";

export default function DataAlternatif({
  setNotification,
}: {
  setNotification: React.Dispatch<SetStateAction<NotificationType>>;
}) {
  // hook@params
  const params = useParams<{ id: string; }>();
  // state@data-kriteria
  const [kriteria, setKriteria] = useState<KriteriaType[]>([]);
  // state@bobot-kriteria
  const [bobotKriteria, setBobotKriteria] = useState<Record<string, BobotKriteriaType>>({});
  const [formBobotKriteria, setFormBobotKriteria] = useState<Record<string, { kriteria_id: number; nilai: string; }>>({});
  // state@fungsi-preferensi
  const [fnPreferensi, setFnPreferensi] = useState<Record<string, FungsiKriteriaType>>({});
  const [formFnPreferensi, setFormFnPreferensi] = useState<Record<string, { kriteria_id: number; tipe: string; q: string | null; p: string | null; s: string | null; }>>({});
  // state@manipulate
  const [edit, setEdit] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [openCollapsible, setOpenCollabsible] = useState<Record<string, boolean>>({});
  // state@data-alternatif
  const [dataAlternatif, setDataAlternatif] = useState<DataAlternatifType[]>([]);
  const [totalDataAlternatif, setTotalDataAlternatif] = useState<number>(0);
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
  const [refetch, setRefetch] = useState<Record<string, boolean>>({});
  const [matrixKriteria, setMatrixKriteria] = useState<Record<string, string>>({
    "deviasi": "Indeks Prestasi Kumulatif (IPK)",
    "fn_preferensi": "Indeks Prestasi Kumulatif (IPK)",
    "indek_preferensi": "Indeks Prestasi Kumulatif (IPK)",
  });
  // state@message
  const [err, setErr] = useState<Error>();
  const [errForm, setErrForm] = useState<Record<string, Record<string, string[]>>>({});

  // state@matrix
  const [deviasi, setDeviasi] = useState<RowMatrixType[]>([]);
  const fetchDeviasi = async (kriteria: string) => {
    const data = await GetDifferenceMatrix(
      Number(params.id),
      {
        kriteria: kriteria,
        keyProps: prometheeInitKeyProps,
        kategori: prometheeInitKategori,
      }
    );
    if (data instanceof Error) {
      return setNotification({
        show: true,
        name: data.name,
        message: data.message,
        seconds: 5000
      })
    }

    return setDeviasi(data);
  };
  const [preferensi, setPreferensi] = useState<RowMatrixType[]>([]);
  const fetchPreferensi = async (kriteria: string) => {
    const data = await GetPreferenceMatrix(
      Number(params.id),
      {
        kriteria: kriteria,
        keyProps: prometheeInitKeyProps,
        kategori: prometheeInitKategori,
      }
    );
    if (data instanceof Error) {
      return setNotification({
        show: true,
        name: data.name,
        message: data.message,
        seconds: 5000
      })
    }

    return setPreferensi(data);
  };
  const [indekPreferensi, setIndekPreferensi] = useState<IndexPreferenceMatrix>([]);
  const [leavingFlow, setLeavingFlow] = useState<{
    nama: string;
    leavingFlow: number;
  }[]>([]);
  const [enteringFlow, setEnteringFlow] = useState<{
    nama: string;
    enteringFlow: number;
  }[]>([]);
  const fetchIndekPreferensi = async () => {
    const data = await GetIndexPreference(
      Number(params.id),
      {
        keyProps: prometheeInitKeyProps,
        kategori: prometheeInitKategori,
      }
    );
    if (data instanceof Error) {
      return setNotification({
        show: true,
        name: data.name,
        message: data.message,
        seconds: 5000
      })
    }

    setLeavingFlow(data.leaving_flow);
    setEnteringFlow(data.entering_flow);
    return setIndekPreferensi(data.indek_preferensi);
  };
  const [netFlow, setNetFlow] = useState<{
    nama: string;
    netFlow: number;
  }[]>([]);
  const fetchNetFlow = async () => {
    const data = await GetNetFlow(
      Number(params.id),
      {
        keyProps: prometheeInitKeyProps,
        kategori: prometheeInitKategori,
      }
    );
    if (data instanceof Error) {
      return setNotification({
        show: true,
        name: data.name,
        message: data.message,
        seconds: 5000
      })
    }

    return setNetFlow(data);
  }

  // constant@tipe-preferensi
  const qList = ["Tipe II", "Tipe IV", "Tipe V"];
  const pList = ["Tipe III", "Tipe IV", "Tipe V"];
  const sList = ["Tipe VI"];
  const tipeFnPreferensi = Object.entries(PrometheeUnstable.fnPreferensi).map(([key, value]) => {
    return {
      tipe: value,
      alias: key,
    }
  });

  // onSubmit@bobot-kriteria
  const addOrChangeBobotKriteria = async () => {
    setLoading(prev => ({ ...prev, ["bobot_kriteria"]: true }));

    const unvalidatedValues = Object.entries(formBobotKriteria).reduce((previous, [key, value]) => {
      previous[key] = value.nilai.toString();
      return previous;
    }, {} as Record<string, string>);
    const validate = BobotKriteriaSchema.safeParse(unvalidatedValues);
    if (!validate.success) {
      setLoading(prev => ({ ...prev, ["bobot_kriteria"]: false }));
      const errFields = validate.error.flatten().fieldErrors;
      return setErrForm(prev => ({
        ...prev,
        ["bobot_kriteria"]: errFields
      }));
    }

    setErrForm(prev => {
      delete prev["bobot_kriteria"]
      return {
        ...prev,
      }
    });

    if (Object.keys(bobotKriteria).length > 0) { // IF IT EXIST, CHANGE DATA THEN
      const formBobotKriteriaWithID = Object.entries(formBobotKriteria).reduce((prev, [key, curr]) => {
        prev[key] = {
          id: bobotKriteria[key]["id"],
          ...curr
        }
        return prev;
      }, {} as Record<string, BobotKriteriaType>);

      const update = await ChangeBobotKriteria(Number(params.id), formBobotKriteriaWithID);
      if (update instanceof Error) {
        setLoading(prev => ({ ...prev, ["bobot_kriteria"]: false }));
        setNotification({
          show: true,
          name: update.name,
          message: update.message,
        });

        return setErr(update);
      }

      setNotification({
        show: true,
        name: update.name,
        message: update.message
      });

      setLoading(prev => ({ ...prev, ["bobot_kriteria"]: false }));
      setErr(undefined);
      setEdit(prev => ({ ...prev, ["bobot_kriteria"]: false }));
      return setRefetch(prev => ({ ...prev, ["bobot_kriteria"]: !prev["bobot_kriteria"] }));
    }

    const insert = await AddBobotKriteria(Number(params.id), formBobotKriteria);
    if (insert instanceof Error) {
      setLoading(prev => ({ ...prev, ["bobot_kriteria"]: false }));
      setNotification({
        show: true,
        name: insert.name,
        message: insert.message,
      });

      return setErr(insert);
    }

    setNotification({
      show: true,
      name: insert.name,
      message: insert.message
    });

    setLoading(prev => ({ ...prev, ["bobot_kriteria"]: false }));
    setErr(undefined);
    setEdit(prev => ({ ...prev, ["bobot_kriteria"]: false }));
    return setRefetch(prev => ({ ...prev, ["bobot_kriteria"]: !prev["bobot_kriteria"] }));
  }
  // onSubmit@fungsi-preferensi
  const addOrChangeFnPreferensi = async () => {
    setLoading(prev => ({ ...prev, ["fn_preferensi"]: true }));

    if (Object.keys(fnPreferensi).length > 0) { // IF IT EXIST, CHANGE THEN
      const formFnPreferensiWithID = Object.entries(formFnPreferensi).reduce((prev, [key, curr]) => {
        prev[key] = {
          id: fnPreferensi[key]["id"], // !IMPORTANT
          ...curr
        };
        return prev;
      }, {} as Record<string, FungsiKriteriaType>);
      const update = await ChangeFnPreferensi(Number(params.id), formFnPreferensiWithID);
      if (update instanceof Error) {
        setLoading(prev => ({ ...prev, ["fn_preferensi"]: false }));
        setNotification({
          show: true,
          name: update.name,
          message: update.message,
        });

        return setErr(update);
      }

      setNotification({
        show: true,
        name: update.name,
        message: update.message
      });

      setLoading(prev => ({ ...prev, ["fn_preferensi"]: false }));
      setErr(undefined);
      setEdit(prev => ({ ...prev, ["fn_preferensi"]: false }));
      return setRefetch(prev => ({ ...prev, ["fn_preferensi"]: !prev["fn_preferensi"] }));
    }

    const insert = await AddFnPreferensi(Number(params.id), formFnPreferensi);
    if (insert instanceof Error) {
      setLoading(prev => ({ ...prev, ["fn_preferensi"]: false }));
      setNotification({
        show: true,
        name: insert.name,
        message: insert.message,
      });

      return setErr(insert);
    }

    setNotification({
      show: true,
      name: insert.name,
      message: insert.message
    });

    setLoading(prev => ({ ...prev, ["fn_preferensi"]: false }));
    setErr(undefined);
    setEdit(prev => ({ ...prev, ["fn_preferensi"]: false }));
    return setRefetch(prev => ({ ...prev, ["fn_preferensi"]: !prev["fn_preferensi"] }));
  }

  useEffect(() => {
    // getAll@data-alternatif
    (async () => {
      const data = await GetDataAlternatif({
        periodeSeleksiId: Number(params.id),
        query: debouncedQuery,
        page: paginate.current,
      });

      if (data instanceof Error) {
        return setErr(data);
      }

      setTotalDataAlternatif(data.totalData);
      return setDataAlternatif(data.data);
    })();
  }, [debouncedQuery, paginate.current]);
  useEffect(() => {
    // getAll@kriteria
    (async () => {
      const data = await GetKriteria();
      if (data instanceof Error) {
        setNotification({
          show: true,
          name: data.name,
          message: data.message,
        });
        return setErr(data);
      }

      setKriteria(data);
    })();
  }, []);
  useEffect(() => {
    // getAll@bobot-kriteria
    (async () => {
      const data = await GetBobotKriteria(Number(params.id));
      if (data instanceof Error) {
        setNotification({
          show: true,
          name: data.name,
          message: data.message
        })
        return setErr(data);
      }

      setFormBobotKriteria(data);
      setBobotKriteria(data);
    })();
  }, [refetch["bobot_kriteria"]]);
  useEffect(() => {
    // getAll@fungsi-preferensi
    (async () => {
      const data = await GetFungsiPreferensi(Number(params.id));
      if (data instanceof Error) {
        setNotification({
          show: true,
          name: data.name,
          message: data.message,
        });
        return setErr(data);
      }

      setFormFnPreferensi(data);;
      setFnPreferensi(data);
    })();
  }, [refetch["fn_preferensi"]]);
  return (
    <div className="">
      {/* message@error */}
      {err && (
        <Alert className="mt-2 mb-2 pt-2 pb-2 ps-4 pe-4 bg-red-100 text-red-500 border-0">
          <CloudAlert />
          <AlertTitle className="text-sm">
            {err.name}
          </AlertTitle>
          <AlertDescription className="text-sm text-red-500">
            {err.message}
          </AlertDescription>
        </Alert>
      )}
      <div className="mt-[1.5em] mb-[1em] pengaturan p-2">
        <div className="flex gap-x-[2%] font-semibold text-sm text-gray-600">
          <div className="bobot-kriteria basis-[49%]">
            <p className="mb-2 text-base">
              Bobot Kriteria
            </p>
            <div className="custom-table rounded-sm">
              <div className="row flex items-center bg-primary rounded-t-sm">
                <div className="basis-[50%] p-3 text-white border-r">
                  <p>
                    Nama Kriteria
                  </p>
                </div>
                <div className="basis-[50%] p-3 text-white border-r">
                  <p>
                    Bobot Kriteria
                  </p>
                </div>
              </div>
              {kriteria.map((data, idx) => {
                const isLastIndex = idx == kriteria.length - 1;
                return (
                  <div key={idx} className={`row flex font-normal border-x border-b ${isLastIndex ? "border-b rounded-b-sm" : ""}`}>
                    <div className="basis-[50%] p-3 font-semibold border-r">
                      <p>
                        {data.nama}
                      </p>
                    </div>
                    <div className="basis-[50%] p-3">
                      <Input
                        type="string"
                        disabled={!edit["bobot_kriteria"]}
                        placeholder="e.g (23.xxx)"
                        value={formBobotKriteria[data.nama]?.["nilai"] ?? ""}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          const value = event.target.value;
                          if (isNaN(Number(value))) {
                            return
                          }
                          if (value.length > 5) {
                            return
                          }
                          setFormBobotKriteria(prev => ({
                            ...prev,
                            [data.nama]: {
                              kriteria_id: data.id,
                              nilai: value,
                            }
                          }))
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-3 mb-[2em]">
              <p>
                Note:
              </p>
              <p className="font-normal">
                Gunakan bobot kriteria yang telah divalidasi pada tab sebelumnya (melalui metode AHP dan pengujian konsistensi) agar hasil perhitungan nilai preferensi menjadi lebih baik dan sesuai dengan preferensi yang diharapkan.
              </p>
            </div>
            {errForm["bobot_kriteria"] && (
              <Alert className="mt-2 mb-2 pt-2 pb-2 ps-4 pe-4 bg-red-100 text-red-500 border-0">
                <Ban />
                <AlertTitle className="text-sm">
                  Error Form
                </AlertTitle>
                <AlertDescription className="font-normal text-sm text-red-500">
                  {errForm["bobot_kriteria"]["form"].toString()}
                </AlertDescription>
              </Alert>
            )}
            {edit["bobot_kriteria"] && (
              <div className="mt-3 flex gap-x-2 items-center justify-end">
                <Button size={"sm"} className="cursor-pointer"
                  variant={"secondary"}
                  onClick={() => {
                    setErrForm(prev => {
                      delete prev["bobot_kriteria"]
                      return {
                        ...prev
                      }
                    });
                    setFormBobotKriteria(bobotKriteria);
                    setEdit(prev => ({
                      ...prev,
                      ["bobot_kriteria"]: false,
                    }));
                  }}
                >
                  Batal
                </Button>
                <Button size={"sm"} className="cursor-pointer"
                  disabled={Boolean(loading["bobot_kriteria"])}
                  onClick={addOrChangeBobotKriteria}
                >
                  Simpan
                </Button>
              </div>
            )}
            {!edit["bobot_kriteria"] && (
              <div className="mt-3 flex items-center justify-end">
                <Button size={"sm"} className="cursor-pointer"
                  onClick={() => {
                    setEdit(prev => ({ ...prev, ["bobot_kriteria"]: true }));
                  }}
                >
                  <Pencil />
                  Edit Bobot Kriteria
                </Button>
              </div>
            )}
          </div>
          <div className="fungi-preferensi basis-[49%]">
            <p className="mb-2 text-base">
              Fungsi Preferensi
            </p>
            <div className="custom-table rounded-sm">
              <div className="row flex items-center bg-primary rounded-t-sm">
                <div className="basis-[30%] p-3 text-white border-r">
                  <p>
                    Nama Kriteria
                  </p>
                </div>
                <div className="basis-[70%] p-3 text-white border-r">
                  <p>
                    Tipe Fungsi Preferensi
                  </p>
                </div>
              </div>
              {kriteria.map((data, idx) => {
                const isLastIndex = idx == kriteria.length - 1;
                return (
                  <div key={idx} className={`row flex font-normal border-x border-b ${isLastIndex ? "border-b rounded-b-sm" : ""}`}>
                    <div className="basis-[30%] p-3 font-semibold border-r">
                      <p>
                        {data.nama}
                      </p>
                    </div>
                    <div className="basis-[70%] p-3 font-normal">
                      <Select
                        disabled={!edit["fn_preferensi"]}
                        onValueChange={(value: string) => {
                          setFormFnPreferensi(prev => ({ ...prev, [data.nama]: { ...prev[data.nama], kriteria_id: data.id, tipe: value } }));
                        }}
                        value={formFnPreferensi[data.nama]?.tipe}
                      >
                        <SelectTrigger className="w-[100%] cursor-pointer mb-1">
                          <SelectValue placeholder="Pilih tipe Fn Preferensi" />
                        </SelectTrigger>
                        <SelectContent>
                          {tipeFnPreferensi.map((value, idx) => {
                            return (
                              <SelectItem key={idx} value={value.alias}>
                                {value.tipe + ` (${value.alias})`}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                      <div className="qps-values flex gap-x-3">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild className={`${qList.includes(formFnPreferensi[data.nama]?.tipe) ? "" : "hidden"}`}>
                              <Input
                                type="string"
                                id="q"
                                autoComplete="off"
                                className="mt-2"
                                placeholder="q"
                                disabled={!edit["fn_preferensi"]}
                                value={formFnPreferensi[data.nama]?.["q"] ?? ""}
                                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                  const value = event.target.value;
                                  if (isNaN(Number(value))) {
                                    return
                                  }
                                  setFormFnPreferensi(prev => ({ ...prev, [data.nama]: { ...prev[data.nama], q: value } }));
                                }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Indifference Threshold</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild className={`${pList.includes(formFnPreferensi[data.nama]?.tipe) ? "" : "hidden"}`}>
                              <Input
                                type="string"
                                id="p"
                                autoComplete="off"
                                className="mt-2"
                                placeholder="p"
                                disabled={!edit["fn_preferensi"]}
                                value={formFnPreferensi[data.nama]?.["p"] ?? ""}
                                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                  const value = event.target.value;
                                  if (isNaN(Number(value))) {
                                    return
                                  }
                                  setFormFnPreferensi(prev => ({ ...prev, [data.nama]: { ...prev[data.nama], p: value } }));
                                }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Preference Threshold</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild className={`${sList.includes(formFnPreferensi[data.nama]?.tipe) ? "" : "hidden"}`}>
                              <Input
                                type="string"
                                id="s"
                                autoComplete="off"
                                className="mt-2"
                                placeholder="s"
                                disabled={!edit["fn_preferensi"]}
                                value={formFnPreferensi[data.nama]?.["s"] ?? ""}
                                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                  const value = event.target.value;
                                  if (isNaN(Number(value))) {
                                    return
                                  }
                                  setFormFnPreferensi(prev => ({ ...prev, [data.nama]: { ...prev[data.nama], s: value } }));
                                }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Gaussian Threshold</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {edit["fn_preferensi"] && (
              <div className="mt-3 flex gap-x-2 items-center justify-end">
                <Button size={"sm"} className="cursor-pointer"
                  variant={'secondary'}
                  onClick={() => {
                    setFormFnPreferensi(fnPreferensi);
                    setEdit(prev => ({
                      ...prev,
                      ["fn_preferensi"]: false,
                    }))
                  }}
                >
                  Batal
                </Button>
                <Button size={"sm"} className="cursor-pointer"
                  disabled={Boolean(loading["fn_preferensi"])}
                  onClick={addOrChangeFnPreferensi}
                >
                  Simpan
                </Button>
              </div>
            )}
            {!edit["fn_preferensi"] && (
              <div className="mt-3 flex items-center justify-end">
                <Button size={"sm"} className="cursor-pointer"
                  onClick={() => {
                    setEdit(prev => ({
                      ...prev,
                      ["fn_preferensi"]: true,
                    }))
                  }}
                >
                  <Pencil />
                  Edit Fungsi Preferensi
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Separator />
      <div className="mt-[1em] mb-[1em] flex justify-between items-center">
        <div className="">
          <p className="font-semibold text-md text-gray-600">
            <span className="text-primary font-bold">{dataAlternatif.length}</span> Data Alternatif
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
      <div className="data-alternatif-list mb-[1.5em]">
        <div className="row flex items-center bg-primary font-semibold text-sm text-white rounded-t-sm">
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
          <div className="column basis-[19%] p-3 border-r">
            Jurusan
          </div>
          <div className="column basis-[19%] p-3">
            Akreditasi
          </div>
        </div>
        {dataAlternatif.map((data, idx) => {
          const isLastIndex = idx == (dataAlternatif.length - 1)
          return (
            <div key={idx} className={`row flex font-semibold text-sm text-gray-600 border-b ${isLastIndex ? "rounded-b-sm" : ""} border-x hover:bg-gray-100`}>
              <div className="basis-[5%] column p-3 border-r text-gray-700">
                {idx + 1 + ((10 * paginate.current) - 10) + "."}
              </div>
              <div className="column basis-[25%] p-3 border-r">
                <p>
                  {data.nama_lengkap}
                </p>
                <p className="font-normal">
                  {data.universitas}
                </p>
              </div>
              <div className="column basis-[19%] p-3 border-r">
                {data.indek_prestasi_kumulatif}
              </div>
              <div className="column basis-[13%] p-3 border-r">
                {data.semester}
              </div>
              <div className="column basis-[19%] p-3 border-r">
                {data.jurusan}
              </div>
              <div className="column basis-[19%] p-3">
                {data.akreditasi}
              </div>
            </div>
          )
        })}
      </div>
      <StandardPagination
        paginate={paginate}
        setPaginate={setPaginate}
        totalData={totalDataAlternatif}
      />
      <Separator className="mt-[1em] mb-[1em]" />
      {/* Nilai Deviasi Perbandingan Berpasangan */}
      <div className="">
        <div className="flex justify-between items-center">
          <p className="p-1 font-semibold text-primary">
            Nilai Deviasi untuk Perbandingan Berpasangan
          </p>
          {Boolean(openCollapsible["nilai_deviasi"]) ? (
            <Button
              variant={"ghost"}
              size={"sm"}
              className="cursor-pointer text-gray-600"
              onClick={() => {
                setDeviasi([]);
                setOpenCollabsible(prev => ({ ...prev, ["nilai_deviasi"]: false }));
              }}
            >
              Sembunyikan
              <X />
            </Button>
          ) : (
            <Button
              variant={"ghost"}
              size={"sm"}
              className="cursor-pointer text-gray-600"
              onClick={async () => {
                await fetchDeviasi(matrixKriteria["deviasi"]);
                setOpenCollabsible(prev => ({ ...prev, ["nilai_deviasi"]: true }));
              }}
            >
              Tampilkan
              <ChevronsUpDown />
            </Button>
          )}
        </div>
        <Collapsible
          open={Boolean(openCollapsible["nilai_deviasi"])}
        >
          <CollapsibleContent>
            <div className="select-kriteria mt-2 mb-2 p-1 flex items-center justify-between">
              <div>
                <p className="text-sm">
                  Maksimasi : <InlineMath math="d(a, b) = f(a) - f(b)" />, Minimasi : <InlineMath math="d(a, b) = f(b) - f(a)" />
                </p>
              </div>
              <Select
                value={matrixKriteria["deviasi"]}
                onValueChange={async (value: string) => {
                  setMatrixKriteria(prev => ({ ...prev, ["deviasi"]: value }));
                  await fetchDeviasi(value);
                }}
              >
                <SelectTrigger className="w-[20em]">
                  <SelectValue placeholder={"Pilih kriteria"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {kriteria.map((data, idx) => {
                      return (
                        <SelectItem key={idx} value={data.nama}>{data.nama}</SelectItem>
                      )
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="locked-table w-full max-h-[50vh] overflow-x-auto">
              <div className="row flex min-w-max sticky top-0 z-50">
                <div className="column p-2 w-[10em] sticky left-0 z-20 bg-primary font-semibold text-sm text-white border-b">
                  <p>
                    Deviasi
                  </p>
                </div>
                {deviasi.map((alternative, altIdx) => {
                  return (
                    <div key={altIdx} className={`column p-2 w-[10em] bg-[#7189e2] text-sm text-white font-semibold border-r`}>
                      {alternative.nama}
                    </div>
                  )
                })}
              </div>
              {deviasi.map((row, rowIdx) => {
                return (
                  <div key={rowIdx} className="row flex min-w-max">
                    <div className={`column p-2 w-[10em] sticky left-0 z-20 bg-[#7189e2] font-semibold text-sm text-white border-b border-r`}>
                      <p>
                        {row.nama}
                      </p>
                    </div>
                    {row.matrix.map((column, columnIdx) => {
                      return (
                        <div key={columnIdx} className={`column p-2 w-[10em] text-sm text-gray-600 border-b border-r`}>
                          <p>
                            {column.nilai.toFixed(2)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
      <Separator className="mt-[1em] mb-[1em]" />
      {/* Nilai Fungsi Preferensi */}
      <div>
        <div className="flex justify-between items-center">
          <p className="p-1 font-semibold text-primary">
            Nilai Preferensi untuk Perbandingan Berpasangan
          </p>
          {Boolean(openCollapsible["nilai_fn_preferensi"]) ? (
            <Button
              variant={"ghost"}
              size={"sm"}
              className="cursor-pointer text-gray-600"
              onClick={() => {
                setPreferensi([]);
                setOpenCollabsible(prev => ({ ...prev, ["nilai_fn_preferensi"]: false }));
              }}
            >
              Sembunyikan
              <X />
            </Button>
          ) : (
            <Button
              variant={"ghost"}
              size={"sm"}
              className="cursor-pointer text-gray-600"
              onClick={async () => {
                await fetchPreferensi(matrixKriteria["fn_preferensi"]);
                setOpenCollabsible(prev => ({ ...prev, ["nilai_fn_preferensi"]: true }));
              }}
            >
              Tampilkan
              <ChevronsUpDown />
            </Button>
          )}
        </div>
        <Collapsible
          open={Boolean(openCollapsible["nilai_fn_preferensi"])}
        >
          <CollapsibleContent>
            <div className="select-kriteria mt-2 mb-2 p-1 flex items-center justify-between">
              <div>
                <p className="text-sm">
                  Nilai fungsi preferensi dihitung berdasarkan formula fungsi preferensi yang telah ditentukan untuk setiap kategori.
                </p>
              </div>
              <Select
                value={matrixKriteria["fn_preferensi"]}
                onValueChange={async (value: string) => {
                  setMatrixKriteria(prev => ({ ...prev, ["fn_preferensi"]: value }));
                  await fetchPreferensi(value);
                }}
              >
                <SelectTrigger className="w-[20em]">
                  <SelectValue placeholder={"Pilih kriteria"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {kriteria.map((data, idx) => {
                      return (
                        <SelectItem key={idx} value={data.nama}>{data.nama}</SelectItem>
                      )
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="locked-table w-full max-h-[50vh] overflow-x-auto">
              <div className="row flex min-w-max sticky top-0 z-50">
                <div className="column p-2 w-[10em] sticky left-0 z-20 bg-primary font-semibold text-sm text-white border-b">
                  <p>
                    Preferensi
                  </p>
                </div>
                {preferensi.map((alternative, altIdx) => {
                  return (
                    <div key={altIdx} className={`column p-2 w-[10em] bg-[#7189e2] text-sm text-white font-semibold border-r`}>
                      {alternative.nama}
                    </div>
                  )
                })}
              </div>
              {preferensi.map((row, rowIdx) => {
                return (
                  <div key={rowIdx} className="row flex min-w-max rounded-sm">
                    <div className={`column p-2 w-[10em] sticky left-0 z-20 bg-[#7189e2] font-semibold text-sm text-white border-b border-r`}>
                      <p>
                        {row.nama}
                      </p>
                    </div>
                    {row.matrix.map((column, columnIdx) => {
                      return (
                        <div key={columnIdx} className={`column p-2 w-[10em] text-sm text-gray-600 border-b border-r`}>
                          <p>
                            {column.nilai.toFixed(2)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
      <Separator className="mt-[1em] mb-[1em]" />
      {/* Nilai Indeks Preferensi, Leaving Flow dan Entering Flow */}
      <div>
        <div className="flex justify-between items-center">
          <p className="p-1 font-semibold text-primary">
            Nilai Indeks Preferensi, Leaving Flow dan Entering Flow
          </p>
          {Boolean(openCollapsible["nilai_indek_preferensi"]) ? (
            <Button
              variant={"ghost"}
              size={"sm"}
              className="cursor-pointer text-gray-600"
              onClick={() => {
                setIndekPreferensi([]);
                setOpenCollabsible(prev => ({ ...prev, ["nilai_indek_preferensi"]: false }));
              }}
            >
              Sembunyikan
              <X />
            </Button>
          ) : (
            <Button
              variant={"ghost"}
              size={"sm"}
              className="cursor-pointer text-gray-600"
              onClick={async () => {
                await fetchIndekPreferensi();
                setOpenCollabsible(prev => ({ ...prev, ["nilai_indek_preferensi"]: true }));
              }}
            >
              Tampilkan
              <ChevronsUpDown />
            </Button>
          )}
        </div>
        <Collapsible
          open={Boolean(openCollapsible["nilai_indek_preferensi"])}
        >
          <CollapsibleContent>
            <div className="locked-table mt-[1em] mb-[1em] w-full max-h-[50vh] overflow-x-auto">
              <div className="row flex min-w-max rounded-sm sticky top-0 z-50">
                <div className="column p-2 w-[10em] sticky left-0 z-20 bg-primary font-semibold text-sm text-white border-b">
                  Indeks Preferensi
                </div>
                {indekPreferensi.map((alternative, altIdx) => {
                  return (
                    <div key={altIdx} className={`column p-2 w-[10em] bg-[#7189e2] text-sm text-white font-semibold border-r`}>
                      {alternative.nama}
                    </div>
                  )
                })}
                <div className="column p-2 w-[10em] sticky right-[-2px] z-20 bg-primary font-semibold text-sm text-white border-l">
                  <p>
                    Leaving Flow
                  </p>
                </div>
              </div>
              {indekPreferensi.map((row, rowIdx) => {
                const isLastIndex = rowIdx == indekPreferensi.length - 1;
                return (
                  <div key={rowIdx} className="row flex min-w-max rounded-sm">
                    <div className={`column p-2 w-[10em] sticky left-0 z-20 bg-[#7189e2] font-semibold text-sm text-white border-b border-r`}>
                      <p>
                        {row.nama}
                      </p>
                    </div>
                    {row.aggregatedMatrix.map((column, columnIdx) => {
                      return (
                        <div key={columnIdx} className={`column p-2 w-[10em] text-sm text-gray-600 border-b border-r`}>
                          <p>
                            {column.aggregated.toFixed(2)}
                          </p>
                        </div>
                      )
                    })}
                    <div className={`column p-2 w-[10em] sticky right-[-2px] z-20 bg-blue-100 font-semibold text-sm text-gray-600 border-l border-blue-200 ${isLastIndex ? "" : "border-b"}`}>
                      <p>
                        {leavingFlow[rowIdx]["leavingFlow"].toFixed(2)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div className="row flex min-w-max sticky bottom-0 z-20 rounded-sm">
                <div className={`column p-2 w-[10em] sticky left-0 z-20 bg-primary font-semibold text-sm text-white`}>
                  Entering Flow
                </div>
                {enteringFlow.map((row, rowIdx) => {
                  return (
                    <div key={rowIdx} className={`column p-2 w-[10em] bg-blue-100 font-semibold text-sm text-gray-600 border-b border-l border-blue-200`}>
                      <p>
                        {row.enteringFlow.toFixed(2)}
                      </p>
                    </div>
                  )
                })}
                <div className={`column p-2 w-[10em] sticky right-[-2px] z-20 bg-blue-100 font-semibold text-sm text-gray-600 border-t border-b border-l border-blue-200`}>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
      <Separator className="mt-[1em] mb-[1em]" />
      {/* Nilai Net Flow */}
      <div>
        <div className="flex justify-between items-center">
          <p className="p-1 font-semibold text-primary">
            Nilai Net Fow
          </p>
          {Boolean(openCollapsible["nilai_net_flow"]) ? (
            <Button
              variant={"ghost"}
              size={"sm"}
              className="cursor-pointer text-gray-600"
              onClick={() => {
                setNetFlow([]);
                setOpenCollabsible(prev => ({ ...prev, ["nilai_net_flow"]: false }));
              }}
            >
              Sembunyikan
              <X />
            </Button>
          ) : (
            <Button
              variant={"ghost"}
              size={"sm"}
              className="cursor-pointer text-gray-600"
              onClick={async () => {
                await fetchNetFlow();
                setOpenCollabsible(prev => ({ ...prev, ["nilai_net_flow"]: true }));
              }}
            >
              Tampilkan
              <ChevronsUpDown />
            </Button>
          )}
        </div>
        <Collapsible
          open={Boolean(openCollapsible["nilai_net_flow"])}
        >
          <CollapsibleContent>
            <div className="locked-table mt-[1em] mb-[1em] w-full max-h-[50vh] overflow-x-auto">
              <div className="row flex min-w-max">
                <div className="column p-2 w-[10em] sticky left-0 z-20 bg-primary font-semibold text-sm text-white border-b">
                  Alternatif
                </div>
                {netFlow.map((alternative, idx) => {
                  return (
                    <div key={idx} className={`column p-2 w-[10em] bg-[#7189e2] font-semibold text-sm text-white border-r`}>
                      <p>
                        {alternative.nama}
                      </p>
                    </div>
                  )
                })}
              </div>
              <div className="row flex min-w-max">
                <div className="column p-2 w-[10em] sticky left-0 z-20 bg-primary font-semibold text-sm text-white">
                  Net Flow
                </div>
                {netFlow.map((row, rowIdx) => {
                  return (
                    <div key={rowIdx} className={`column p-2 w-[10em] text-sm text-gray-600 border-b border-r`}>
                      <p>
                        {row.netFlow.toFixed(2)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div >
  )
}