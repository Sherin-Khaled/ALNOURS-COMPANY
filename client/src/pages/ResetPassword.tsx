import { Link, useLocation, useSearch } from "wouter";
import { useState } from "react";
import { Citrus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [done, setDone] = useState(false);
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: t.resetPassword.mismatch, variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: t.resetPassword.tooShort, variant: "destructive" });
      return;
    }
    setIsPending(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.message, variant: "destructive" });
        return;
      }
      setDone(true);
      toast({ title: t.resetPassword.successTitle });
      setTimeout(() => setLocation("/login"), 2000);
    } catch {
      toast({ title: t.resetPassword.errorTitle, variant: "destructive" });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 50%, #F0F9FF 100%)" }}>
      <SEO title={t.resetPassword.seoTitle} description={t.resetPassword.seoDesc} />
      <div className="w-full max-w-md bg-white rounded-modal shadow-[0_24px_64px_rgba(0,0,0,0.08)] p-8 md:p-10">
        <div className="flex items-center gap-2 mb-8">
          <div className="">
            <img src="/favicon.png" alt="Logo" className="w-6 h-6 " />
          </div>
          <span className="font-sora font-bold text-h4 text-primary">ALNOURS</span>
        </div>

        {done ? (
          <div className="text-center" data-testid="section-reset-success">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="font-sora text-h4 text-neutral-950 mb-2">{t.resetPassword.doneTitle}</h2>
            <p className="text-body text-neutral-500 mb-4">{t.resetPassword.doneBody}</p>
            <Link href="/login" className="text-primary font-semibold hover:underline" data-testid="link-go-login">{t.resetPassword.goToLogin}</Link>
          </div>
        ) : (
          <>
            <h2 className="font-sora text-h3 text-neutral-950 mb-2">{t.resetPassword.title}</h2>
            <p className="text-body text-neutral-500 mb-6">{t.resetPassword.body}</p>

            {!token && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 text-small" data-testid="text-missing-token">
                {t.resetPassword.missingToken}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-label text-neutral-700 mb-2 block">{t.resetPassword.newPassword}</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body"
                  placeholder="••••••••" required data-testid="input-password"
                />
              </div>
              <div>
                <label className="text-label text-neutral-700 mb-2 block">{t.resetPassword.confirmPassword}</label>
                <input
                  type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body"
                  placeholder="••••••••" required data-testid="input-confirm-password"
                />
              </div>
              <Button type="submit" disabled={isPending || !token}
                className="w-full h-12 rounded-md bg-primary hover:bg-primary-hover !text-white font-semibold text-body"
                data-testid="button-reset-password">
                {isPending ? t.cta.processing : t.resetPassword.button}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
