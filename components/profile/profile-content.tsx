import { redirect } from "next/navigation";
import { connection } from "next/server";
import { BadgeCheck, CalendarClock, ChevronRight, QrCode, CircleAlert, MapPin, Phone, Lock, Shirt, Video, type LucideIcon } from "lucide-react";
import { cn } from "cn";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProfileForm } from "@/components/profile/profile-form";
import { ProfileBody, ProfileHero, ProfileParticipantLayout, ProfileSummaryCard } from "@/components/profile/profile-layout";
import { formatArrival, isoToWibLocal, isProfileComplete, profileStatus } from "@/lib/profile-contact";
import { MODE_KEHADIRAN_LABEL } from "@/lib/participant-options";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { QrAbsenDialog } from "@/components/profile/qr-absen-dialog";
import { createUserQrToken } from "@/lib/absen-token";
import { avatarPublicUrl } from "@/lib/avatar";
import { toUserRole } from "@/lib/user-schema";
import { FOOTER_DATA } from "@/content/rakernas";
import { logoutUser } from "@/app/(site)/login/actions";
import { buttonVariants } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";

const LOCKED_PAGES = ["Informasi Kamar Hotel", "Foto Galeri Kegiatan", "Materi Presentasi"];

function SummaryRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | null }) {
  return (
    <li className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink-muted">{label}</p>
        <p className={cn("wrap-anywhere text-sm", value ? "font-semibold text-ink" : "text-ink-muted italic")}>
          {value || "Belum diisi"}
        </p>
      </div>
    </li>
  );
}

