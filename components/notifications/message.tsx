'use client';

import { NotificationType } from "@/app/globals-type";
import React, { SetStateAction, useEffect, useState } from "react";

export default function MessageNotification({
  show,
  setShow,
  name,
  message,
  timeoutS = 3000
}: {
  show: boolean;
  setShow: React.Dispatch<SetStateAction<NotificationType>>;
  name: string;
  message: string;
  timeoutS?: number;
}) {
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (show) {
      timeout = setTimeout(() => {
        setShow({
          show: false,
          name: "",
          message: ""
        });
      }, timeoutS); // 3 detik
    }

    // Bersihkan timeout jika komponen unmount atau open berubah
    return () => clearTimeout(timeout);
  }, [show])
  return (
    <div className={`
    max-w-sm pt-2 pb-2 ps-4 pe-4 fixed z-50 top-[2em] left-1/2 -translate-x-1/2 bg-white shadow-sm shadow-blue-100 rounded-sm border
    transition-all duration-500 ease-in-out
    ${show ? "opacity-100 translate-y-0 max-h-40" : "opacity-0 -translate-y-4 max-h-0"}
    `}>
      <div className="">
        <p className="font-semibold text-base">
          {name}
        </p>
      </div>
      <div>
        <p className="text-[0.8em] max-h-[2em] overflow-y-hidden line-clamp-1 text-gray-600">
          {message}
        </p>
      </div>
    </div>
  )
}