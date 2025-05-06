'use client'

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageCircleX, UserRoundPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";
import { SignUp } from "@/src/services/accounts/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SignUpSchema } from "@/src/services/accounts/zod-schema";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Daftar() {
  /* hook */
  const router = useRouter();
  /* state */
  const [show, setShow] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<Error | null>(null);
  const form = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      nama_lengkap: "",
      nim: "",
      jurusan: "",
      universitas: "",
      akreditasi: "Tidak Terakreditasi" as "A" | "B" | "C" | "Tidak Terakreditasi",
      nomor_telepon: 0,
      email: "",
      password: "",
      confirm_password: "",
    }
  });

  const onSubmit = async (formValues: z.infer<typeof SignUpSchema>) => {
    setLoading(true);
    const signup = await SignUp(formValues);
    switch (signup.response) {
      case "success":
        return router.push("/peserta");

      case "error":
        setLoading(false);
        const err = new Error(signup.message, { cause: signup.cause });
        err.name = signup.name;
        return setErr(err);

      default:
        break;
    }
  };

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
        {err && (
          <Alert className="mt-2 p-3 text-red-500">
            <MessageCircleX />
            <AlertTitle>{err.name}</AlertTitle>
            <AlertDescription className="text-red-500">
              {err.message}
            </AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-[2em] mb-[1.5em]">
            {/* <div className="grid grid-cols-2 gap-x-3"> */}
            <div className="grid grid-cols-2 gap-x-3">
              <FormField
                control={form.control}
                name="nama_lengkap"
                render={({ field }) => {
                  return (
                    <FormItem className="mb-[0.5em] col-span-2">
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
                name="akreditasi"
                render={({ field }) => (
                  <FormItem className="mb-[0.5em]">
                    <FormLabel className="text-gray-600">Akreditasi Perguruan Tinggi</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl className="w-full focus-visible:ring-blue-200 focus-visible:border-blue-200 border-blue-200">
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori akreditasi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["A", "B", "C", "Tidak Terakreditasi"].map((value, idx) => {
                          return (
                            <SelectItem key={idx} value={value}>{value}</SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
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
                name="nomor_telepon"
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
                            type="text"
                            {...field}
                            placeholder="e.g 85784464441"
                            autoComplete="off"
                            className="pl-13 focus-visible:ring-blue-200 focus-visible:border-blue-200 border-blue-200"
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                              const value = event.target.value;
                              if (isNaN(Number(value))) {
                                field.onChange(undefined);
                              } else {
                                field.onChange(Number(value));
                              }
                            }}
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
            <Button disabled={loading} type="submit" className="w-full mt-[1em] cursor-pointer" variant={"default"}>Daftar</Button>
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