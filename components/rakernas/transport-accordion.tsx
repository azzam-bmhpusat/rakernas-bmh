"use client";

import { useState } from "react";
import Image from "next/image";
import { Bus, Car, Footprints, Home, MapPin, Navigation, Plane, Star, TrainFront } from "lucide-react";
import { cn } from "cn";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TRANSPORT_DATA, type TransportItem } from "@/content/rakernas";
import { DEFAULT_EVENT_SETTINGS } from "@/lib/event-settings";
import { buildTransportDirectionsUrl } from "@/lib/transport-directions";
import { Reveal, RevealItem, RevealStagger } from "@/components/motion/reveal";

function getStopIcon(iconType: TransportItem["icon"]) {
  if (iconType === "train") return TrainFront;
  return iconType === "plane" ? Plane : Bus;
}

type Filter = "all" | TransportItem["icon"];
const FILTERS: { value: Filter; label: string; icon?: typeof Bus }[] = [
  { value: "all", label: "Semua" },
  { value: "bus", label: "Bus / TJ", icon: Bus },
  { value: "train", label: "Kereta / MRT", icon: TrainFront },
  { value: "plane", label: "Pesawat", icon: Plane },
];

const ITEMS = TRANSPORT_DATA.items.map((item, index) => ({ item, value: `origin-${index}` }));

