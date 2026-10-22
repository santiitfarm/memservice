"use client";

import Image from "next/image";
import Link from "next/link";
import Search from "./Search";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageToggle from "@/components/ui/LanguageToggle";
import { Menu as MenuIcon, PhoneCall, X } from "lucide-react";
import { PiPhoneCallThin } from "react-icons/pi";
import { useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SearchAndSupport({ site, menus, categories = [] }) {
  const contactPhone = site?.contact?.phone || "+8801711655686";
  const rawPhone = contactPhone.replace(/[^0-9+]/g, "");
  const headerMenus = menus?.header || [];
  const logoLight = site?.logoLight || "/assets/logo/logo.png";
  const logoDark = site?.logoDark || site?.logoLight || "/assets/logo/logo.png";
  const siteName = site?.siteName || "Mem Service";

  return (
    <section className="flex items-center justify-between gap-4 lg:gap-8 py-3">
      {/* Dynamic Logo Section with Light/Dark Mode Switch */}
      <Link href="/" className="shrink-0 flex items-center group">
        {/* Render light logo in light mode, dark logo in dark mode */}
        <div className="relative h-10 sm:h-12 lg:h-14 w-auto flex items-center">
          <Image
            className="w-auto h-full max-h-10 sm:max-h-12 lg:max-h-14 object-contain dark:hidden transition-transform group-hover:scale-[1.02]"
            src={logoLight}
            width={260}
            height={60}
            alt={siteName}
            priority
          />
          <Image
            className="w-auto h-full max-h-10 sm:max-h-12 lg:max-h-14 object-contain hidden dark:block transition-transform group-hover:scale-[1.02]"
            src={logoDark}
            width={260}
            height={60}
            alt={siteName}
            priority
          />
        </div>
      </Link>

      {/* Center Search Input */}
      <div className="w-full hidden md:block max-w-2xl mx-auto">
        <Search />
      </div>

      {/* Support & Contact Chip + Theme Toggle */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Desktop Support Chip */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-muted/60 border border-border/80">
            <span className="text-xl text-primary">
              <PiPhoneCallThin />
            </span>
            <div className="flex flex-col text-xs">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Support & Orders
              </span>
              <a
                href={`tel:${rawPhone}`}
                className="font-bold text-foreground hover:text-primary transition-colors tracking-tight"
              >
                {contactPhone}
              </a>
            </div>
          </div>

          <LanguageToggle />
          <ThemeToggle compact={true} />
        </div>

        {/* Mobile Actions: Language Toggle + Theme Toggle + Menu Drawer */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageToggle compact={true} />
          <ThemeToggle compact={true} />

          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open mobile navigation menu"
                className="p-2 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors flex items-center justify-center"
              >
                <MenuIcon className="w-5 h-5" />
              </button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[320px] sm:w-[380px] p-0 flex flex-col bg-card">
              <SheetHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
                <SheetTitle className="text-left font-bold text-base text-foreground">
                  {siteName}
                </SheetTitle>
              </SheetHeader>

              {/* Mobile Search inside drawer */}
              <div className="p-4 pb-2 md:hidden">
                <Search />
              </div>

              {/* Navigation Tabs (Menu / Categories) */}
              <div className="flex-1 overflow-y-auto px-4 py-2">
                <Tabs defaultValue="menu" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted">
                    <TabsTrigger value="menu">Menu</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                  </TabsList>

                  <TabsContent value="menu" className="space-y-1">
                    {headerMenus.map((item, idx) => (
                      <SheetClose asChild key={idx}>
                        <Link
                          href={item.url || "/"}
                          className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted hover:text-primary transition-colors"
                        >
                          <span>{item.name}</span>
                        </Link>
                      </SheetClose>
                    ))}
                  </TabsContent>

                  <TabsContent value="categories" className="space-y-1">
                    {categories.length > 0 ? (
                      categories.map((cat, idx) => (
                        <SheetClose asChild key={idx}>
                          <Link
                            href={`/shop?category=${encodeURIComponent(cat.slug || cat.categoryName)}`}
                            className="flex items-center justify-between py-2 px-3 rounded-lg text-sm text-foreground hover:bg-muted hover:text-primary transition-colors"
                          >
                            <span>{cat.categoryName}</span>
                          </Link>
                        </SheetClose>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground p-3">No categories loaded</p>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Mobile Drawer Footer: Phone support */}
              <div className="p-4 border-t border-border bg-muted/30">
                <a
                  href={`tel:${rawPhone}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-95 transition-opacity"
                >
                  <PhoneCall size={16} />
                  <span>Call {contactPhone}</span>
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </section>
  );
}
