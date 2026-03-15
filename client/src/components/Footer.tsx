import { Link } from "wouter";
import { Citrus, Send } from "lucide-react";
import { SiInstagram, SiFacebook, SiLinkedin } from "react-icons/si";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

export function Footer({ minimal = false }: { minimal?: boolean }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");

  if (minimal) {
    return (
      <footer className="bg-neutral-50 border-t border-neutral-200 py-8 mt-16">
        <div className="container-custom text-center text-small text-neutral-500">
          <p>{t.footer.bottom}</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-16">
      <div className="bg-neutral-50 border-t border-neutral-200 pt-16 pb-10">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            <div>
              <div className="  mb-2">
                <div className="">
                  {/* <Citrus className="w-5 h-5 text-white" /> */}
                  <img src="/favicon.png" alt="Logo" className="w-12 h-12 " />
                </div>
                <h2 className="font-inter mt-1 font-bold text-[20px] text-[#0F3D91]">ALNOURS</h2>
              </div>
              <p className="text-small text-neutral-500 leading-relaxed max-w-[280px]">
                {t.footer.aboutText}
              </p>
            </div>

            <div>
              <h4 className="font-sora font-semibold text-[16px] text-neutral-900 mb-5">{t.footer.explore}</h4>
              <ul className="space-y-3 text-small">
                <li><Link href="/" className="text-neutral-500 hover:text-primary transition-colors">{t.footer.links.home}</Link></li>
                <li><Link href="/products" className="text-neutral-500 hover:text-primary transition-colors">{t.footer.links.products}</Link></li>
                <li><Link href="/brands" className="text-neutral-500 hover:text-primary transition-colors">{t.footer.links.brands}</Link></li>
                <li><Link href="/about" className="text-neutral-500 hover:text-primary transition-colors">{t.footer.links.about}</Link></li>
                <li><Link href="/contact" className="text-neutral-500 hover:text-primary transition-colors">{t.footer.links.contact}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-sora font-bold text-[16px] text-neutral-950 mb-5">{t.footer.contact}</h4>
              <ul className="space-y-3 text-small text-neutral-500">
                <li>rouk@alnours-sa.com</li>
                <li>+966 50 123 4567</li>
                <li>Al Olaya Dist, Riyadh, Saudi Arabia</li>
              </ul>
            </div>

            <div>
              <h4 className="font-sora font-bold text-[16px] text-neutral-950 mb-5">{t.footer.newsletter.title}</h4>
              <p className="text-small text-neutral-500 mb-4">{t.footer.newsletter.body}</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.footer.newsletter.placeholder}
                  className="flex-1 h-10 px-4 rounded-pill border border-neutral-200 text-small bg-white text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  data-testid="input-newsletter-email"
                />
                <button
                  className="h-10 w-10 rounded-pill bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors shrink-0 btn-styled"
                  data-testid="button-subscribe"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#061737] py-8">
        <div className="container-custom">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              
                <img src="/images/logo_miniFooter.png" alt="Logo" className="w-8 h-8 " />
              {/* 
              <span className="font-sora font-bold text-[16px] text-white tracking-tight">ALNOURS</span> */}
            </div>

            <div className="flex items-center gap-4">
              <a href="#" className="text-white/50 hover:text-white transition-colors" data-testid="footer-instagram"><SiInstagram className="w-4 h-4" /></a>
              <a href="#" className="text-white/50 hover:text-white transition-colors" data-testid="footer-facebook"><SiFacebook className="w-4 h-4" /></a>
              <a href="#" className="text-white/50 hover:text-white transition-colors" data-testid="footer-linkedin"><SiLinkedin className="w-4 h-4" /></a>
            </div>

            <p className="text-[13px] text-white/40">
              {t.footer.bottom}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
