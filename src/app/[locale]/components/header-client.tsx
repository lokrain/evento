"use client";

import { LogoFlower } from "@/components/ui/logo-flower";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ThemeSwitcher, ThemeSwitcherSkeleton } from "@/components/ui/theme-switcher";
import { LocaleSwitcher, LocaleSwitcherSkeleton } from "./locale-switcher";
import { Icons } from "@/components/ui/icons";
import { Suspense, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string };

type HeaderClientProps = {
  navItems: NavItem[];
  brand: string;
  cta: string;
  menuLabel?: string;
};

export function HeaderClient({ navItems, brand, cta, menuLabel }: HeaderClientProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sectionIds = navItems
      .map((item) => (item.href.startsWith("#") ? item.href.slice(1) : null))
      .filter((id): id is string => Boolean(id));

    if (!sectionIds.length) return;

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target) {
          setActiveHash(`#${visible[0].target.id}`);
        }
      },
      { rootMargin: "0px 0px -55% 0px", threshold: [0.2, 0.4, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [navItems]);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60 transition-shadow ${
        isScrolled ? "shadow-sm" : "shadow-none"
      }`}
    >
      <div className="mx-auto grid min-h-16 w-full max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-3 justify-self-start">
          <span className="relative flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-primary/20 blur-md" aria-hidden="true" />
            <LogoFlower size="md" className="relative" />
          </span>
          <Typography
            as="span"
            variant="subtitle"
            className="text-lg font-semibold tracking-tight text-foreground"
          >
            {brand}
          </Typography>
        </Link>

        <nav aria-label="Primary" className="hidden justify-self-center min-[960px]:flex">
          <NavigationMenu viewport={false}>
            <NavigationMenuList className="gap-4">
              {navItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    href={item.href}
                    className={`${navigationMenuTriggerStyle()} h-9 whitespace-nowrap text-muted-foreground hover:text-foreground data-[active=true]:text-foreground`}
                    data-active={activeHash === item.href}
                    aria-current={activeHash === item.href ? "page" : undefined}
                  >
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        <div className="flex items-center justify-self-end gap-2">
          <Button asChild size="sm" className="hidden h-9 min-w-40 min-[960px]:inline-flex shadow-sm">
            <a href="#cta">{cta}</a>
          </Button>
          <div className="hidden items-center gap-2 min-[960px]:flex">
            <Suspense fallback={<ThemeSwitcherSkeleton />}>
              <ThemeSwitcher />
            </Suspense>
            <Suspense fallback={<LocaleSwitcherSkeleton />}>
              <LocaleSwitcher />
            </Suspense>
          </div>

          <div className="min-[960px]:hidden">
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={menuLabel ?? "Menu"}
                  onPointerDown={() => setMenuOpen(true)}
                >
                  <Icons.menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <a href={item.href}>{item.label}</a>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem asChild>
                  <a
                    href="#cta"
                    className={cn(buttonVariants({ size: "sm" }), "w-full justify-center")}
                  >
                    {cta}
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-default focus:bg-transparent"
                  onSelect={(event) => event.preventDefault()}
                >
                  <div className="flex w-full items-center justify-between">
                    <Suspense fallback={<ThemeSwitcherSkeleton />}>
                      <ThemeSwitcher />
                    </Suspense>
                    <Suspense fallback={<LocaleSwitcherSkeleton />}>
                      <LocaleSwitcher />
                    </Suspense>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}