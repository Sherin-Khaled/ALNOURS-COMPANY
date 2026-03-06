import { Link } from "wouter";
import { useState } from "react";
import { Citrus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [sent, setSent] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setSent(true);
      toast({ title: t.forgotPassword.successTitle, description: data.message });
    } catch {
      toast({ title: t.forgotPassword.errorTitle, variant: "destructive" });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 50%, #F0F9FF 100%)" }}>
      <SEO title={t.forgotPassword.seoTitle} description={t.forgotPassword.seoDesc} />
      <div className="w-full max-w-md bg-white rounded-modal shadow-[0_24px_64px_rgba(0,0,0,0.08)] p-8 md:p-10">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
            <Citrus className="w-6 h-6 text-primary" />
          </div>
          <span className="font-sora font-bold text-h4 text-neutral-950">ALNOURS</span>
        </div>

        {sent ? (
          <div data-testid="section-forgot-success">
            <h2 className="font-sora text-h3 text-neutral-950 mb-2">{t.forgotPassword.sentTitle}</h2>
            <p className="text-body text-neutral-500 mb-6">{t.forgotPassword.sentBody}</p>
            <Link href="/login" className="flex items-center gap-2 text-primary font-semibold hover:underline" data-testid="link-back-login">
              <ArrowLeft className="w-4 h-4" /> {t.forgotPassword.backToLogin}
            </Link>
          </div>
        ) : (
          <>
            <h2 className="font-sora text-h3 text-neutral-950 mb-2">{t.forgotPassword.title}</h2>
            <p className="text-body text-neutral-500 mb-6">{t.forgotPassword.body}</p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-label text-neutral-700 mb-2 block">{t.forgotPassword.emailLabel}</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body"
                  placeholder="you@example.com" required data-testid="input-email"
                />
              </div>
              <Button type="submit" disabled={isPending}
                className="w-full h-12 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold text-body"
                data-testid="button-send-reset">
                {isPending ? t.cta.processing : t.forgotPassword.button}
              </Button>
            </form>
            <p className="text-center mt-6 text-neutral-500 text-small">
              <Link href="/login" className="text-primary font-semibold hover:underline" data-testid="link-back-login">{t.forgotPassword.backToLogin}</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