export function TransportSection({
  venueName = TRANSPORT_DATA.destination.name,
  venueAddress = TRANSPORT_DATA.destination.address,
  mapsUrl = DEFAULT_EVENT_SETTINGS.mapsUrl,
  footerUrl = DEFAULT_EVENT_SETTINGS.footerUrl,
}: { venueName?: string; venueAddress?: string; mapsUrl?: string; footerUrl?: string } = {}) {
  const { announcement } = TRANSPORT_DATA;
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<string[]>(["origin-0"]);
  const visible = ITEMS.filter(({ item }) => filter === "all" || item.icon === filter);

  return (
    <div className="site-container relative">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <Reveal className="flex max-w-[560px] flex-col gap-2 lg:gap-3">
          <p className="text-[11px] font-semibold tracking-[2px] text-[#1E7F62] uppercase lg:text-xs lg:tracking-[2.4px]">
            {TRANSPORT_DATA.badge}
          </p>
          <h2 className="font-heading text-[28px] font-bold text-primary lg:text-[40px]">{TRANSPORT_DATA.title}</h2>
          <p className="text-sm/[22px] text-[#4F7A72] lg:text-base/[24px]">{TRANSPORT_DATA.description}</p>
        </Reveal>
        <div
          role="group"
          aria-label="Saring jenis transportasi"
          className="grid min-w-0 grid-cols-2 gap-2 md:flex md:w-fit md:shrink-0 md:gap-1.5 md:rounded-full md:border md:border-white/80 md:bg-white/80 md:p-1.5 md:shadow-[0_8px_24px_#04362F14] md:backdrop-blur-md"
        >
          {FILTERS.map(({ value, label, icon: Icon }) => {
            const active = filter === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(value)}
                className={cn(
                  "inline-flex min-h-11 min-w-0 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:min-h-9 md:justify-start",
                  active
                    ? "bg-linear-to-b from-[#0B6355] to-[#04362F] text-white shadow-[0_4px_12px_#09504640]"
                    : "bg-white text-[#073B33] ring-1 ring-[#DCE8E5] hover:text-primary md:bg-transparent md:ring-0",
                )}
              >
                {Icon && <Icon aria-hidden="true" className="size-3.5 shrink-0" />}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:mt-12 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start lg:gap-10">
        {/* Kolom kanan: timeline titik kedatangan */}
        <div className="min-w-0 lg:col-start-2 lg:row-start-1">
          <RevealStagger key={filter} stagger={0.06}>
            <Accordion value={open} onValueChange={(v) => setOpen(v as string[])} className="relative flex flex-col gap-3">
              <span aria-hidden="true" className="absolute top-6 bottom-6 left-[21px] hidden w-px bg-[#DCE8E5] sm:block" />
              {visible.map(({ item, value }, index) => {
                const Icon = getStopIcon(item.icon);
                const isOpen = open.includes(value);
                const nearest = value === "origin-0";
                return (
                  <RevealItem key={value} y={16}>
                    <div className="flex gap-4">
                      <span
                        className={cn(
                          "relative z-10 mt-3 hidden size-11 shrink-0 items-center justify-center rounded-full ring-4 ring-[#F4F8F7] sm:flex",
                          isOpen ? "bg-linear-to-b from-[#0B6355] to-[#04362F] text-brand-gold" : "bg-[#EEF8F3] text-primary",
                        )}
                      >
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <AccordionItem
                        value={value}
                        className={cn(
                          "min-w-0 flex-1 rounded-[18px] border bg-white px-4 shadow-[0_4px_14px_-6px_#04362F1F] transition-colors md:px-5",
                          isOpen ? "border-[#1E7F62]/40 bg-[#FBFEFC]" : "border-[#DCE8E5]",
                        )}
                      >
                        <AccordionTrigger className="min-h-11 items-center gap-3 py-4 text-left hover:no-underline">
                          <span className="flex min-w-0 flex-1 flex-col gap-1">
                            {nearest && index === 0 && (
                              <span className="inline-flex w-fit items-center gap-1 rounded-full bg-brand-gold px-2 py-0.5 text-[10px] font-bold tracking-[1px] text-[#04362F] uppercase">
                                <Star aria-hidden="true" className="size-3 fill-current" />
                                Paling dekat
                              </span>
                            )}
                            <span className="font-heading text-[15px] font-semibold text-[#073B33] md:text-base">{item.name}</span>
                            <span className="text-[13px] font-normal text-[#4F7A72] md:text-sm">{item.accessInfo}</span>
                          </span>
                          <span className="hidden shrink-0 rounded-full bg-[#FFF7E8] px-3 py-1 text-[13px] font-semibold text-[#9A6A12] tabular-nums sm:inline">
                            {item.estimatedFare}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <span className="mb-3 inline-flex rounded-full bg-[#FFF7E8] px-3 py-1 text-[13px] font-semibold text-[#9A6A12] tabular-nums sm:hidden">
                            {item.estimatedFare}
                          </span>
                          <p className="text-sm/[22px] text-[#4F7A72] md:text-[15px]/[24px]">{item.description}</p>
                          <p className="mt-2 text-[13px] text-[#4F7A72]">
                            <span className="font-semibold text-[#073B33]">{item.transportMode}</span> · {item.distanceInfo}
                          </p>
                          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                            <a
                              href={buildTransportDirectionsUrl(item, "walking")}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Jalan kaki dari ${item.name} ke ${TRANSPORT_DATA.destination.name} di Google Maps`}
                              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-linear-to-b from-[#0B6355] to-[#04362F] px-5 text-sm font-semibold text-white transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <Footprints aria-hidden="true" className="size-4" />
                              {TRANSPORT_DATA.walkingLinkLabel}
                            </a>
                            <a
                              href={buildTransportDirectionsUrl(item, "driving")}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Rute berkendara dari ${item.name} ke ${TRANSPORT_DATA.destination.name} di Google Maps`}
                              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#DCE8E5] bg-white px-5 text-sm font-semibold text-primary transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <Car aria-hidden="true" className="size-4" />
                              {TRANSPORT_DATA.drivingLinkLabel}
                            </a>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </div>
                  </RevealItem>
                );
              })}
            </Accordion>
          </RevealStagger>
          <p className="mt-4 text-[13px] text-[#4F7A72] sm:pl-[60px]">
            Waktu perjalanan dan harga merupakan perkiraan dan dapat berubah.
          </p>
        </div>

        {/* Kolom kiri: tujuan akhir + info transit */}
        <Reveal className="flex flex-col gap-5 lg:sticky lg:top-28 lg:col-start-1 lg:row-start-1">
          <div className="flex flex-col gap-4 rounded-3xl border border-white bg-white p-3.5 shadow-[0_12px_32px_-12px_#04362F33]">
            <div className="relative h-[200px] overflow-hidden rounded-[18px] lg:h-[240px]">
              <Image
                src="/galeri-fasilitas-hotel/kamar.jpg"
                alt={`Kamar ${venueName}`}
                fill
                sizes="(min-width: 1024px) 392px, 100vw"
                className="object-cover"
              />
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-white/85 py-1.5 pr-3.5 pl-1.5 text-[13px] font-semibold text-[#04362F] shadow-md backdrop-blur-md">
                <span className="flex size-7 items-center justify-center rounded-full bg-brand-gold">
                  <MapPin aria-hidden="true" className="size-3.5" />
                </span>
                {venueName}
              </span>
            </div>
            <div className="flex flex-col gap-1 px-1">
              <p className="text-[11px] font-bold tracking-[1.4px] text-[#1E7F62] uppercase">Tujuan Akhir</p>
              <p className="text-sm/[22px] text-[#073B33]">{venueAddress}</p>
            </div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Buka ${venueName} di Google Maps (tab baru)`}
              className="flex min-h-12 items-center justify-between rounded-full bg-linear-to-b from-[#0B6355] to-[#04362F] py-1.5 pr-1.5 pl-5 text-sm font-semibold text-white shadow-[0_6px_16px_#09504640] transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Buka di Google Maps
              <span className="flex size-9 items-center justify-center rounded-full bg-brand-gold text-[#04362F]">
                <Navigation aria-hidden="true" className="size-4" />
              </span>
            </a>
          </div>

          <div role="note" className="flex flex-col gap-4 rounded-3xl border border-brand-gold/30 bg-[#FFFBF2] p-5">
            <div className="flex gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#FFF1D6] text-[#9A6A12]">
                <Home aria-hidden="true" className="size-4" />
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-sm/[22px] text-[#073B33]">{announcement.text.replace(/:\s*/, " ")}{announcement.linkLabel}.</p>
                <a
                  href={footerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit rounded-sm text-[13px] font-semibold text-[#1E7F62] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Hubungi panitia via WhatsApp
                </a>
              </div>
            </div>
            <a
              href={announcement.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Buka lokasi transit Guest House YPPH Depok di Google Maps"
              className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-linear-to-b from-[#0B6355] to-[#04362F] text-sm font-semibold text-white transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <MapPin aria-hidden="true" className="size-4" />
              Lihat lokasi transit
            </a>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
