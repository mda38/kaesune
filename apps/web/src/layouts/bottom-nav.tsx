import { NavLink } from "react-router-dom";
import { Icon, type IconName } from "@/components/ui/icon";

type Props = { active: NavigationKey };

export type NavigationKey = "home" | "records" | "invoices" | "mypage";

export function BottomNav({ active }: Props) {
  const links: [string, string, IconName, NavigationKey][] = [
    ["/home", "ホーム", "home", "home"],
    ["/records", "レコード", "wallet", "records"],
    ["/invoices", "請求一覧", "receipt", "invoices"],
  ];
  return (
    <nav
      className="fixed right-0 bottom-0 left-0 grid h-20 grid-cols-3 bg-black px-6"
      aria-label="メインナビゲーション"
    >
      {links.map(([to, label, icon, key]) => (
        <NavLink
          key={to}
          to={to}
          className={`flex flex-col items-center justify-center gap-1 text-[11px] font-bold ${active === key ? "text-white after:size-1.5 after:rounded-full after:bg-accent" : "text-white"}`}
        >
          <Icon name={icon} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
