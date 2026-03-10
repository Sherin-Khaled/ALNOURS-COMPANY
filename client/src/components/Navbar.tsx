import { Link, useLocation } from "wouter";
import { ShoppingBag, User as UserIcon } from "lucide-react";
import { SiInstagram, SiFacebook, SiLinkedin } from "react-icons/si";
import { useCart } from "@/store/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { clsx } from "clsx";

export function Navbar() {
  const [location] = useLocation();
  const { items } = useCart();
  const { data: user } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/products", label: t.nav.products },
    { href: "/brands", label: t.nav.brands },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <nav className={clsx(
      "fixed top-0 left-0 right-0 z-50 h-[56px] md:h-[64px] flex items-center transition-all duration-300",
      scrolled ? "bg-white/80 backdrop-blur-md border-b border-neutral-200 shadow-sm" : "bg-transparent"
    )}>
      <div className="container-custom w-full">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center group" data-testid="link-home-logo">
            <img src="/images/Alnours_logo.png" alt="ALNOURS" className="h-9 md:h-11 w-auto object-contain" />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "text-small font-medium transition-all",
                  location === link.href
                    ? "text-primary border-b-2 border-primary pb-0.5"
                    : "text-neutral-700 hover:text-primary"
                )}
                data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {!user && (
              <div className="hidden md:flex items-center gap-2 mr-1">
                <a href="#" className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-primary transition-colors" data-testid="link-instagram" aria-label="Instagram">
                  <SiInstagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-primary transition-colors" data-testid="link-facebook" aria-label="Facebook">
                  <SiFacebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-primary transition-colors" data-testid="link-linkedin" aria-label="LinkedIn">
                  <SiLinkedin className="w-4 h-4" />
                </a>
              </div>
            )}

            <Link href="/cart" className="relative w-10 h-10 flex items-center justify-center rounded-pill hover:bg-neutral-50 transition-colors text-neutral-700" data-testid="link-cart">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-promo text-neutral-950 text-[10px] font-bold flex items-center justify-center rounded-pill border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <Link href="/account" className="w-10 h-10 flex items-center justify-center rounded-pill hover:bg-neutral-50 transition-colors text-neutral-700" data-testid="link-account">
                <UserIcon className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-flex h-9 px-5 items-center justify-center rounded-pill bg-primary text-white text-small font-semibold hover:bg-primary-hover transition-colors btn-styled"
                data-testid="link-signin"
              >
                {t.nav.signin}
              </Link>
            )}

            <div className="flex items-center h-9 rounded-pill border border-neutral-200 overflow-hidden" data-testid="language-toggle">
              <button
                onClick={() => setLocale("en")}
                className={clsx(
                  "px-3 h-full text-[13px] font-semibold transition-colors",
                  locale === "en" ? "bg-primary text-white" : "bg-white text-neutral-700 hover:bg-neutral-50"
                )}
                data-testid="button-lang-en"
              >
                EN
              </button>
              <button
                onClick={() => setLocale("ar")}
                className={clsx(
                  "px-3 h-full text-[13px] font-semibold transition-colors",
                  locale === "ar" ? "bg-primary text-white" : "bg-white text-neutral-700 hover:bg-neutral-50"
                )}
                data-testid="button-lang-ar"
              >
                AR
              </button>
            </div>

            <button
              className="md:hidden w-10 h-10 flex items-center justify-center text-neutral-700 relative"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-4 relative flex flex-col justify-between">
                <span className={clsx(
                  "block h-[2px] w-5 bg-current rounded-full transition-all duration-300 origin-center",
                  mobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""
                )} />
                <span className={clsx(
                  "block h-[2px] w-5 bg-current rounded-full transition-all duration-200",
                  mobileMenuOpen ? "opacity-0 scale-x-0" : "opacity-100"
                )} />
                <span className={clsx(
                  "block h-[2px] w-5 bg-current rounded-full transition-all duration-300 origin-center",
                  mobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""
                )} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 px-4 py-6 flex flex-col gap-4 absolute top-[56px] left-0 w-full shadow-2xl z-50">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-semibold text-body text-neutral-700 hover:text-primary py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <>
              <Link
                href="/login"
                className="font-semibold text-body text-primary py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.signin}
              </Link>
              <div className="flex items-center gap-3 pt-2 border-t border-neutral-200">
                <a href="#" className="text-neutral-500"><SiInstagram className="w-5 h-5" /></a>
                <a href="#" className="text-neutral-500"><SiFacebook className="w-5 h-5" /></a>
                <a href="#" className="text-neutral-500"><SiLinkedin className="w-5 h-5" /></a>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
