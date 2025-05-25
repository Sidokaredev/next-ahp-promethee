import { NotificationType } from "@/app/globals-type";
import StandardPagination from "@/components/navigations/standard-pagination";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AddSkorProgramStudi, DeleteSkorProgramStudi, UpdateSkorProgramStudi } from "@/src/services/administrator/data-algrthm";
import { BidangIlmuGet, BidangIlmuType, ProgramStudiGet, ProgramStudiType, SkorProgramStudiGet, SkorProgramStudiType } from "@/src/services/administrator/program-studi-datasource";
import { SkorProgramStudiSchema, SkorProgramStudiValuesType } from "@/src/services/administrator/zod-schema";
import { Check, ChevronsUpDown, MoreVertical, Pencil, Plus, Save, Trash, X } from "lucide-react";
import React, { ChangeEvent, SetStateAction, useEffect, useState } from "react";

export default function DaftarSkorJurusan({
  periodeSeleksiId,
  setNotification,
  setErr,
}: {
  periodeSeleksiId: number;
  setNotification: React.Dispatch<SetStateAction<NotificationType>>;
  setErr: React.Dispatch<SetStateAction<Error | undefined>>;
}) {
  // state@form
  const [skorProgramStudiForm, setSkorProgramStudiForm] = useState<SkorProgramStudiValuesType>({
    skor: 0,
    program_studi_id: 0
  });

  // state@data
  const [programStudi, setProgramStudi] = useState<ProgramStudiType[]>([]);
  const [bidangIlmu, setBidangIlmu] = useState<BidangIlmuType[]>([]);
  const [selectedBidangIlmu, setSelectedBidangIlmu] = useState<number>(1);
  const [skorProgramStudi, setSkorProgramStudi] = useState<SkorProgramStudiType>();
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

  // state@control:condition
  const [openProgramStudi, setOpenProgramStudi] = useState<Record<string, boolean>>({});
  const [add, setAdd] = useState<boolean>(false);
  const [update, setUpdate] = useState<Record<string, boolean>>({});
  const [openDropdown, setOpenDropdown] = useState<Record<string, boolean>>({});
  const [refetch, setRefetch] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // state@error
  const [errFields, setErrFields] = useState<{ [key: string]: string[] }>({});

  // on-submit@add
  const onSubmitAdd = async () => {
    setLoading(true);
    const validate = SkorProgramStudiSchema.safeParse(skorProgramStudiForm);
    if (!validate.success) {
      const err = validate.error.flatten().fieldErrors;
      setLoading(false);
      return setErrFields(err);
    } else {
      setErrFields({});
    }
    const req = await AddSkorProgramStudi(
      periodeSeleksiId,
      skorProgramStudiForm
    );
    switch (req.response) {
      case "error":
        setNotification({
          show: true,
          name: req.name,
          message: req.message
        })

        const err = new Error(req.message, { cause: req.cause });
        err.name = req.name;
        setErr(err);
        return setLoading(false);

      case "success":
        setNotification({
          show: true,
          name: req.name,
          message: req.message
        });
        setAdd(false);
        setSkorProgramStudiForm({ skor: 0, program_studi_id: 0 });
        setRefetch(prev => !prev);
        return setLoading(false);

      default:
        break;
    }
  }
  // on-submit@change
  const onSubmitChange = async (idx: number) => {
    setLoading(true);
    if (!skorProgramStudiForm.id) {
      return setNotification({
        show: true,
        name: "id skor program studi invalid",
        message: "id skor program studi tidak ditemukan"
      })
    }

    const req = await UpdateSkorProgramStudi(skorProgramStudiForm);
    switch (req.response) {
      case "error":
        setNotification({
          show: true,
          name: req.name,
          message: req.message
        })

        const err = new Error(req.message, { cause: req.cause });
        err.name = req.name;
        setErr(err);
        return setLoading(false);

      case "success":
        setNotification({
          show: true,
          name: req.name,
          message: req.message
        })
        setUpdate(prev => ({ ...prev, [idx]: false }));
        setLoading(false);
        return setRefetch(prev => !prev);

      default:
        break;
    }
  }
  // on-submit@delete
  const onSubmitDelete = async (skorProgramStudiId: number) => {
    setLoading(true);
    const req = await DeleteSkorProgramStudi(skorProgramStudiId);
    switch (req.response) {
      case "error":
        setNotification({
          show: true,
          name: req.name,
          message: req.message
        })

        const err = new Error(req.message, { cause: req.cause });
        err.name = req.name;
        setErr(err);
        return setLoading(false);

      case "success":
        setNotification({
          show: true,
          name: req.name,
          message: req.message
        })
        setLoading(false);
        return setRefetch(prev => !prev);

      default:
        break;
    }
  }

  useEffect(() => {
    // getAll@program-studi
    (async () => {
      const req = await ProgramStudiGet({
        bidang_ilmu_id: selectedBidangIlmu
      });

      switch (req.response) {
        case "error":
          setNotification({
            show: true,
            name: req.name,
            message: req.message
          })

          const err = new Error(req.message, { cause: req.cause });
          err.name = req.name;
          return setErr(err);

        case "data":
          return setProgramStudi(req.data);

        default:
          break;
      }
    })();
  }, [selectedBidangIlmu]);
  useEffect(() => {
    // getAll@skor-program-studi
    (async () => {
      const req = await SkorProgramStudiGet(periodeSeleksiId, paginate.current);
      switch (req.response) {
        case "error":
          setNotification({
            show: true,
            name: req.name,
            message: req.message
          })

          const err = new Error(req.message, { cause: req.cause });
          err.name = req.name;
          return setErr(err);

        case "data":
          return setSkorProgramStudi(req.data);

        default:
          break;
      }
    })();
  }, [refetch, paginate.current]);
  useEffect(() => {
    // getAll@bidang-ilmu
    (async () => {
      const req = await BidangIlmuGet();
      switch (req.response) {
        case "error":
          setNotification({
            show: true,
            name: req.name,
            message: req.message
          })

          const err = new Error(req.message, { cause: req.cause });
          err.name = req.name;
          return setErr(err);

        case "data":
          return setBidangIlmu(req.data);

        default:
          break;
      }
    })();
  }, []);
  return (
    <div className="daftar-jurusan p-2">
      <div className="mb-2 flex justify-between items-start">
        <p className="font-semibold">
          Daftar Jurusan
        </p>
        {add ? (
          <Button size={"sm"} variant={"outline"} className="cursor-pointer text-red-400 hover:text-red-400 border hover:bg-red-50 border-red-400"
            onClick={() => setAdd(false)}
          >
            <X /> Batal
          </Button>
        ) : (
          <Button size={"sm"} className="cursor-pointer"
            onClick={() => setAdd(true)}
          >
            <Plus /> Program Studi
          </Button>
        )}
      </div>
      <div className="mb-2 custom-table border rounded-sm">
        {/* Table Head */}
        <div className="row flex items-center bg-primary text-sm font-semibold rounded-t-sm">
          <div className="basis-[30%] p-3 text-white border-r">
            <p>
              Bidang Ilmu
            </p>
          </div>
          <div className="basis-[50%] p-3 text-white border-r">
            <p>
              Nama Program Studi
            </p>
          </div>
          <div className="basis-[13%] p-3 text-white border-r">
            <p>
              Skor
            </p>
          </div>
          <div className="basis-[7%] p-3 text-white">
            <p>
              Opsi
            </p>
          </div>
        </div>
        {/* Table Form */}
        {add ? (
          <div className="row flex items-start text-sm">
            <div className="basis-[30%] p-3 border-r">
              <Select
                onValueChange={(value: string) => {
                  setSelectedBidangIlmu(Number(value))
                }}
                defaultValue={selectedBidangIlmu.toString()}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Bidang Ilmu Program Studi" />
                </SelectTrigger>
                <SelectContent>
                  {bidangIlmu.map(value => {
                    return (
                      <SelectItem key={value.id} value={value.id.toString()}>
                        {value.nama}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <p className="mt-1 ms-0.5 text-sm text-gray-500">
                Data program studi mengikuti bidang ilmu yang dipilih
              </p>
            </div>
            <div className="basis-[50%] p-3 border-r">
              <Popover open={Boolean(openProgramStudi["new"])}
                onOpenChange={(open: boolean) => {
                  setOpenProgramStudi(prev => ({
                    ...prev,
                    ["new"]: open
                  }))
                }}
              >
                <PopoverTrigger asChild>
                  <div>
                    <Button
                      variant={"outline"}
                      role="combobox"
                      aria-expanded={Boolean(openProgramStudi["new"])}
                      className="w-full text-gray-500 cursor-pointer"
                    >
                      {skorProgramStudiForm.program_studi_id !== 0 ? programStudi.find(data => data.id == skorProgramStudiForm.program_studi_id)?.nama : "Pilih program studi"}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                    {errFields["program_studi_id"] && (
                      <p className="mt-1 text-sm text-red-400">
                        {errFields["program_studi_id"]}
                      </p>
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[37.5em]">
                  <Command>
                    <CommandInput placeholder="Cari program studi" />
                    <CommandList>
                      <CommandEmpty>Program studi tidak ditemukan</CommandEmpty>
                      <CommandGroup>
                        {programStudi.map((value, idx) => {
                          return (
                            <CommandItem
                              key={idx}
                              value={value.nama}
                              onSelect={(_) => {
                                setSkorProgramStudiForm(prev => ({
                                  ...prev,
                                  program_studi_id: value.id
                                }))
                                setOpenProgramStudi(prev => ({
                                  ...prev,
                                  ["new"]: false,
                                }));
                              }}
                            >
                              {value.nama}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  skorProgramStudiForm.program_studi_id === value.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="basis-[13%] p-3 border-r">
              <Input
                type="string"
                value={skorProgramStudiForm.skor}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  const value = event.target.value;
                  if (isNaN(Number(value))) {
                    return
                  }
                  if (value.length > 2) {
                    return;
                  } else if (value.length == 2 && Number(value) > 10) {
                    return;
                  }
                  setSkorProgramStudiForm(prev => ({
                    ...prev,
                    skor: Number(value),
                  }))
                }}
              />
              {errFields["skor"] && (
                <p className="mt-1 text-sm text-red-400">
                  {errFields["skor"]}
                </p>
              )}
            </div>
            <div className="basis-[7%] px-2 py-3">
              <Button size={"sm"} variant={"default"} className="cursor-pointer"
                disabled={loading}
                onClick={async () => {
                  await onSubmitAdd();
                }}
              >
                Submit
              </Button>
            </div>
          </div>
        ) : <></>}
        {/* Table Body */}
        {skorProgramStudi && skorProgramStudi.arr.map((value, idx) => {
          return (
            <div key={idx} className="row flex items-center text-sm">
              <div className={cn("basis-[30%] p-3 border-r ", (idx + 1) === skorProgramStudi.arr.length ? "" : "border-b")}>
                <Select
                  disabled={!Boolean(update[idx])}
                  onValueChange={(value: string) => {
                    setSelectedBidangIlmu(Number(value));
                  }}
                  value={Boolean(update[idx]) ?
                    selectedBidangIlmu.toString() :
                    value.bidang_ilmu_id.toString()}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Bidang Ilmu Program Studi" />
                  </SelectTrigger>
                  <SelectContent>
                    {bidangIlmu.map(value => {
                      return (
                        <SelectItem key={value.id} value={value.id.toString()}>
                          {value.nama}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className={cn("basis-[50%] p-3 border-r", (idx + 1) === skorProgramStudi.arr.length ? "" : "border-b")}>
                <Popover open={Boolean(openProgramStudi[idx])}
                  onOpenChange={(open: boolean) => {
                    setOpenProgramStudi(prev => ({
                      ...prev,
                      [idx]: open,
                    }))
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      disabled={!Boolean(update[idx])}
                      variant={"outline"}
                      role="combobox"
                      aria-expanded={Boolean(openProgramStudi[idx])}
                      className="w-full text-gray-500 cursor-pointer"
                    >
                      {Boolean(update[idx]) ?
                        programStudi.find(value => value.id == skorProgramStudiForm.program_studi_id)?.nama :
                        value.program_studi_nama}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[37.5em]">
                    <Command>
                      <CommandInput placeholder="Cari program studi" />
                      <CommandList>
                        <CommandEmpty>Program studi tidak ditemukan</CommandEmpty>
                        <CommandGroup>
                          {programStudi.map((value, idxProgramStudi) => {
                            return (
                              <CommandItem
                                key={idxProgramStudi}
                                value={value.nama}
                                onSelect={(_) => {
                                  setSkorProgramStudiForm(prev => ({
                                    ...prev,
                                    program_studi_id: value.id
                                  }))
                                  setOpenProgramStudi(prev => ({
                                    ...prev,
                                    [idx]: false
                                  }));
                                }}
                              >
                                {value.nama}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    skorProgramStudiForm.program_studi_id === value.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            )
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className={cn("basis-[13%] p-3 border-r", (idx + 1) === skorProgramStudi.arr.length ? "" : "border-b")}>
                <Input
                  type="string"
                  disabled={!Boolean(update[idx])}
                  value={Boolean(update[idx]) ? skorProgramStudiForm.skor : value.skor}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const value = event.target.value;
                    if (isNaN(Number(value))) {
                      return
                    }
                    if (value.length > 2) {
                      return
                    } else if (value.length == 2 && Number(value) > 10) {
                      return;
                    }
                    setSkorProgramStudiForm(prev => ({
                      ...prev,
                      skor: Number(value),
                    }))
                  }}
                />
              </div>
              <div className={cn("basis-[7%] p-3", (idx + 1) === skorProgramStudi.arr.length ? "" : "border-b")}>
                <DropdownMenu
                  open={openDropdown[`${idx}dropdown`]}
                  onOpenChange={(open: boolean) => {
                    setOpenDropdown(prev => ({
                      ...prev,
                      [`${idx}dropdown`]: open,
                    }))
                  }}
                >
                  <DropdownMenuTrigger asChild className="cursor-pointer"
                  >
                    <Button size={"icon"} variant={"outline"} className="cursor-pointer"
                      onClick={() => {
                        setOpenDropdown(prev => ({
                          ...prev,
                          [`${idx}dropdown`]: true,
                        }))
                      }}
                    >
                      <MoreVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[17em]">
                    {Boolean(update[idx]) ? (
                      <DropdownMenuItem className="font-semibold text-primary hover:!text-primary hover:!bg-blue-50 cursor-pointer"
                        disabled={loading}
                        onClick={async () => {
                          await onSubmitChange(idx);
                        }}
                      >
                        Simpan
                        <DropdownMenuShortcut>
                          <Save color="oklch(0.51 0.1976 267.05)" />
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem className="font-semibold text-gray-800 cursor-pointer"
                        onClick={() => {
                          setSkorProgramStudiForm({
                            id: value.id,
                            skor: value.skor,
                            program_studi_id: value.program_studi_id
                          });
                          setSelectedBidangIlmu(value.bidang_ilmu_id);
                          setUpdate(prev => ({ ...prev, [idx]: true }));
                        }}
                      >
                        Ubah data
                        <DropdownMenuShortcut>
                          <Pencil />
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="font-semibold text-red-400 hover:!text-red-500 hover:!bg-red-50 cursor-pointer"
                      disabled={loading}
                      onClick={async () => {
                        await onSubmitDelete(value.id);
                      }}
                    >
                      Hapus data
                      <DropdownMenuShortcut>
                        <Trash color="oklch(70.4% 0.191 22.216)" />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )
        })}
      </div>
      <StandardPagination
        paginate={paginate}
        setPaginate={setPaginate}
        totalData={skorProgramStudi ? skorProgramStudi.total : 1}
      />
    </div>
  )
}