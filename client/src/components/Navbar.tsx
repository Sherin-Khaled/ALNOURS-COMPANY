import { Link, useLocation } from "wouter";
import { ShoppingBag, User as UserIcon, Menu, X, Citrus } from "lucide-react";
import { useCart } from "@/store/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { clsx } from "clsx";

export function Navbar() {
  const [location] = useLocation();
  const { items } = useCart();
  const { data: user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const links = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/brands", label: "Brands" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact Us" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200 h-[56px] md:h-[64px] flex items-center">
      <div className="container-custom w-full">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center transition-transform shadow-lg shadow-primary/20">
              <Citrus className="w-6 h-6" />
            </div>
            <span className="font-sora font-bold text-xl md:text-2xl tracking-tight text-neutral-950">
              ALNOURS
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-[20px] lg:gap-[24px]">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "font-medium text-[14px] lg:text-[15px] transition-all px-3 py-1.5 rounded-pill hover:bg-neutral-50",
                  location === link.href 
                    ? "text-primary border-b-2 border-primary rounded-none px-0 py-0" 
                    : "text-neutral-700"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link href={user ? "/account" : "/login"} className="w-[40px] h-[40px] flex items-center justify-center rounded-full hover:bg-neutral-50 transition-colors text-neutral-700">
              <UserIcon className="w-6 h-6" />
            </Link>
            <Link href="/cart" className="relative w-[40px] h-[40px] flex items-center justify-center rounded-full hover:bg-neutral-50 transition-colors text-neutral-700">
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-promo text-neutral-950 text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button 
              className="md:hidden w-[40px] h-[40px] flex items-center justify-center text-neutral-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 px-4 py-6 flex flex-col gap-4 absolute top-[56px] left-0 w-full shadow-2xl z-50">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-semibold text-[16px] text-neutral-700 hover:text-primary py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
