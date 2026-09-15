import Link from "next/link"

import {
  getComponentCategories,
  getComponentsTotalCount,
} from "@/lib/component-stats"
import { navFlatItems } from "@/lib/nav-config"
import { Separator } from "@/components/ui/separator"
import { CommandMenuLazy } from "@/components/command-menu-lazy"
import { DesktopNav } from "@/components/desktop-nav"
import { GitHubLink } from "@/components/github-link"
import { Logo } from "@/components/logo"
import { MobileNav } from "@/components/mobile-nav"
import { ThemeModeToggleButton } from "@/components/theme-mode-toggle-button"
import { XLink } from "@/components/x-link"

export async function SiteHeader() {
  const componentCategories = getComponentCategories()
  const navStats = {
    components: getComponentsTotalCount(),
  }

  return (
    <header className="theme-container bg-site-background text-site-foreground font-site-sans w-full overscroll-none">
      <div className="container-wrapper">
        <div className="grid h-[calc(var(--header-height)-1px)] grid-cols-[auto_1fr_auto] items-center gap-2 **:data-[slot=separator]:h-4! xl:grid-cols-[1fr_auto_1fr] xl:gap-3.5">
          <div className="flex min-w-0 items-center justify-start gap-2.5">
            <MobileNav stats={navStats} className="flex lg:hidden" />
            <Link href="/" aria-label="NeUI home">
              <Logo />
            </Link>
          </div>
          <DesktopNav
            stats={navStats}
            className="hidden justify-end lg:flex xl:justify-center"
          />
          <div className="flex min-w-0 items-center justify-end gap-1.5 xl:gap-3">
            <div className="hidden items-center gap-0.5 md:flex">
              <CommandMenuLazy
                navItems={navFlatItems}
                componentCategories={componentCategories}
              />
              <Separator orientation="vertical" className="mx-1" />
              <ThemeModeToggleButton variant="ghost" className="size-8" />
              <XLink />
              <GitHubLink />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-site-border/80 h-px w-full" aria-hidden="true" />
    </header>
  )
}

