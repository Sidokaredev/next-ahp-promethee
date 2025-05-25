import { Clock, Instagram, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <div className="w-full bg-primary">
      <div className="max-w-7xl mx-auto">
        <div className="home-4 pt-[2em] pb-[2em]">
          <div className="footer-tile">
            <p className="text-[#e1e1e1] text-center text-base font-semibold leading-5">
              Dinas Perpustakaan dan Kearsipan Kabupaten Sidoarjo
            </p>
            <p className="text-sm text-center text-[#f8f8f891]">
              Jl. Jaksa Agung Suprapto No.5, Rw1, Sidokumpul, Kec. Sidoarjo, Kabupaten Sidoarjo, Jawa Timur
            </p>
          </div>
          <div className="footer-information mt-[2em] mb-[2em] flex justify-center">
            <div className="flex gap-x-[3em]">
              <div className="phone-number flex items-center gap-2">
                <Phone size={18} color="#ffffffd5" />
                <span className="text-[#ffffffd5]">081336613430</span>
              </div>
              <div className="time-operate flex items-center gap-2">
                <Clock size={18} color="#ffffffd5" />
                <span className="text-[#ffffffd5]">08.00 - 15.00</span>
              </div>
              <div className="instagram flex items-center gap-2">
                <Mail size={18} color="#ffffffd5" />
                <a href="mailto:e-perpus@sidoarjokab.go.id" className="text-[#ffffffd5]">e-perpus@sidoarjokab.go.id</a>
              </div>
            </div>
          </div>
          <p className="text-sm text-[#ffffff80] text-center">
            &copy; 2025 dindaamaliajulyandri.
          </p>
        </div>
      </div>
    </div>
  )
}