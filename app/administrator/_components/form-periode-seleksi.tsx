'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { PeriodeSeleksiType } from "@/src/services/administrator/periode-seleksi";
import { PeriodeSeleksiSchema, PeriodeSeleksiValuesType } from "@/src/services/administrator/zod-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarClock, CalendarIcon, MessageCircleX, Replace } from "lucide-react";
import React from "react";
import { useForm, UseFormReturn } from "react-hook-form";

export default function FormPeriodeSeleksi({
  openDialog,
  onCloseDialog,
  onSubmit,
  loading,
  error,
  data,
}: {
  openDialog: boolean;
  onCloseDialog: () => void;
  onSubmit: (form: UseFormReturn<PeriodeSeleksiValuesType>) => (formValues: PeriodeSeleksiValuesType) => Promise<void | NodeJS.Timeout>;
  loading: boolean;
  error?: Error;
  data?: PeriodeSeleksiType;
}) {
  const form = useForm({
    resolver: zodResolver(PeriodeSeleksiSchema),
    defaultValues: data ? {
      nama: data.nama,
      deskripsi: data.deskripsi as string,
      tanggal_dibuka: data.tanggal_dibuka,
      batas_pendaftaran: data.batas_pendaftaran
    } : {
      nama: ""
    }
  });

  return (
    <div>
      <Dialog
        open={openDialog}
      >
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault() // ⛔ cegah dialog dari tertutup saat klik luar
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault() // ⛔ cegah dialog dari tertutup via tombol Esc
          }}
          className="[&>button]:hidden !max-w-2xl"
          forceMount
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-x-2">
              {data ? <Replace /> : <CalendarClock />}
              {data ? "Ubah" : "Buat"} Periode Seleksi
            </DialogTitle>
            {error && (
              <Alert className="mt-2 pt-2 pb-2 ps-4 pe-4 bg-red-100 text-red-500 border-0">
                <MessageCircleX />
                <AlertTitle className="text-sm">
                  {error.name}
                </AlertTitle>
                <AlertDescription className="text-sm text-red-500">
                  {error.message}
                </AlertDescription>
              </Alert>
            )}
          </DialogHeader>
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit(form))}>
                <div className="">
                  <FormField
                    control={form.control}
                    name="nama"
                    render={({ field }) => {
                      return (
                        <FormItem className="mb-2.5">
                          <FormLabel className="text-gray-600">Nama Seleksi</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g Penerimaan Peserta Magang tahun xxxx"
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
                    name="deskripsi"
                    render={({ field }) => {
                      return (
                        <FormItem className="mb-2.5">
                          <FormLabel className="text-gray-600">Deskripsi</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Informasi mengenai seleksi seperti persyaratan, dokumen, dan lain lain"
                              className="focus-visible:ring-blue-200 focus-visible:border-blue-200 border-blue-200"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )
                    }}
                  />
                  <div className="flex gap-x-3">
                    <FormField
                      control={form.control}
                      name="tanggal_dibuka"
                      render={({ field }) => {
                        return (
                          <FormItem className="grow">
                            <FormLabel className="text-gray-600">Tanggal Dibuka</FormLabel>
                            <Popover
                              modal
                            >
                              <PopoverTrigger asChild>
                                <FormControl className="font-normal focus-visible:ring-blue-200 focus-visible:border-blue-200 border-blue-200">
                                  <Button
                                    variant={"outline"}
                                    className="font-normal"
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pilih tanggal</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date < new Date()
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage className="text-sm" />
                          </FormItem>
                        )
                      }}
                    />
                    <FormField
                      control={form.control}
                      name="batas_pendaftaran"
                      render={({ field }) => {
                        return (
                          <FormItem className="grow">
                            <FormLabel className="text-gray-600">Batas Pendaftaran</FormLabel>
                            <Popover
                              modal
                            >
                              <PopoverTrigger asChild>
                                <FormControl className="font-normal focus-visible:ring-blue-200 focus-visible:border-blue-200 border-blue-200">
                                  <Button
                                    variant={"outline"}

                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pilih tanggal</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date < new Date()
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage className="text-sm" />
                          </FormItem>
                        )
                      }}
                    />
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button
                      variant={"ghost"}
                      size={"sm"}
                      className="w-[5em] cursor-pointer bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600"
                      onClick={onCloseDialog}
                    >
                      Batal
                    </Button>
                  </DialogClose>
                  <Button
                    disabled={loading}
                    type="submit"
                    variant={"default"}
                    size={"sm"}
                    className="w-[5em] cursor-pointer"
                  >
                    Submit
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}