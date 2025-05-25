'use client'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DaftarPeriodeSeleksiSchema } from "@/src/services/peserta/zod-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageCircleX, NotebookTabs } from "lucide-react";
import { ChangeEvent } from "react";
import { useForm, UseFormReturn } from "react-hook-form";

export default function FormDaftarPeriodeSeleksi({
  openDialog,
  onCloseDialog,
  onSubmit,
  loading,
  error,
}: {
  openDialog: boolean;
  onCloseDialog: () => void;
  onSubmit: (form: UseFormReturn<any>) => (formValues: any) => Promise<void>;
  loading: boolean;
  error?: Error;
}) {
  const form = useForm({
    resolver: zodResolver(DaftarPeriodeSeleksiSchema),
    defaultValues: {
      indek_prestasi_kumulatif: "",
      semester: 0,
      sp_universitas: undefined,
      sp_bakesbangpol_provinsi: undefined,
      sp_bakesbangpol_daerah: undefined,
    }
  });
  return (
    <Dialog open={openDialog}>
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
            <NotebookTabs />
            Daftar Periode Seleksi
          </DialogTitle>
          <DialogDescription>
            Lengkapi formulir berikut untuk melanjutkan proses pendaftaran.
          </DialogDescription>
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
            <form
              id="form-daftar"
              onSubmit={form.handleSubmit(onSubmit(form))}
            >
              <div className="flex gap-x-3">
                <FormField
                  control={form.control}
                  name="indek_prestasi_kumulatif"
                  render={({ field }) => {
                    return (
                      <FormItem className="mb-3 grow">
                        <FormLabel className="text-gray-600">Indek Prestasi Kumulatif (IPK)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g 3.xx"
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
                  name="semester"
                  render={({ field }) => {
                    return (
                      <FormItem className="mb-3 grow">
                        <FormLabel className="text-gray-600">Semester</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Semester yang ditempuh saat ini"
                            autoComplete="off"
                            className="focus-visible:ring-blue-200 focus-visible:border-blue-200 border-blue-200"
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                              const value = event.target.value;
                              if (isNaN(Number(value))) {
                                return
                              }
                              if (value.length > 1) {
                                return
                              }
                              field.onChange(Number(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )
                  }}
                />
              </div>
              <FormField
                control={form.control}
                name="sp_universitas"
                render={({ field }) => {
                  return (
                    <FormItem className="mb-3">
                      <FormLabel className="text-gray-600">Surat Pengantar Perguruan Tinggi</FormLabel>
                      <FormControl>
                        <Input
                          name={field.name}
                          type="file"
                          accept="application/pdf"
                          onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            const file = event.target.files?.[0];
                            if (!file) {
                              return
                            }
                            field.onChange(file)
                          }}
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
                name="sp_bakesbangpol_provinsi"
                render={({ field }) => {
                  return (
                    <FormItem className="mb-3">
                      <FormLabel className="text-gray-600">Surat Pengantar Bakesbangpol Provinsi</FormLabel>
                      <FormControl>
                        <Input
                          name={field.name}
                          type="file"
                          accept="application/pdf"
                          onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            const file = event.target.files?.[0];
                            if (!file) {
                              return
                            }
                            field.onChange(file)
                          }}
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
                name="sp_bakesbangpol_daerah"
                render={({ field }) => {
                  return (
                    <FormItem className="mb-3">
                      <FormLabel className="text-gray-600">Surat Pengantar Bakesbangpol Daerah</FormLabel>
                      <FormControl>
                        <Input
                          name={field.name}
                          type="file"
                          accept="application/pdf"
                          onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            const file = event.target.files?.[0];
                            if (!file) {
                              return
                            }
                            field.onChange(file)
                          }}
                          className="focus-visible:ring-blue-200 focus-visible:border-blue-200 border-blue-200"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )
                }}
              />
            </form>
          </Form>
          <div className="mt-3 flex justify-end items-center gap-x-3">
            <Button
              disabled={loading}
              variant={"outline"}
              size={"sm"}
              className="min-w-[8em] cursor-pointer"
              onClick={() => {
                onCloseDialog();
              }}
            >
              Batal
            </Button>
            <Button
              type="submit"
              form="form-daftar"
              size={"sm"}
              className="min-w-[8em] cursor-pointer"
              disabled={loading}
            >
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}