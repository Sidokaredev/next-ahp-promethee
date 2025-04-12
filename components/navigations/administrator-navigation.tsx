import { Home, Link, LogOut, Text } from "lucide-react";
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

export default function AdministratorNavigation() {
  return (
    <nav className="sticky top-0 w-full pt-[0.5em] pb-[0.5em] bg-white shadow-[0px_10px_10px_-10px_rgba(33,35,38,0.1)]">
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
            Hi, Dinda
          </p>
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger className="data-[state=open]:text-primary pt-0 pb-0 ps-1 pe-1 cursor-pointer">
                <Text size={20} className="rotate-180" />
              </MenubarTrigger>
              <MenubarContent align="end" className="min-w-[10em] mt-[0.8em]">
                <MenubarItem className="w-full cursor-pointer hover:text-blue-500">
                  Halaman Utama
                  <MenubarShortcut>
                    <Home />
                  </MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem className="group font-semibold text-red-400 hover:!text-red-600">
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