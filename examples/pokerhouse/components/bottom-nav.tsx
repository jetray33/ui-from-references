/**
 * BottomNav — persistent 5-tab navigation for authenticated screens.
 *
 * Tabs in order: เมนู, หน้าหลัก, กระเป๋า, โปรโมชั่น, โปรไฟล์
 * Active tab passed via prop; renders neon-green icon + label.
 *
 * Tokens: design-tokens.json (v0.1.0)
 * Icons: lucide-react (Menu, Home, Wallet, Gift, User)
 */
import { Gift, Home, Menu, User, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type TabKey = "menu" | "home" | "wallet" | "promo" | "profile" | "none";

type Tab = {
  key: Exclude<TabKey, "none">;
  label: string;
  icon: LucideIcon;
};

const TABS: Tab[] = [
  { key: "menu",    label: "เมนู",       icon: Menu },
  { key: "home",    label: "หน้าหลัก",   icon: Home },
  { key: "wallet",  label: "กระเป๋า",    icon: Wallet },
  { key: "promo",   label: "โปรโมชั่น", icon: Gift },
  { key: "profile", label: "โปรไฟล์",    icon: User },
];

export function BottomNav({ active }: { active: TabKey }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 max-w-[440px] mx-auto h-22 px-0 pt-3 pb-5 flex items-stretch bg-bg-elevated border-t border-border-subtle">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const Icon = tab.icon;
        const tone = isActive ? "text-accent-primary" : "text-text-secondary";
        const weight = isActive ? "font-bold" : "font-normal";

        return (
          <button
            key={tab.key}
            type="button"
            aria-label={tab.label}
            aria-current={isActive ? "page" : undefined}
            className={`flex-1 flex flex-col items-center justify-center gap-1 ${tone}`}
          >
            <Icon className="size-6" strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
            <span className={`text-micro ${weight}`}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