export async function ProfileContent() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=%2Fprofile");

  // Kolom no_whatsapp / rencana_kedatangan privat: dibaca server-side untuk akun sendiri saja.
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role, nama, nama_google, perwakilan_daerah, jabatan, ukuran_baju, no_whatsapp, rencana_kedatangan, keterangan_kehadiran, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  // Role `user` (akun Google baru) belum peserta: tanpa form, hanya ajakan menghubungi panitia.
  const role = toUserRole(profile?.role);
  const isApplicant = role === "user";
  const complete = isProfileComplete(profile);
  // Peserta dengan profil lengkap: form hanya dibaca (updateProfile juga menolak).
  const locked = role === "peserta" && complete;
  const { filled, total } = profileStatus(profile);
  const percent = Math.round((filled / total) * 100);
  // Akun dari Google: nama Google (privat) hanya sebagai sapaan; tidak pernah menjadi `nama` publik.
  const googleName = profile?.nama_google?.trim() || "";
  const displayName = profile?.nama?.trim() || googleName || "Peserta Rakernas";
  const subtitle = [profile?.jabatan?.trim(), profile?.perwakilan_daerah?.trim()].filter(Boolean).join(" · ");
  const mode = profile?.keterangan_kehadiran as keyof typeof MODE_KEHADIRAN_LABEL | null | undefined;

  return (
    <>
      <ProfileHero
        avatar={<AvatarUpload src={avatarPublicUrl(profile?.avatar_url)} name={displayName} />}
        identity={
          <>
            <h1 id="profile-name" className="mt-1.5 wrap-anywhere font-heading text-2xl/[1.2] font-bold lg:text-[40px]/[1.2] lg:text-balance">{displayName}</h1>
            {subtitle && <p className="mt-1 wrap-anywhere text-sm text-white/80 sm:text-base">{subtitle}</p>}
            {user.email && <p className="mt-1 wrap-anywhere text-sm text-white/60">{user.email}</p>}
          </>
        }
        actions={
          <>
            {isApplicant ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold px-3 py-1.5 text-xs font-semibold text-brand-green-night">
                <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
                Belum terdaftar sebagai peserta
              </span>
            ) : (
              <div className="rounded-2xl border border-white/15 bg-white/8 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                      complete ? "bg-brand-green text-brand-green-night" : "bg-brand-gold text-brand-green-night",
                    )}
                  >
                    {complete ? <BadgeCheck className="size-3.5" aria-hidden="true" /> : <CircleAlert className="size-3.5" aria-hidden="true" />}
                    {complete ? "Profil lengkap" : "Belum lengkap"}
                  </span>
                  <span className="font-heading text-xl leading-none font-bold tabular-nums">{percent}%</span>
                </div>
                <div
                  className="mt-3 h-2 overflow-hidden rounded-full bg-white/15"
                  role="progressbar"
                  aria-label="Kelengkapan profil"
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-valuenow={filled}
                >
                  <div
                    className={cn("h-full rounded-full", complete ? "bg-brand-green" : "bg-brand-gold")}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-white/75">
                  {filled} dari {total} data terisi{complete ? "" : ` · ${total - filled} perlu dilengkapi`}
                </p>
              </div>
            )}
            {mode === "offline" && (
              <QrAbsenDialog
                token={createUserQrToken(user.id)}
                trigger={
                  <button
                    type="button"
                    className="flex min-h-[46px] w-full cursor-pointer items-center gap-2.5 rounded-2xl border border-white/15 bg-white/8 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
                  >
                    <QrCode className="size-[18px] text-brand-gold" aria-hidden="true" />
                    QR Code Absensi
                    <ChevronRight className="ml-auto size-4 text-white/80" aria-hidden="true" />
                  </button>
                }
              />
            )}
          </>
        }
      />

      <ProfileBody>
        {isApplicant ? (
          <ApplyParticipantCard />
        ) : (
          <ProfileParticipantLayout
            summary={
              <>
                <ProfileSummaryCard>
                  <SummaryRow
                    icon={mode === "online" ? Video : MapPin}
                    label="Keterangan kehadiran"
                    value={mode ? MODE_KEHADIRAN_LABEL[mode] ?? null : null}
                  />
                  <SummaryRow icon={CalendarClock} label="Rencana kedatangan" value={formatArrival(profile?.rencana_kedatangan)} />
                  <SummaryRow icon={Shirt} label="Ukuran baju" value={profile?.ukuran_baju ?? null} />
                  <SummaryRow icon={Phone} label="No WhatsApp" value={profile?.no_whatsapp ?? null} />
                </ProfileSummaryCard>
                {role === "peserta" && !complete && (
                  <>
                    <div className="flex gap-3 rounded-2xl border border-brand-gold/50 bg-gold-50 p-4 text-sm text-ink">
                      <CircleAlert className="mt-0.5 size-5 shrink-0 text-brand-gold-text" aria-hidden="true" />
                      <p>
                        <strong className="block">Lengkapi profil Anda</strong>
                        Untuk membuka halaman Informasi Kamar Hotel dan Publikasi.
                      </p>
                    </div>
                    <section aria-labelledby="profile-locked-pages" className="rounded-2xl border border-line bg-white p-5 text-ink lg:px-6">
                      <h2 id="profile-locked-pages" className="mb-3 text-xs font-semibold tracking-wide text-ink-muted uppercase">Akses terkunci</h2>
                      <ul className="space-y-2.5 text-sm">
                        {LOCKED_PAGES.map((label) => (
                          <li key={label} className="flex items-center gap-2">
                            <Lock className="size-4 shrink-0 text-ink-muted" aria-hidden="true" />
                            {label}
                          </li>
                        ))}
                      </ul>
                    </section>
                  </>
                )}
              </>
            }
            form={
              <ProfileForm
                readOnly={locked}
                key={`${user.email}-${profile?.nama}-${profile?.rencana_kedatangan}`}
                initial={{
                  email: user.email ?? "",
                  nama: profile?.nama ?? "",
                  perwakilanDaerah: profile?.perwakilan_daerah ?? "",
                  jabatan: profile?.jabatan ?? "",
                  ukuranBaju: profile?.ukuran_baju ?? "",
                  noWhatsapp: profile?.no_whatsapp ?? "",
                  rencanaKedatangan: isoToWibLocal(profile?.rencana_kedatangan),
                  keteranganKehadiran: profile?.keterangan_kehadiran ?? "",
                }}
              />
            }
          />
        )}
      </ProfileBody>
    </>
  );
}

/** Pengganti form profil untuk role `user`: keluar dari akun Google lalu masuk dengan akun email BMH. */
function ApplyParticipantCard() {
  const { phone, url } = FOOTER_DATA.committee;
  return (
    <section
      aria-labelledby="apply-participant-title"
      className="mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-3xl border border-line bg-white p-6 text-center shadow-sm sm:p-8"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-gold-100 ring-4 ring-gold-50">
        <Lock className="size-7 text-brand-gold-text" aria-hidden="true" />
      </span>
      <h2 id="apply-participant-title" className="font-heading text-xl font-bold text-pretty text-primary">
        Masuk dengan akun email BMH untuk akses halaman.
      </h2>
      <div className="flex flex-col gap-3 sm:flex-row">
        <form action={logoutUser}>
          <button type="submit" className={cn(buttonVariants(), "h-11 w-full rounded-xl px-5")}>
            Masuk dengan Akun BMH
          </button>
        </form>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Hubungi panitia via WhatsApp di ${phone} (tab baru)`}
          className={cn(buttonVariants({ variant: "outline" }), "h-11 gap-2 rounded-xl px-5")}
        >
          <WhatsAppIcon className="size-[18px]" />
          Hubungi via WhatsApp
        </a>
      </div>
    </section>
  );
}

