'use client';

import AdministratorNavigation from "@/components/navigations/administrator-navigation";
import MessageNotification from "@/components/notifications/message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ChangeProfilePeserta, GetProfilePeserta, ProfilePesertaType } from "@/src/services/peserta/profile";
import { Pencil } from "lucide-react";
import React, { ChangeEvent, useEffect, useState } from "react";
import { NotificationType } from "../globals-type";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PesertaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  /* state */
  const [profiles, setProfiles] = useState<ProfilePesertaType>({
    id: "",
    nama_lengkap: "",
    universitas: "",
    akreditasi: "Tidak Terakreditasi",
    jurusan: "",
    nim: "",
    no_telepon: 0,
    pengguna: {
      email: ""
    }
  });
  const [formProfile, setFormProfile] = useState<ProfilePesertaType>({
    id: "",
    nama_lengkap: "",
    universitas: "",
    akreditasi: "Tidak Terakreditasi",
    jurusan: "",
    nim: "",
    no_telepon: 0,
    pengguna: {
      email: ""
    }
  });
  const [err, setErr] = useState<Error | null>(null);
  const [refetch, setRefetch] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const [notification, setNotification] = useState<NotificationType>({
    show: false,
    name: "",
    message: "",
    seconds: 3000
  });

  // onSubmit@profile-peserta
  const onSubmit = async () => {
    setLoading(true);

    const change = await ChangeProfilePeserta(formProfile);
    switch (change.response) {
      case "success":
        setLoading(false);
        setEdit(false);
        setRefetch(prev => !prev);
        return setNotification({
          show: true,
          name: change.name,
          message: change.message
        })

      case "error":
        setLoading(false);
        const err = new Error(change.message, { cause: change.cause });
        err.name = change.name;
        return setErr(err);

      default:
        break;
    }
  }

  /* fetching */
  useEffect(() => {
    (async () => {
      const req = await GetProfilePeserta<ProfilePesertaType>();
      switch (req.response) {
        case "data":
          return setProfiles(req.data);

        case "error":
          const err = new Error(req.message, { cause: req.cause });
          err.name = req.name;
          return setErr(err);

        default:
          break;
      }
    })();
  }, [refetch]);
  return (
    <div className="w-full bg-[#ebeefb]">
      <AdministratorNavigation />
      <div className="max-w-7xl min-h-screen mx-auto">
        {/* message@notification */}
        <MessageNotification
          show={notification.show}
          setShow={setNotification}
          name={notification.name}
          message={notification.message}
          timeoutS={notification.seconds}
        />
        <div className="mt-[2em] profile-peserta p-3 bg-white rounded-sm">
          <div className="flex justify-between items-center">
            <div className="flex space-x-3 items-center">
              {edit && (
                <div className="min-w-[20em] grid items-center gap-y-1.5">
                  <Label htmlFor="nama_lengkap" className="text-sm text-gray-400">Nama Lengkap</Label>
                  <Input
                    id="nama_lengkap"
                    type="text"
                    value={formProfile.nama_lengkap}
                    autoComplete="off"
                    className="focus-visible:ring-blue-200 focus-visible:border-blue-200 border-blue-200"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      setFormProfile(prev => ({
                        ...prev,
                        nama_lengkap: event.target.value
                      }));
                    }}
                  />
                </div>
              )}
              {!edit && (
                <p className="font-semibold">
                  {profiles.nama_lengkap}
                </p>
              )}
            </div>
            {edit && (
              <div className="flex gap-x-2">
                <Button
                  variant={"secondary"}
                  size={"sm"}
                  className="cursor-pointer"
                  onClick={() => setEdit(false)}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button
                  size={"sm"}
                  className="cursor-pointer"
                  onClick={async () => {
                    await onSubmit();
                  }}
                  disabled={loading}
                >
                  Simpan
                </Button>
              </div>
            )}
            {!edit && (
              <Button
                className="cursor-pointer"
                size={"icon"}
                onClick={() => {
                  setFormProfile(profiles);
                  setEdit(prev => !prev);
                }}
              >
                <Pencil />
              </Button>
            )}
          </div>
          <Separator className="mt-3 mb-3" />
          <div className={`mb-2 grid grid-cols-5 ${edit ? "gap-x-3" : ""}`}>
            <div>
              <p className="mb-1.5 font-semibold text-sm text-gray-400">
                Universitas
              </p>
              {edit && (
                <Input
                  id="universitas"
                  type="text"
                  value={formProfile.universitas}
                  autoComplete="off"
                  className="focus-visible:ring-blue-200 focus-visible:border-blue-200 border-blue-200"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setFormProfile(prev => ({
                      ...prev,
                      universitas: event.target.value
                    }));
                  }}
                />
              )}
              {!edit && (
                <p className="font-semibold text-sm leading-[1em]">
                  {profiles.universitas}
                </p>
              )}
            </div>
            <div>
              <p className="mb-1.5 font-semibold text-sm text-gray-400">
                Akreditasi Perguruan Tinggi
              </p>
              {edit && (
                <Select
                  onValueChange={(value: string) => {
                    setFormProfile(prev => {
                      return {
                        ...prev,
                        akreditasi: value as "A" | "B" | "C" | "Tidak Terakreditasi",
                      }
                    })
                  }}
                  defaultValue={formProfile.akreditasi}
                >
                  <SelectTrigger className="w-full focus-visible:ring-blue-200 focus-visible:border-blue-200 border-blue-200">
                    <SelectValue placeholder="Pilih kategori akreditasi" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A", "B", "C", "Tidak Terakreditasi"].map((value, idx) => {
                      return (
                        <SelectItem key={idx} value={value}>{value}</SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              )}
              {!edit && (
                <p className="font-semibold text-sm leading-[1em]">
                  {profiles.akreditasi}
                </p>
              )}
            </div>
            <div>
              <p className="mb-1.5 font-semibold text-sm text-gray-400">
                Jurusan
              </p>
              {edit && (
                <Input
                  id="jurusan"
                  type="text"
                  value={formProfile.jurusan}
                  autoComplete="off"
                  className="focus-visible:ring-blue-200 focus-visible:border-blue-200 border-blue-200"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setFormProfile(prev => ({
                      ...prev,
                      jurusan: event.target.value
                    }));
                  }}
                />
              )}
              {!edit && (
                <p className="font-semibold text-sm leading-[1em]">
                  {profiles.jurusan}
                </p>
              )}
            </div>
            <div>
              <p className="mb-1.5 font-semibold text-sm text-gray-400">
                NIM
              </p>
              {edit && (
                <Input
                  id="nim"
                  type="text"
                  value={formProfile.nim}
                  autoComplete="off"
                  className="focus-visible:ring-blue-200 focus-visible:border-blue-200 border-blue-200"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setFormProfile(prev => ({
                      ...prev,
                      nim: event.target.value
                    }));
                  }}
                />
              )}
              {!edit && (
                <p className="font-semibold text-sm leading-[1em]">
                  {profiles.nim}
                </p>
              )}
            </div>
            <div>
              <p className="mb-1.5 font-semibold text-sm text-gray-400">
                Nomor Telepon
              </p>
              {edit && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    (+62)
                  </span>
                  <Input
                    type="text"
                    autoComplete="off"
                    className="pl-13 focus-visible:ring-blue-200 focus-visible:border-blue-200 border-blue-200"
                    value={formProfile.no_telepon}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      const value = event.target.value;
                      if (isNaN(Number(value))) {
                        return
                      } else {
                        setFormProfile(prev => ({
                          ...prev,
                          no_telepon: Number(value),
                        }))
                      }
                    }}
                  />
                </div>
              )}
              {!edit && (
                <p className="font-semibold text-sm leading-[1em]">
                  (+62) {profiles.no_telepon === 0 ? "-" : profiles.no_telepon}
                </p>
              )}
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}