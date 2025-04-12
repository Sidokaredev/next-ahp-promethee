'use client'

import { DaftarSchema } from "@/app/form.schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Checkbox } from "@/components/ui/checkbox";
import { UserRoundPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";

export default function Daftar() {
  /* hook */
  const router = useRouter();
  /* state */
  const [show, setShow] = useState<boolean>(false);
  const form = useForm({
    resolver: zodResolver(DaftarSchema),
    defaultValues: {
      nama_lengkap: "",
      nim: "",
      jurusan: "",
      universitas: "",
      no_telepon: "",
      email: "",
      password: "",
      confirm_password: "",
    }
  });

  const onSubmit = (formValues: z.infer<typeof DaftarSchema>) => {
    console.log(formValues);
  }
  return (
    <div className="max-w-2xl w-full ps-[1.5em] pe-[1.5em] pt-[1.5em] pb-[1.5em] bg-white rounded-sm">
      <div className="w-full mx-auto">
        <div className="title
        mb-[0.3em] flex gap-x-[0.5em] justify-start items-center">
          <UserRoundPlus className="mt-0.5" color="#1e64ee" strokeWidth={2.5} />
          <p className="font-bold text-2xl text-primary">
            Daftar
          </p>
        </div>
        <p className="font-normal text-sm text-gray-700">
          Lengkapi informasi data berikut untuk mendaftar sebagai peserta magang di Dinas Perpustakaan dan Kearsipan Kabupaten Sidoarjo.
        </p>
        <Form {...form}>
          <form className="mt-[2em] mb-[1.5em]" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-x-3">
              <FormField
                control={form.control}
                name="nama_lengkap"
                render={({ field }) => {
                  return (
                    <FormItem className="mb-[0.5em]">
                      <FormLabel className="text-gray-600">Nama lengkap</FormLabel>
                      <FormControl>
                        <Input
                          required
                          {...field}
                          placeholder="e.g Alexander Volkanowski"
                          autoComplete="off"
                          className="focus-visible:ring-blue-200 focus-visible:border-blue-200 border-blue-200"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )
                }}
              />
              <FormField
                control={form.control}
                name="universitas"
                render={({ field }) => {
                  return (
                    <FormItem className="mb-[0.5em]">
                      <FormLabel className="text-gray-600">Universitas</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g Politeknik Negeri Jember"
                          autoComplete="off"
                          className="focus-visible:ring-blue-200 focus-visible:border-blue-200 border-blue-200"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )
                }}
              />
              <FormField
                control={form.control}
                name="jurusan"
                render={({ field }) => {
                  return (
                    <FormItem className="mb-[0.5em]">
                      <FormLabel className="text-gray-600">Jurusan</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g Teknik Rekayasa Mekatronika"
                          autoComplete="off"
                          className="focus-visible:ring-blue-200 focus-visible:border-blue-200 border-blue-200"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )
                }}
              />
              <FormField
                control={form.control}
                name="nim"
                render={({ field }) => {
                  return (
                    <FormItem className="mb-[0.5em]">
                      <FormLabel className="text-gray-600">NIM</FormLabel>
                      <FormControl>
                        <Input
                          required
                          {...field}
                          placeholder="e.g E41212015"
                          autoComplete="off"
                          className="focus-visible:ring-blue-200 focus-visible:border-blue-200 border-blue-200"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )
                }}
              />
              <FormField
                control={form.control}
                name="no_telepon"
                render={({ field }) => {
                  return (
                    <FormItem className="mb-[0.5em]">
                      <FormLabel className="text-gray-600">Nomor telepon aktif</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            (+62)
                          </span>
                          <Input
                            type="number"
                            {...field}
                            placeholder="e.g 85784464441"
                            autoComplete="off"
                            className="pl-13 focus-visible:ring-blue-200 focus-visible:border-blue-200 border-blue-200"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )
                }}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => {
                  return (
                    <FormItem className="mb-[0.5em]">
                      <FormLabel className="text-gray-600">Email</FormLabel>
                      <FormControl>
                        <Input
                          required
                          {...field}
                          placeholder="e.g user@email.com"
                          autoComplete="off"
                          className="focus-visible:ring-blue-200 focus-visible:border-blue-200 border-blue-200"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )
                }}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => {
                  return (
                    <FormItem className="mb-[0.5em]">
                      <FormLabel className="text-gray-600">Kata sandi</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type={show ? "text" : "password"}
                          placeholder="minimum (6) karakter"
                          className="focus-visible:ring-blue-200 focus-visible:border-blue-200 border-blue-200"
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )
                }}
              />
              <FormField
                control={form.control}
                name="confirm_password"
                render={({ field }) => {
                  return (
                    <FormItem className="mb-[0.5em]">
                      <FormLabel className="text-gray-600">Konfirmasi kata sandi</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type={"password"}
                          placeholder="konfirmasi ulang kata sandi anda"
                          className="focus-visible:ring-blue-200 focus-visible:border-blue-200 border-blue-200"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )
                }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="show-password" checked={show} onCheckedChange={(checked: CheckedState) => {
                setShow(checked as boolean);
              }} className="cursor-pointer border-blue-200" />
              <label htmlFor="show-password" className="text-sm text-gray-600 select-none cursor-pointer">
                Tampilkan kata sandi
              </label>
            </div>
            <Button type="submit" className="w-full mt-[1em] cursor-pointer" variant={"default"}>Daftar</Button>
          </form>
        </Form>
        <div className="flex items-center text-gray-700">
          <Separator orientation="horizontal" className="basis-[45%]" />
          <p className="basis-[10%] text-sm text-center">atau</p>
          <Separator orientation="horizontal" className="basis-[45%]" />
        </div>
        <p className="mt-3 text-sm text-center text-gray-600">
          Jika telah mendaftar, silahkan klik untuk{" "}
          <span className="inline-flex items-center text-primary font-semibold cursor-pointer"
            onClick={() => router.push("/accounts/signin")}>
            masuk
            {/* <ExternalLink className="inline" size={15} /> */}
          </span>
          {" "}
          dengan akun anda
        </p>
      </div>
    </div>
  )
}