import { Briefcase, CalendarClock, Camera, LockKeyhole, Mail, MapPin, MapPinned, Phone, Save, Shirt, User, Video, type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileBody, ProfileHero, ProfileParticipantLayout, ProfileSection, ProfileSummaryCard } from "@/components/profile/profile-layout";
import { MODE_KEHADIRAN_LABEL, UKURAN_BAJU } from "@/lib/participant-options";

function FieldSkeleton({ label, icon: Icon, locked = false, hint }: {
  label: string;
  icon: LucideIcon;
  locked?: boolean;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[13px] font-semibold text-ink">{label}</p>
      <div className={`flex h-12 items-center gap-3 rounded-xl border border-line px-3.5 ${locked ? "border-dashed bg-surface" : "bg-white"}`}>
        <Icon className="size-[18px] shrink-0 text-ink-muted" aria-hidden="true" />
        <Skeleton aria-hidden="true" className="h-4 w-3/5 bg-line/60 motion-reduce:animate-none" />
        {locked && <LockKeyhole className="ml-auto size-4 shrink-0 text-ink-muted" aria-hidden="true" />}
      </div>
      {hint && <p className="text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

/** Static labels and card frames stay visible; only account values are placeholders. */
export function ProfileSkeleton() {
  return (
    <div aria-busy="true" aria-label="Memuat profil">
      <p role="status" className="sr-only">Memuat data profil…</p>
      <ProfileHero
        avatar={
          <div className="flex shrink-0 flex-col items-center gap-3 lg:gap-4" aria-hidden="true">
            <Skeleton className="size-[72px] rounded-full bg-white/12 ring-2 ring-brand-gold/40 motion-reduce:animate-none lg:size-[120px]" />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap lg:hidden">
              <Camera className="size-3.5" />
              Ubah foto
            </span>
          </div>
        }
        identity={
          <>
            <h1 className="sr-only">Profil Saya</h1>
            <Skeleton aria-hidden="true" className="mt-1.5 h-7 w-4/5 max-w-80 bg-white/12 motion-reduce:animate-none lg:h-12" />
            <Skeleton aria-hidden="true" className="mt-1 h-5 w-3/4 max-w-64 bg-white/10 motion-reduce:animate-none sm:h-6" />
            <Skeleton aria-hidden="true" className="mt-1 h-5 w-2/3 max-w-56 bg-white/10 motion-reduce:animate-none" />
          </>
        }
        actions={
          <>
            <div className="rounded-2xl border border-white/15 bg-white/8 p-4" aria-hidden="true">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-6 w-28 rounded-full bg-white/12 motion-reduce:animate-none" />
                <Skeleton className="h-5 w-10 bg-white/12 motion-reduce:animate-none" />
              </div>
              <Skeleton className="mt-3 h-2 w-full rounded-full bg-white/12 motion-reduce:animate-none" />
              <Skeleton className="mt-2 h-4 w-4/5 bg-white/10 motion-reduce:animate-none" />
            </div>
            <Skeleton aria-hidden="true" className="h-[46px] w-full rounded-2xl border border-white/15 bg-white/8 motion-reduce:animate-none" />
          </>
        }
      />
      <ProfileBody>
        <ProfileParticipantLayout
          summary={
            <ProfileSummaryCard>
              {[
                { icon: MapPin, label: "Keterangan kehadiran", width: "w-32" },
                { icon: CalendarClock, label: "Rencana kedatangan", width: "w-40" },
                { icon: Shirt, label: "Ukuran baju", width: "w-8" },
                { icon: Phone, label: "No WhatsApp", width: "w-28" },
              ].map(({ icon: Icon, label, width }) => (
                <li key={label} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                    <Icon className="size-[18px]" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-ink-muted">{label}</p>
                    <Skeleton aria-hidden="true" className={`my-0.5 h-4 max-w-full bg-line/60 motion-reduce:animate-none ${width}`} />
                  </div>
                </li>
              ))}
            </ProfileSummaryCard>
          }
          form={
            <>
              <ProfileSection step={1} title="Data Peserta" description="Ditampilkan pada daftar peserta Rakernas.">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <FieldSkeleton label="Email" icon={Mail} locked hint="Email akun tidak dapat diubah." />
                  </div>
                  <div className="md:col-span-2">
                    <FieldSkeleton label="Nama lengkap (beserta gelar akademik)" icon={User} />
                  </div>
                  <FieldSkeleton label="Perwakilan Daerah" icon={MapPinned} />
                  <FieldSkeleton label="Jabatan" icon={Briefcase} locked hint="Dikunci. Hubungi panitia untuk mengubahnya." />
                </div>
                <div className="mt-5 space-y-2">
                  <p className="text-[13px] font-semibold text-ink">Ukuran Baju</p>
                  <div className="grid grid-cols-6 gap-2 max-[359px]:grid-cols-3">
                    {UKURAN_BAJU.map((size) => (
                      <Skeleton key={size} aria-hidden="true" className="h-12 rounded-xl bg-line/60 motion-reduce:animate-none" />
                    ))}
                  </div>
                  <p className="text-xs text-ink-muted">Wajib dipilih untuk pembagian seragam.</p>
                </div>
              </ProfileSection>
              <ProfileSection step={2} title="Kontak & Kedatangan" description="Dipakai panitia untuk koordinasi selama acara.">
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldSkeleton label="No WhatsApp" icon={Phone} />
                  <FieldSkeleton label="Rencana Kedatangan (WIB)" icon={CalendarClock} />
                </div>
                <div className="mt-5">
                  <p className="mb-2 text-[13px] font-semibold text-ink">Keterangan Kehadiran</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {([
                      { mode: "offline", icon: MapPin, hint: "Hadir di lokasi acara" },
                      { mode: "online", icon: Video, hint: "Mengikuti dari jarak jauh" },
                    ] as const).map(({ mode, icon: Icon, hint }) => (
                      <div key={mode} className="flex min-h-16 items-center gap-3 rounded-xl border border-line bg-white px-4 py-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                          <Icon className="size-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-ink">{MODE_KEHADIRAN_LABEL[mode]}</span>
                          <span className="block text-xs text-ink-muted">{hint}</span>
                        </span>
                        <Skeleton aria-hidden="true" className="size-5 shrink-0 rounded-full bg-line/60 motion-reduce:animate-none" />
                      </div>
                    ))}
                  </div>
                </div>
              </ProfileSection>
              <div className="rounded-b-3xl border-t border-line bg-surface px-5 py-4 sm:px-7">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-ink-muted">Pastikan data sudah benar sebelum disimpan.</p>
                  <button type="button" disabled className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-[15px] font-semibold whitespace-nowrap text-white opacity-50 md:w-auto">
                    <Save className="size-4" aria-hidden="true" />
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </>
          }
        />
      </ProfileBody>
    </div>
  );
}
