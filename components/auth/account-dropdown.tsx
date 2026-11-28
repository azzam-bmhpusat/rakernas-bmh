"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Download, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { useInstallPrompt } from "@/components/pwa/use-install-prompt";
import { cn } from "cn";
import { UserAvatar } from "./user-avatar";
import { logoutUser } from "@/app/(site)/login/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const itemClass =
  "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium text-[#073B33] focus:bg-[#EEF8F3] focus:text-[#073B33] data-highlighted:bg-[#EEF8F3]";

/** Menu profil di navbar (hanya lingkaran avatar): Dashboard (khusus admin), Profil (/profile) dan Logout. */
export function AccountDropdown({
  name,
  email,
  avatarUrl = null,
  isAdmin = false,
}: {
  name: string;
  email: string;
  avatarUrl?: string | null;
  isAdmin?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const { canInstall, install } = useInstallPrompt();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={`Menu profil ${name || email}`}
            className="relative inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full shadow-[0_4px_12px_#04362F26] ring-2 ring-white transition-shadow hover:ring-[#D9F0E4] focus-visible:outline-none focus-visible:ring-ring lg:size-11"
          />
        }
      >
        <UserAvatar src={avatarUrl} name={name || email} className="size-full text-sm" />
        <span aria-hidden="true" className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-white bg-[#39BA87] lg:size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="relative w-60 gap-0.5 rounded-2xl border-0 bg-white/80 bg-linear-to-b from-white/50 via-white/0 via-60% to-white/0 p-1.5 shadow-[0_8px_24px_#04362F14,inset_0_1px_0_#FFFFFFE6] ring-0 backdrop-blur-[32px] backdrop-saturate-150"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent [background:linear-gradient(to_bottom,#FFFFFF,#09504626)_border-box] [mask:linear-gradient(#000_0_0)_padding-box_exclude,linear-gradient(#000_0_0)_border-box]"
        />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2.5 p-2.5 font-normal">
            <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full ring-2 ring-[#D9F0E4]">
              <UserAvatar src={avatarUrl} name={name || email} className="size-10 text-sm" />
              <span aria-hidden="true" className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-white bg-[#39BA87]" />
            </span>
            <span className="min-w-0 flex-1">
              {name && <span className="block truncate text-sm font-semibold text-[#073B33]">{name}</span>}
              <span className="mt-0.5 block truncate text-xs text-[#4F7A72]">{email}</span>
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="mx-0 my-0.5 bg-[#DCE8E5]" />
        {isAdmin && (
          <DropdownMenuItem render={<Link href="/dashboard" target="_blank" rel="noopener noreferrer" />} className={itemClass}>
            <LayoutDashboard className="size-4 text-primary!" />
            <span className="flex-1">Dashboard</span>
            <span className="rounded-full bg-[#FFF7E8] px-2 py-0.5 text-[11px] font-semibold text-[#9A6A12]!">Admin</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem render={<Link href="/profile" />} className={itemClass}>
          <UserRound className="size-4 text-primary!" />
          Profil
        </DropdownMenuItem>
        {canInstall && (
          <DropdownMenuItem onClick={install} className={itemClass}>
            <Download className="size-4 text-primary!" />
            Unduh Aplikasi
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="mx-0 my-0.5 bg-[#DCE8E5]" />
        <DropdownMenuItem
          disabled={isPending}
          onClick={() => startTransition(() => logoutUser())}
          className={cn(itemClass, "rounded-b-[calc(var(--radius)*1.8_-_6px)] text-[#C2410C] focus:bg-orange-50 focus:text-[#C2410C] data-highlighted:bg-orange-50 data-highlighted:text-[#C2410C]")}
        >
          <LogOut className="size-4 text-[#C2410C]!" />
          {isPending ? "Keluar..." : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
