'use client'

import { MasukSchema } from "@/app/form.schema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckedState } from "@radix-ui/react-checkbox";
import { ExternalLink, LogIn } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function Masuk() {
  /* hook */
  const router = useRouter();
  /* state */
  const [show, setShow] = useState<boolean>(false);
  const form = useForm({
    resolver: zodResolver(MasukSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = (formValues: z.infer<typeof MasukSchema>) => {
    console.log(formValues);
  }
  return (
    <div className="max-w-lg w-full ps-[1.5em] pe-[1.5em] pt-[1.5em] pb-[1.5em] bg-white rounded-sm">
      {/* <div className="mb-[2em] flex gap-x-[0.7em] justify-self-center items-center">
        <Image
          className="object-contain"
          src={"/logos/kabsidoarjo.png"}
          alt="Logo Kabupaten Sidoarjo"
          width={40}
          height={40}
        />
        <p className="font-bold text-base leading-5">
          Dinas Perpustakaan dan Kearsipan
          <br />
          <span className="font-normal text-sm">
            Kabupaten Sidoarjo
          </span>
        </p>
      </div> */}
      <div className="w-full mx-auto">
        <div className="title
        mb-[0.3em] flex gap-x-[0.5em] justify-start items-center">
          <LogIn className="mt-0.5" color="#1e64ee" strokeWidth={2.5} />
          <p className="font-bold text-2xl text-primary">
            Masuk
          </p>
        </div>
        <p className="font-normal text-sm text-gray-700">
          Sistem Seleksi Peserta Magang di
          Dinas Perpustakaan dan Kearsipan Kabupaten Sidoarjo
        </p>
        <Form {...form}>
          <form className="mt-[2.5em] mb-[1.5em]" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => {
                return (
                  <FormItem className="mb-[0.5em]">
                    <FormLabel className="text-gray-600">Email</FormLabel>
                    <FormControl>
                      <Input
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
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                    <div className="flex items-center space-x-2">
                      <Checkbox id="show-password" checked={show} onCheckedChange={(checked: CheckedState) => {
                        setShow(checked as boolean);
                      }} className="cursor-pointer border-blue-200" />
                      <label htmlFor="show-password" className="text-sm text-gray-600 select-none cursor-pointer">
                        Tampilkan kata sandi
                      </label>
                    </div>
                  </FormItem>
                )
              }}
            />
            <Button type="submit" className="w-full mt-[1em] cursor-pointer" variant={"default"}>Masuk</Button>
          </form>
        </Form>
        <div className="flex items-center text-gray-700">
          <Separator orientation="horizontal" className="basis-[45%]" />
          <p className="basis-[10%] text-sm text-center">atau</p>
          <Separator orientation="horizontal" className="basis-[45%]" />
        </div>
        <p className="mt-3 text-sm text-center text-gray-600">
          Jika belum memiliki akun, silahkan klik untuk{" "}
          <span className="inline-flex items-center text-primary font-semibold cursor-pointer"
            onClick={() => router.push("/accounts/signup")}>
            mendaftar
            <ExternalLink className="inline" size={15} />
          </span>
          {" "}
          terlebih dahulu
        </p>
      </div>
    </div>
  )
}