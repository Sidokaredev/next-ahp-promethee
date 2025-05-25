'use client';

import Image from "next/image";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCredential } from "@/src/services/base";
import { LayoutDashboard } from "lucide-react";

export default function HomeNavigation() {
  const router = useRouter();

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
    <nav className="home-navigation
    w-full pt-[0.5em] pb-[0.5em] shadow-[0px_10px_10px_-10px_rgba(33,35,38,0.1)]"
    >
      <div className="container-lg
      max-w-7xl mx-auto flex justify-between"
      >
        <div className="flex gap-x-[0.5em]">
          <Image
            className="object-contain"
            src={"/logos/kabsidoarjo.png"}
            alt="Logo Kabupaten Sidoarjo"
            width={40}
            height={40}
          />
          <div className="leading-[1.25em]">
            <h6 className="font-semibold">
              Dinas Perpustakaan dan Kearsipan
            </h6>
            <p className="text-sm">
              Kabupaten Sidoarjo
            </p>
          </div>
        </div>
        {role !== "" ? (
          <div className="flex items-center">
            <Button size={"sm"} variant={"ghost"} className="cursor-pointer border hover:text-primary"
              onClick={() => router.push("/" + role)}
            >
              Dashboard
              <LayoutDashboard />
            </Button>
          </div>
        ) : (
          <div className="flex gap-x-[0.5em] items-center">
            <Button
              className="border-primary text-primary hover:text-primary cursor-pointer"
              variant={"outline"}
              onClick={() => router.push("/accounts/signin")}
            >
              Masuk
            </Button>
            <Button
              className="cursor-pointer"
              variant={"default"}
              onClick={() => router.push("/accounts/signup")}
            >
              Daftar
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}