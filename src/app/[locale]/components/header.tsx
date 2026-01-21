import { getTranslations } from "next-intl/server";
import { HeaderClient } from "./header-client";

type NavItem = { href: string; label: string };

export async function Header() {
  const t = await getTranslations("Header");
  const navItems = (t.raw("navLinks") as NavItem[]) ?? [];

  return <HeaderClient navItems={navItems} brand={t("brand")} cta={t("cta")} />;
}
