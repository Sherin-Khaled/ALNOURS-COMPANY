import { Link, useLocation } from "wouter";
import { User as UserIcon, Package, MapPin, LogOut } from "lucide-react";
import { useAuth, useLogout } from "@/hooks/use-auth";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading } = useAuth();
  const { mutateAsync: logout } = useLogout();

  if (isLoading) return <div className="min-h-screen pt-32 text-center">Loading...</div>;
  if (!user) {
    setLocation("/login");
    return null;
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const nav = [
    { href: "/account/profile", icon: UserIcon, label: "My Profile" },
    { href: "/account/orders", icon: Package, label: "Orders" },
    { href: "/account/addresses", icon: MapPin, label: "Addresses" },
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-display font-bold mb-10">My Account</h1>
        
        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-[2rem] p-4 border border-border shadow-sm">
              <nav className="space-y-2">
                {nav.map(item => {
                  const isActive = location === item.href || (item.href === "/account/profile" && location === "/account");
                  return (
                    <Link key={item.href} href={item.href}>
                      <span className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors cursor-pointer ${
                        isActive ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                      }`}>
                        <item.icon className="w-5 h-5" /> {item.label}
                      </span>
                    </Link>
                  );
                })}
                <div className="pt-4 mt-4 border-t border-border">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
