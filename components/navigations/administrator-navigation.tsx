'use client'

import { Home, LogOut, Text } from "lucide-react";
import Image from "next/image";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { useEffect, useState } from "react";
import { LogOut as LogOutSession } from "@/src/services/accounts/auth";
import { GetNameNavigation } from "@/src/services/base";

export default function AdministratorNavigation() {
  /* state */
  const [navScrolled, setNavScrolled] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [err, setErr] = useState<Error | null>(null);
  /* side-effect */
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      setNavScrolled(scrollTop > 64)
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    (async () => {
      const data = await GetNameNavigation();
      if (data instanceof Error) {
        return setErr(data);
      }

      return setName(data.split(" ")[0])
    })();
  }, []);
  return (
    <nav className="sticky top-0 w-full pt-[0.5em] pb-[0.5em] bg-gray-50 z-10"
      style={{
        backgroundColor: navScrolled ? "white" : "#ebeefb",
        boxShadow: navScrolled ? " rgba(52,87,213,0.1) 0px 10px 10px -10px" : "",
      }}
    >
      <div className="max-w-7xl mx-auto flex justify-between">
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
        <div className="flex gap-x-3 items-center">
          <p className="font-semibold text-sm">
            Hi, {name}
          </p>
          <Menubar className={`
            ${navScrolled ? "bg-white" : "bg-[#ebeefb]"}
            border-none shadow-none
            `}>
            <MenubarMenu>
              <MenubarTrigger className={`
                ${navScrolled ? "data-[state=open]:bg-white" : "data-[state=open]:bg-[#ebeefb]"}
                data-[state=open]:text-primary pt-0 pb-0 ps-1 pe-1 cursor-pointer`}>
                <Text size={20} className="rotate-180" />
              </MenubarTrigger>
              <MenubarContent align="end" className="min-w-[10em] mt-[0.8em]">
                <MenubarItem className="group w-full font-semibold cursor-pointer hover:!text-primary">
                  Halaman Utama
                  <MenubarShortcut>
                    <Home className="group-hover:!text-primary" />
                  </MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem className="group font-semibold text-red-400 cursor-pointer hover:!text-red-600"
                  onClick={() => LogOutSession()}
                >
                  Keluar
                  <MenubarShortcut>
                    <LogOut className="text-red-400 group-hover:text-red-500" />
                  </MenubarShortcut>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
      </div>
    </nav>
  )
}