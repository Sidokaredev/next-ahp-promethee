'use client'

import Footer from "@/components/core/footer";
import HomeNavigation from "@/components/navigations/home-navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DialogRegistrasiPeserta from "./_components/dialog-registrasi-peserta";
import DialogPeriodeSeleksi from "./_components/dialog-periode-seleksi";
import DialogKelengkapanDokumen from "./_components/dialog-kelengkapan-dokumen";
import DialogCekStatus from "./_components/dialog-cek-status";
import { CheckCredential } from "@/src/services/base";
import MessageNotification from "@/components/notifications/message";
import { NotificationType } from "./globals-type";

export default function Home() {
  const router = useRouter();

  const [notification, setNotification] = useState<NotificationType>({
    show: false,
    name: "",
    message: ""
  });
  const [alurPendaftaran, setAlurPendaftaran] = useState<Record<string, boolean>>({});
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    (async () => {
      const token = await CheckCredential();
      if (!token) {
        return;
      }
      const data = await fetch("/api/roles?token=" + token, { method: "GET" });
      const alias = await data.json();

      setRole(alias["role"]);
    })();
  }, []);
  return (
    <div className="wrapper"
      style={{
        width: "100%",

      }}
    >
      {/* message@notification */}
      <MessageNotification
        show={notification.show}
        setShow={setNotification}
        name={notification.name}
        message={notification.message}
        timeoutS={notification.seconds}
      />
      <HomeNavigation />
      <div className="w-full bg-[#f2f4fd]">
        <div className="max-w-7xl mx-auto">
          <div className="home-1 pt-[3em] pb-[3em] flex gap-x-5">
            <div className="basis-[50%]">
              <p className="font-bold text-primary text-3xl">
                Selamat Datang
              </p>
              <p className="pt-2 text-gray-800">
                Sistem ini menyediakan informasi lengkap mengenai program Seleksi Magang Mahasiswa di <span className="font-semibold">Dinas Perpustakaan dan Kearsipan Kabupaten Sidoarjo</span>.
                <br />
                <br />
                Proses seleksi dilakukan secara transparan, objektif, dan terstruktur dengan menerapkan metode <span className="font-semibold">AHP (Analytical Hierarchy Process)</span> dan <span className="font-semibold">PROMETHEE (Preference Ranking Organization Method for Enrichment Evaluations)</span>, guna memastikan penilaian yang adil dan berbasis kriteria yang terukur.
              </p>
            </div>
            <div className="basis-[50%] home-1-image">
              <Image
                className="rounded-sm shadow"
                src={"/images/home-1.png"}
                width={800}
                height={600}
                alt="welcome-image"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full bg-white">
        <Image
          className="absolute top-[25em] right-0"
          src={"/relief/circle-relief3.png"}
          width={300}
          height={300}
          alt="home-relief"
        />
        <div className="max-w-7xl mx-auto pt-[5em] pb-[5em]">
          <div className="title mb-5">
            <p className="text-2xl font-semibold">
              Tahapan alur pendaftaran peserta
            </p>
          </div>
          <div className="flex justify-between">
            <div className="registrasi max-w-[250px]"
              onClick={() => {
                setAlurPendaftaran(prev => ({
                  ...prev,
                  ["registrasi"]: true,
                  ["registrasi.step1"]: true,
                }));
              }}
            >
              <Image
                className="border border-[#E5F2FC] rounded-sm stage-items"
                src={"/images/freepik-register.jpg"}
                width={250}
                height={250}
                alt="Register Illustration"
              />
              <p className="mt-3 text-center font-semibold text-gray-500">
                Pendaftaran akun, data diri mahasiswa/i dan perguruan tinggi
              </p>
            </div>
            <DialogRegistrasiPeserta
              alurPendaftaran={alurPendaftaran}
              setAlurPendaftaran={setAlurPendaftaran}
            />
            <div className="pilih-periode max-w-[250px]"
              onClick={() => {
                setAlurPendaftaran(prev => ({
                  ...prev,
                  ["periode-seleksi"]: true,
                }));
              }}
            >
              <Image
                className="border border-[#E5F2FC] rounded-sm stage-items"
                src={"/images/7140417_3497643.jpg"}
                width={250}
                height={250}
                alt="Register Illustration"
              />
              <p className="mt-3 text-center font-semibold text-gray-500">
                Pilih periode seleksi yang tersedia
              </p>
            </div>
            <DialogPeriodeSeleksi
              alurPendaftaran={alurPendaftaran}
              setAlurPendaftaran={setAlurPendaftaran}
            />
            <div className="apply max-w-[250px]"
              onClick={() => {
                setAlurPendaftaran(prev => ({
                  ...prev,
                  ["kelengkapan-dokumen"]: true,
                  ["kelengkapan-dokumen.1"]: true,
                }));
              }}
            >
              <Image
                className="border border-[#E5F2FC] rounded-sm stage-items"
                src={"/images/apply-freepik.jpg"}
                width={250}
                height={250}
                alt="Register Illustration"
              />
              <p className="mt-3 text-center font-semibold text-gray-500">
                Siapkan kelengkapan dokumen dan daftarkan
              </p>
            </div>
            <DialogKelengkapanDokumen
              alurPendaftaran={alurPendaftaran}
              setAlurPendaftaran={setAlurPendaftaran}
            />
            <div className="pengumuman max-w-[250px]"
              onClick={() => {
                if (role == "") {
                  setAlurPendaftaran(prev => ({
                    ...prev,
                    ["cek-status"]: true,
                  }));
                } else if (role == "peserta") {
                  return redirect("/peserta");
                } else if (role == "administrator") {
                  setNotification({
                    show: true,
                    name: "Tidak di Izinkan!",
                    message: "Administrator tidak di izinkan untuk mengakses dashboard peserta"
                  })
                }
              }}
            >
              <Image
                className="border border-[#E5F2FC] rounded-sm stage-items"
                src={"/images/push-notifications-concept-illustration_114360-4986.jpg"}
                width={250}
                height={250}
                alt="Register Illustration"
              />
              <p className="mt-3 text-center font-semibold text-gray-500">
                Cek status pendaftaran melalui dashboard peserta
              </p>
            </div>
            <DialogCekStatus
              alurPendaftaran={alurPendaftaran}
              setAlurPendaftaran={setAlurPendaftaran}
            />
          </div>
        </div>
      </div>
      <div className="w-full relative">
        <Image
          className="absolute top-[-15em]"
          src={"/relief/circle-relief2.png"}
          width={350}
          height={350}
          alt="home-relief"
        />
        <div className="max-w-7xl mx-auto">
          <div className="home-4 pt-[5em] pb-[5em]">
            <p className="font-bold text-5xl text-center">
              Yuk, daftar program magang sekarang!
            </p>
            <p className="max-w-[70%] mx-auto pt-3 text-center text-gray-800">
              Apakah kamu mahasiswa aktif yang tertarik mempelajari dunia perpustakaan dan kearsipan secara langsung?
              <br />
              Jangan lewatkan kesempatan magang di instansi kami dan dapatkan pengalaman berharga!
            </p>
            <Button className="mt-3 flex justify-self-center cursor-pointer"
              onClick={() => router.push("/accounts/signup")}
            >
              Daftar Sekarang
              <ArrowRight />
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
