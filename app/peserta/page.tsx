'use client';

import { CalendarClock, CircleDot } from "lucide-react";
import { useState } from "react";
import PeriodePendaftaran from "./_components/periode-pendaftaran";
import StatusPendaftaran from "./_components/status-pendaftaran";
import MessageNotification from "@/components/notifications/message";
import { NotificationType } from "../globals-type";

export default function Peserta() {
  /* state */
  const [tab, setTab] = useState<string>("periode_pendaftaran");
  const [notification, setNotification] = useState<NotificationType>({
    show: false,
    name: "",
    message: "",
    seconds: 3000
  });

  /* tabs-component */
  const tabsComponent: Record<string, React.ReactElement> = {
    "periode_pendaftaran": <PeriodePendaftaran setNotification={setNotification} />,
    "status_pendaftaran": <StatusPendaftaran />,
  }
  return (
    <div className="pt-[1em] pb-[2em]">
      {/* message@notification */}
      <MessageNotification
        show={notification.show}
        setShow={setNotification}
        name={notification.name}
        message={notification.message}
        timeoutS={notification.seconds}
      />
      <div className="rounded-b-sm">
        <div className="flex gap-x-[1em]">
          {/* TAB : PESERTA */}
          <div className={`
          ${Boolean(tab == "periode_pendaftaran") ?
              "bg-white text-[#3457d5]" :
              "text-gray-500"
            }
            ps-4 pe-4 pt-2 pb-2 flex items-center gap-x-[0.5em] font-semibold text-sm rounded-t-sm cursor-pointer`}
            onClick={() => {
              setTab("periode_pendaftaran")
            }}
          >
            <CalendarClock
              size={25}
              strokeWidth={2.5}
              color={`${Boolean(tab == "periode_pendaftaran") ? "#3457d5" : "#6a7282"}`}
              className={`${Boolean(tab == "periode_pendaftaran") ? "p-1 bg-[#c2cdf2] rounded-xl" : "p-1"} mt-[-0.25]`} />
            Periode Pendaftaran
          </div>
          {/* TAB : VALIDASI KRITERIA */}
          <div className={`
          ${Boolean(tab == "status_pendaftaran") ?
              "bg-white text-[#3457d5]" :
              "text-gray-500"
            }
            ps-4 pe-4 pt-2 pb-2 flex items-center gap-x-[0.5em] font-semibold text-sm rounded-t-sm cursor-pointer`}
            onClick={() => {
              setTab("status_pendaftaran")
            }}
          >
            <CircleDot
              size={25}
              strokeWidth={2.5}
              color={`${Boolean(tab == "status_pendaftaran") ? "#3457d5" : "#6a7282"}`}
              className={`${Boolean(tab == "status_pendaftaran") ? "p-1 bg-[#c2cdf2] rounded-xl" : "p-1"} mt-[-0.25]`} />
            Status Pendaftaran
          </div>
        </div>
        {/* Tab Content */}
        <div className="p-2 bg-white rounded-b-sm">
          {tabsComponent[tab]}
        </div>
      </div>
    </div>
  )
}