"use client";
import "./NavLink.css";
import { useAuth } from "@/context/AuthProvider";
import Link from "next/link";
import { usePathname} from "next/navigation";
import { useState } from "react";
import { GiAxeSword, GiHamburgerMenu } from "react-icons/gi";
usePathname


const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  const navItems = (
    <>
    <Link href="/leaderboard" className="nav-item">
      <p data-glitch="Leaderboard" className={`glitch ${pathname === "/leaderboard" ? "border-b-2 border-white" : ""}`}>Leaderboard</p>
    </Link>
    <Link href="/question/put_your_answer_here" className="nav-item">
      <p data-glitch="Hunt" className={`glitch ${pathname === "/question/put_your_answer_here" ? "border-b-2 border-white" : ""}`}>Hunt</p>
    </Link>
    <Link href="/instructions" className="nav-item">
      <p data-glitch="How to Play" className={`glitch ${pathname === "/instructions" ? "border-b-2 border-white" : ""}`}>How to Play</p>
    </Link>
    {!user ? (
      <Link href="/register" className="nav-item">
        <p data-glitch="Register" className={`glitch ${pathname === "/register" ? "border-b-2 border-white" : ""}`}>Register</p>
      </Link>
    ) : (
      <button onClick={logout} className="nav-item bg-transparent border-0 p-0">
        <span data-glitch="Logout" className="glitch">Logout</span>
      </button>
    )}
  </>
  );

  return (
    <nav className="glassy-navbar text-white w-full flex items-center fixed top-0 left-0 right-0 z-50">
      <div className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex gap-1 sm:gap-2 items-center hover:opacity-80 transition-opacity">
          <img src="/nth-logo.png" className="h-8 sm:h-10 md:h-12" alt="NTH Logo" />
          <p data-glitch="NTH" className="text-2xl sm:text-3xl md:text-4xl font-bold glitch tracking-wider">NTH</p>
        </Link>

        {/* Hamburger Icon */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-white text-xl sm:text-2xl hover:opacity-80 transition-opacity">
            {isOpen ? <GiAxeSword/>:<GiHamburgerMenu />}
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          {navItems}
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div onClick={toggleMenu} className="md:hidden absolute top-16 left-0 right-0 w-full bg-black/95 backdrop-blur-md border-t border-white/10 shadow-2xl z-50">
            <div className="flex flex-col gap-4 p-6 items-center mobile-menu-glitch">
              {navItems}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;