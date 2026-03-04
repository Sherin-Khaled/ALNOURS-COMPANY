import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Package, MapPin, Settings, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AccountOverview() {
  const { data: user } = useAuth();
  const { t } = useLanguage();
  
  if (!user) return null;

  const cards = [
    { icon: Package, title: t.account.menu.orders, desc: t.account.orders.subtitle, href: "/account/orders" },
    { icon: MapPin, title: t.account.menu.addresses, desc: t.account.addresses.subtitle, href: "/account/addresses" },
    { icon: Settings, title: t.account.menu.account, desc: t.account.profile.infoSubtitle, href: "/account/profile" },
  ];

  return (
    <div>
      <h2 className="font-sora text-h3 text-neutral-950 mb-2">
        {t.account.overview.title}
      </h2>
      <p className="text-body text-neutral-500 mb-10">{t.account.overview.subtitle}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map(card => (
          <Link key={card.href} href={card.href}>
            <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-200 card-hover-shadow cursor-pointer group transition-all h-full">
              <card.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-neutral-950 text-body mb-1">{card.title}</h3>
              <p className="text-neutral-500 text-small mb-4">{card.desc}</p>
              <span className="text-primary font-semibold text-small flex items-center gap-1 group-hover:gap-2 transition-all">
                {t.cta.view} <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
