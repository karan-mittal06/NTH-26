"use client";

import "../components/NavLink.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHeart } from "react-icons/fa";


const Footer = () => {
  const pathname = usePathname();
  return (
    <footer className="glassy-navbar text-white w-full flex items-center fixed bottom-0 left-0 right-0 z-50">
      <div className="w-full flex flex-row items-center justify-between px-4 sm:px-6 lg:px-12 gap-2 sm:gap-4">
        <div className="hidden md:block">
          <h3 className="text-sm lg:text-base font-semibold flex items-center gap-2">
            Made with <FaHeart color="#ff5655" className="h-3 w-3 lg:h-4 lg:w-4" /> by previous players
          </h3>
        </div>

        <div className="flex gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          <Link href="/webteam">
            <p data-glitch="Web Team" className={`glitch footer-glitch font-semibold ${pathname === "/webteam" ? "border-b-2 border-white" : ""}`}>Web Team</p>
          </Link>
          <Link href="/setters">
            <p data-glitch="Question Setters" className={`glitch footer-glitch font-semibold ${pathname === "/setters" ? "border-b-2 border-white" : ""}`}>Question Setters</p>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          <a
            href={"https://www.instagram.com/nth__live/"}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <img src="/icons/instagram.png" className="h-5 w-5 sm:h-6 sm:w-6" alt="Instagram" />
          </a>
          <a
            href={"https://www.linkedin.com/company/pisbieee/"}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <img src="/icons/linkedin.png" className="h-5 w-5 sm:h-6 sm:w-6" alt="LinkedIn" />
          </a>
          <a
            href={"https://pictieee.in"}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <img
              src="/pisb-logo.png"
              alt="PISB Logo"
              className="h-5 sm:h-6 object-contain"
            />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
