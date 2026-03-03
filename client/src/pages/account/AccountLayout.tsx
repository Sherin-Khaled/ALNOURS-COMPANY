import { Link, useLocation } from "wouter";
import { User as UserIcon, Package, MapPin, Settings, LogOut } from "lucide-react";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { useState } from "react";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading } = useAuth();
  const { mutateAsync: logout } = useLogout();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  if (isLoading) return <div className="min-h-screen pt-32 text-center">Loading...</div>;
  if (!user) {
    setLocation("/login");
    return null;
  }

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    setLocation("/");
  };

  const nav = [
    { href: "/account", icon: UserIcon, label: "Overview" },
    { href: "/account/orders", icon: Package, label: "Orders" },
    { href: "/account/addresses", icon: MapPin, label: "Addresses" },
    { href: "/account/profile", icon: Settings, label: "Account" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 bg-white">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-[280px] shrink-0">
            <nav className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
              <div className="space-y-1">
                {nav.map(item => {
                  const isActive = location === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <span className={`flex items-center gap-3 h-12 px-4 rounded-md font-medium transition-colors cursor-pointer ${
                        isActive ? "bg-primary text-white" : "text-neutral-700 hover:bg-white"
                      }`}>
                        <item.icon className="w-6 h-6" /> {item.label}
                      </span>
                    </Link>
                  );
                })}
                <div className="pt-3 mt-3 border-t border-neutral-200">
                  <button 
                    onClick={() => setShowLogoutModal(true)} 
                    className="w-full flex items-center gap-3 h-12 px-4 rounded-md font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    data-testid="button-logout"
                  >
                    <LogOut className="w-6 h-6" /> Logout
                  </button>
                </div>
              </div>
            </nav>
          </div>

          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-modal p-8 max-w-sm w-full modal-shadow">
            <h3 className="font-sora text-h4 text-neutral-950 mb-2">Sign out?</h3>
            <p className="text-body text-neutral-500 mb-8">You'll be signed out of your account on this device.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 h-11 rounded-md border border-neutral-200 text-neutral-700 font-semibold hover:bg-neutral-50 transition-colors"
                data-testid="button-cancel-logout"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 h-11 rounded-md bg-destructive hover:bg-destructive/90 text-white font-semibold transition-colors"
                data-testid="button-confirm-logout"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
