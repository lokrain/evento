"use client"

import { useTheme } from "@/components/ui/theme-provider"
import { themeConfigs, type ThemeMode } from "@/lib/theme-config"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

const modeOptions: { value: ThemeMode; label: string; icon: typeof Icons.sun }[] = [
  { value: "light", label: "Светла", icon: Icons.sun },
  { value: "dark", label: "Тъмна", icon: Icons.moon },
  { value: "system", label: "Системна", icon: Icons.monitor },
]

export function ThemeSwitcher() {
  const { themeColor, themeMode, setThemeColor, setThemeMode, resolvedMode } = useTheme()

  const CurrentModeIcon = modeOptions.find((m) => m.value === themeMode)?.icon ?? Icons.monitor

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full border border-border bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Изберете тема"
        >
          <Icons.palette className="h-5 w-5" aria-hidden="true" />
          <span
            className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-primary"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <CurrentModeIcon className="h-4 w-4" aria-hidden="true" />
          Режим
        </DropdownMenuLabel>
        <div className="grid grid-cols-3 gap-1 rounded-md bg-muted/40 p-1">
          {modeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setThemeMode(option.value)}
              className={cn(
                "inline-flex h-9 items-center justify-center rounded-md text-muted-foreground transition-colors",
                "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                themeMode === option.value && "bg-background text-foreground shadow-sm"
              )}
              aria-pressed={themeMode === option.value}
              aria-label={option.label}
            >
              <option.icon className="h-4 w-4" aria-hidden="true" />
            </button>
          ))}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-2">
          <Icons.palette className="h-4 w-4" aria-hidden="true" />
          Цветова тема
        </DropdownMenuLabel>
        <div className="grid grid-cols-2 gap-2 p-1">
          {themeConfigs.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => setThemeColor(theme.id)}
              className={cn(
                "group relative flex h-11 items-center justify-center rounded-md border border-border/60 bg-muted/30",
                "transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                themeColor === theme.id && "border-primary/60"
              )}
              aria-pressed={themeColor === theme.id}
              aria-label={`${theme.name} тема`}
            >
              <span className="sr-only">{theme.name}</span>
              <div
                className={cn("flex gap-1", resolvedMode === "dark" && "dark")}
                data-theme={theme.id}
                aria-hidden="true"
              >
                <span className="h-4 w-4 rounded-full border border-border bg-primary" />
                <span className="h-4 w-4 rounded-full border border-border bg-secondary" />
                <span className="h-4 w-4 rounded-full border border-border bg-accent" />
              </div>
              {themeColor === theme.id && (
                <Icons.check className="absolute right-1 top-1 h-3 w-3 text-primary" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ThemeSwitcherSkeleton() {
  return <div className="h-9 w-9 animate-pulse rounded-full bg-muted" aria-hidden="true" />
}
