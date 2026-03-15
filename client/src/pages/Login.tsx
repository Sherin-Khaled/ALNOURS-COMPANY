import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useLogin } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import logoMin from "/images/logo_miniFooter.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync: login, isPending } = useLogin();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;
    try {
      await login({ email, password });
      setLocation("/account");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="auth-page-bg min-h-screen flex items-center justify-center p-2 relative">
      <SEO title={t.seo.login.title} description={t.seo.login.description} />

      <Link href="/" className="absolute top-5 left-5 flex items-center justify-center w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors z-20" data-testid="button-back-home">
        <ArrowLeft className="w-4 h-4 text-neutral-700" />
      </Link>

      <div className="w-full max-w-[960px] bg-white rounded-[24px] shadow-[0_32px_80px_rgba(15,61,145,0.13)] overflow-hidden flex flex-col md:flex-row min-h-[560px]">
        <div className="auth-left-panel md:w-[420px] relative flex-shrink-0 p-2 hidden md:block">
          <div className="relative w-full h-full rounded-[18px] overflow-hidden" style={{ minHeight: 520 }}>
            <div className="auth-aurora-bg absolute inset-0 rounded-[18px]" />
            <span className="auth-aurora-item auth-aurora-item--1" />
  <span className="auth-aurora-item auth-aurora-item--2" />
  <span className="auth-aurora-item auth-aurora-item--3" />
  <span className="auth-aurora-item auth-aurora-item--4" />
            <div className="relative z-10 h-full flex flex-col p-8" style={{ minHeight: 520 }}>
              <div style={{ paddingTop: 0, paddingLeft: 0 }}>
                <img src={logoMin} alt="Alnours" className="h-10 w-auto object-contain" />
              </div>
              <div className="mt-auto" style={{ paddingBottom: 0 }}>
                <h2 className="font-sora font-bold text-[28px] leading-[36px] text-white mb-3">{t.auth.login.welcomeTitle}</h2>
                <p className="text-white/75 text-[15px] leading-[24px]">{t.auth.login.welcomeBody}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 md:p-12">
          <div className="w-full max-w-[380px]">
            <h2 className="font-sora text-[28px] font-bold text-neutral-950 mb-1">{t.auth.login.title}</h2>
            <p className="text-[14px] text-neutral-500 mb-8">{t.auth.login.helper}</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-label text-neutral-700 mb-2 block">{t.auth.login.email}</label>
                <div className="relative">
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-[8px] border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body"
                    placeholder="you@example.com" required data-testid="input-email"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </span>
                </div>
              </div>
              <div>
                <label className="text-label text-neutral-700 mb-2 block">{t.auth.login.password}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full h-11 pl-10 pr-10 rounded-[8px] border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body"
                    placeholder="••••••••" required data-testid="input-password"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Link href="/forgot-password" className="text-[13px] text-primary hover:underline font-medium" data-testid="link-forgot-password">{t.auth.login.forgot}</Link>
              </div>
              <Button type="submit" disabled={isPending}
                className="w-full h-12 rounded-pill bg-primary hover:bg-primary-hover !text-white font-semibold text-body"
                data-testid="button-signin"
              >
                {isPending ? t.cta.signingIn : t.auth.login.button}
              </Button>
            </form>

            <p className="text-center mt-6 text-neutral-500 text-[13px]">
              {t.auth.login.bottomPrefix}{" "}
              <Link href="/signup" className="text-primary font-semibold hover:underline">{t.auth.login.bottomLink}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
