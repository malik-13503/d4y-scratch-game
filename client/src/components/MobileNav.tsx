import { useLocation } from "wouter";
import { Home, Gamepad2, Wallet, Gift, Hash, Share2, User } from "lucide-react";

const NAV_ITEMS = [
  { icon: Home,     label: "Home",      path: "/" },
  { icon: Gamepad2, label: "Games",     path: "/games" },
  { icon: Wallet,   label: "Wallet",    path: "/wallet" },
  { icon: Gift,     label: "Prizes",    path: "/real-prizes" },
  { icon: Hash,     label: "My Entries",path: "/my-numbers" },
  { icon: Share2,   label: "Referrals", path: "/dashboard" },
  { icon: User,     label: "Account",   path: "/dashboard?tab=settings" },
];

export default function MobileNav() {
  const [location, setLocation] = useLocation();

  const isActive = (path: string) => {
    const basePath = path.split("?")[0];
    if (basePath === "/" ) return location === "/";
    return location.startsWith(basePath);
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 md:hidden z-50 flex items-center justify-around px-1 py-2"
      style={{
        background: "rgba(7,6,15,0.97)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
        const active = isActive(path);
        return (
          <button
            key={label}
            onClick={() => setLocation(path)}
            className={`relative flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-xl transition-all ${
              active ? "text-violet-400" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[9px] font-semibold leading-none">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
