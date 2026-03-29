import { Link } from "wouter";
import { SiInstagram, SiFacebook, SiLinkedin } from "react-icons/si";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer({ minimal = false }: { minimal?: boolean }) {
  const { t } = useLanguage();
  const company = t.company;
  const exploreLinks = [
    { href: "/", label: t.footer.links.home },
    { href: "/products", label: t.footer.links.products },
    { href: "/brands", label: t.footer.links.brands },
    { href: "/about", label: t.footer.links.about },
    { href: "/contact", label: t.footer.links.contact },
  ];
  const legalLinks = [
    { href: "/privacy-policy", label: t.footer.links.privacy },
    { href: "/terms-and-conditions", label: t.footer.links.terms },
    { href: "/refund-return-policy", label: t.footer.links.refund },
    { href: "/shipping-delivery-policy", label: t.footer.links.shippingPolicy },
  ];
  const contactItems = [
    { label: company.labels.company, value: company.name },
    { label: company.labels.email, value: company.email },
    { label: company.labels.phone, value: company.phone },
    { label: company.labels.address, value: company.address, multiline: true },
  ];

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
      <div className="bg-neutral-50 border-t border-neutral-200 pt-16 pb-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            <div className="max-w-[320px]">
              <div className="mb-4">
                <div>
                  <img src="/favicon.png" alt="Logo" className="w-12 h-12" />
                </div>
                <h2 className="font-inter mt-1 font-bold text-[20px] text-[#0F3D91]">ALNOURS</h2>
              </div>
              <p className="text-small leading-7 text-neutral-500">
                {t.footer.aboutText}
              </p>
            </div>

            <div>
              <h4 className="font-sora font-semibold text-[16px] text-neutral-900 mb-5">{t.footer.explore}</h4>
              <ul className="space-y-3 text-small">
                {exploreLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-neutral-500 hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-sora font-bold text-[16px] text-neutral-950 mb-5">{t.footer.contact}</h4>
              <ul className="space-y-4 text-small text-neutral-500">
                {contactItems.map((item) => (
                  <li key={item.label} className={item.multiline ? "whitespace-pre-line" : undefined}>
                    <span className="mb-1 block font-medium text-neutral-700">{item.label}</span>
                    {item.label === company.labels.email ? (
                      <a href={`mailto:${company.email}`} className="transition-colors hover:text-primary">
                        {item.value}
                      </a>
                    ) : item.label === company.labels.phone ? (
                      <a href={company.phoneHref} className="transition-colors hover:text-primary">
                        {item.value}
                      </a>
                    ) : (
                      <span>{item.value}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-sora font-bold text-[16px] text-neutral-950 mb-5">{t.legal.eyebrow}</h4>
              <ul className="space-y-3 text-small">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-neutral-500 hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-8 max-w-[240px] border-t border-neutral-200 pt-4 text-small text-neutral-500">
                <div className="space-y-2">
                  <p>
                    <span className="font-medium text-neutral-700">CR:</span>{" "}
                    <span>{company.cr}</span>
                  </p>
                  <p>
                    <span className="font-medium text-neutral-700">VAT:</span>{" "}
                    <span>{company.vat}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#061737] py-8">
        <div className="container-custom">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <img src="/images/logo_miniFooter.png" alt="Logo" className="w-8 h-8" />
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/alnours2026/"
                target="_blank"
                rel="noreferrer"
                className="text-white/50 hover:text-white transition-colors"
                data-testid="footer-instagram"
              >
                <SiInstagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/share/1DywunBAHY/?mibextid=wwXIfr"
                target="_blank"
                rel="noreferrer"
                className="text-white/50 hover:text-white transition-colors"
                data-testid="footer-facebook"
              >
                <SiFacebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/alnours-company/"
                target="_blank"
                rel="noreferrer"
                className="text-white/50 hover:text-white transition-colors"
                data-testid="footer-linkedin"
              >
                <SiLinkedin className="w-4 h-4" />
              </a>
            </div>

            <p className="text-[13px] text-white/40 mt-0">
              {t.footer.bottom}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
