"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertCircle,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  LockKeyhole,
  Mail,
  MapPin,
  MapPinned,
  Phone,
  Save,
  User,
  Video,
  type LucideIcon,
} from "lucide-react";
import { cn } from "cn";
import { updateProfile, type ProfileActionResult } from "@/app/(site)/profile/actions";
import { PROFILE_LOCKED_MESSAGE, formatArrival, wibLocalToIso } from "@/lib/profile-contact";
import { MODE_KEHADIRAN, MODE_KEHADIRAN_LABEL, UKURAN_BAJU } from "@/lib/participant-options";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ProfileSection as Section } from "@/components/profile/profile-layout";

export interface ProfileInitial {
  email: string;
  nama: string;
  perwakilanDaerah: string;
  jabatan: string;
  ukuranBaju: string;
  noWhatsapp: string;
  /** nilai datetime-local (WIB) */
  rencanaKedatangan: string;
  keteranganKehadiran: string;
}

const MODE_ICON: Record<(typeof MODE_KEHADIRAN)[number], LucideIcon> = { offline: MapPin, online: Video };
const MODE_HINT: Record<(typeof MODE_KEHADIRAN)[number], string> = {
  offline: "Hadir di lokasi acara",
  online: "Mengikuti dari jarak jauh",
};

const groupClass =
  "h-12 rounded-xl border-line bg-white has-[input:focus-visible]:border-primary has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-primary/15";
const labelClass = "text-[13px] font-semibold text-ink";
const optionCard =
  "relative flex cursor-pointer items-center rounded-xl border border-line bg-white transition-colors hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-secondary has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-primary/20";

function IconField({
  id,
  label,
  icon: Icon,
  missing = false,
  children,
}: {
  id: string;
  label: string;
  icon: LucideIcon;
  missing?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={labelClass}>
        {label}
        {missing && <RequiredMark />}
      </Label>
      <InputGroup className={cn(groupClass, missing && "border-danger")}>
        <InputGroupAddon className="pl-3.5 text-ink-muted">
          <Icon className="size-[18px]" aria-hidden="true" />
        </InputGroupAddon>
        {children}
      </InputGroup>
      {missing && <RequiredHint id={id} />}
    </div>
  );
}

function RequiredMark() {
  return (
    <span className="ml-0.5 text-danger" aria-hidden="true">
      *
    </span>
  );
}

function RequiredHint({ id }: { id: string }) {
  return (
    <p id={`${id}-required`} className="text-xs font-medium text-danger">
      Wajib diisi
    </p>
  );
}

/**
 * Tanda "Wajib diisi" untuk field kosong saat form dikirim. Memakai validasi bawaan browser
 * (atribut `required`): balon bawaan diganti tanda merah, pengiriman tetap terblokir.
 */
export function useMissingFields() {
  const [missing, setMissing] = useState<ReadonlySet<string>>(() => new Set());
  const lastInvalidAt = useRef(0);

  const formProps = {
    onInvalidCapture: (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const el = e.target as HTMLInputElement;
      if (!el.name) return;
      const now = Date.now();
      const newRound = now - lastInvalidAt.current > 200;
      lastInvalidAt.current = now;
      if (newRound) {
        (el.closest("fieldset") ?? el).scrollIntoView({ behavior: "smooth", block: "center" });
        if (el.type !== "radio") el.focus({ preventScroll: true });
      }
      setMissing((prev) => {
        const next = new Set(newRound ? [] : prev);
        next.add(el.name);
        return next;
      });
    },
    onChangeCapture: (e: FormEvent<HTMLFormElement>) => {
      const el = e.target as HTMLInputElement;
      if (el.name && el.checkValidity()) {
        setMissing((prev) => {
          if (!prev.has(el.name)) return prev;
          const next = new Set(prev);
          next.delete(el.name);
          return next;
        });
      }
    },
  };
  return { missing, formProps };
}

const LOCKED_HINT = "Dikunci. Hubungi panitia untuk mengubahnya.";

/**
 * Field terkunci (email, jabatan, nama & perwakilan daerah di /form): read-only dan tanpa `name`, jadi tidak ikut terkirim.
 * Server (updateProfile, submitParticipantForm) juga tidak membaca field ini.
 */
function LockedField({ id, label, icon: Icon, value, hint = LOCKED_HINT }: {
  id: string;
  label: string;
  icon: LucideIcon;
  value: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={labelClass}>
        {label}
      </Label>
      <InputGroup className="h-12 cursor-not-allowed rounded-xl border-dashed border-line bg-surface">
        <InputGroupAddon className="pl-3.5 text-ink-muted">
          <Icon className="size-[18px]" aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          id={id}
          readOnly
          value={value}
          aria-describedby={`${id}-locked`}
          className="h-12 cursor-not-allowed text-[15px] text-ink-muted"
        />
        <InputGroupAddon align="inline-end" className="pr-3.5 text-ink-muted">
          <LockKeyhole className="size-4" aria-hidden="true" />
        </InputGroupAddon>
      </InputGroup>
      <p id={`${id}-locked`} className="text-xs text-ink-muted">
        {hint}
      </p>
    </div>
  );
}

const inputClass = "h-12 text-[15px] text-ink";

/** Field data peserta & kontak (dipakai /profile dan /form). Nomor langkah dimulai dari `firstStep`. */
export function ProfileFields({
  initial,
  isPending,
  firstStep,
  jabatanEditable = false,
  lockedEmail,
  profileEmail,
  missing = new Set<string>(),
}: {
  initial: Omit<ProfileInitial, "email">;
  isPending: boolean;
  firstStep: number;
  jabatanEditable?: boolean;
  /** Dipakai /form: email, nama, dan perwakilan daerah ditampilkan terkunci (tidak terkirim). */
  lockedEmail?: string;
  /** /profile: email terkunci, nama dan daerah tetap dapat diedit bila profil belum lengkap. */
  profileEmail?: string;
  /** Nama field kosong saat dikirim (dari useMissingFields). */
  missing?: ReadonlySet<string>;
}) {
  const [arrival, setArrival] = useState(initial.rencanaKedatangan);
  const preview = formatArrival(wibLocalToIso(arrival));
  // Ukuran baju hanya untuk peserta yang hadir offline (baju dibagikan di lokasi acara).
  const [mode, setMode] = useState(initial.keteranganKehadiran);
  const shirtSize = mode === "offline" && (
    <fieldset className="mt-5 space-y-2" disabled={isPending}>
      <legend className={cn(labelClass, "mb-2")}>
        Ukuran Baju
        {missing.has("ukuran_baju") && <RequiredMark />}
      </legend>
      {missing.has("ukuran_baju") && <RequiredHint id="ukuran_baju" />}
      <div className={cn("grid gap-2 sm:grid-cols-6", profileEmail === undefined ? "grid-cols-3" : "grid-cols-6 max-[359px]:grid-cols-3")}>
        {UKURAN_BAJU.map((size) => (
          <label key={size} className={cn(optionCard, "h-12 justify-center text-sm font-semibold text-ink has-[:checked]:text-primary")}>
            <input
              type="radio"
              name="ukuran_baju"
              value={size}
              required
              defaultChecked={initial.ukuranBaju === size}
              className="sr-only"
            />
            {size}
          </label>
        ))}
      </div>
      {profileEmail !== undefined && <p className="text-xs text-ink-muted">Wajib dipilih untuk pembagian seragam.</p>}
    </fieldset>
  );

  return (
    <>
      <Section step={firstStep} title="Data Peserta" description="Ditampilkan pada daftar peserta Rakernas.">
        <div className="grid gap-4 md:grid-cols-2">
          {(profileEmail !== undefined || lockedEmail !== undefined) && (
            <div className="md:col-span-2">
              <LockedField id="email" label="Email" icon={Mail} value={profileEmail ?? lockedEmail ?? ""} hint={profileEmail !== undefined ? "Email akun tidak dapat diubah." : undefined} />
            </div>
          )}
          <div className="md:col-span-2">
            {lockedEmail !== undefined ? (
              <LockedField id="nama" label="Nama lengkap (beserta gelar akademik)" icon={User} value={initial.nama} />
            ) : (
            <IconField id="nama" missing={missing.has("nama")} label="Nama lengkap (beserta gelar akademik)" icon={User}>
                <InputGroupInput
                  id="nama"
                  name="nama"
                  required
                  maxLength={100}
                  autoComplete="name"
                  defaultValue={initial.nama}
                  className={inputClass}
                  disabled={isPending}
                />
              </IconField>
            )}
          </div>
          {lockedEmail !== undefined ? (
            <LockedField id="perwakilan_daerah" label="Perwakilan Daerah" icon={MapPinned} value={initial.perwakilanDaerah} />
          ) : (
            <IconField id="perwakilan_daerah" missing={missing.has("perwakilan_daerah")} label="Perwakilan Daerah" icon={MapPinned}>
              <InputGroupInput
                id="perwakilan_daerah"
                name="perwakilan_daerah"
                required
                maxLength={100}
                defaultValue={initial.perwakilanDaerah}
                className={inputClass}
                disabled={isPending}
              />
            </IconField>
          )}
          {jabatanEditable ? (
            <IconField id="jabatan" missing={missing.has("jabatan")} label="Jabatan" icon={Briefcase}>
              <InputGroupInput
                id="jabatan"
                name="jabatan"
                required
                maxLength={100}
                defaultValue={initial.jabatan}
                className={inputClass}
                disabled={isPending}
              />
            </IconField>
          ) : (
            <LockedField id="jabatan" label="Jabatan" icon={Briefcase} value={initial.jabatan || "Belum diatur panitia"} />
          )}
        </div>
      </Section>

      <Section step={firstStep + 1} title="Kontak & Kedatangan" description="Dipakai panitia untuk koordinasi selama acara.">
        <div className="grid gap-4 md:grid-cols-2">
          <IconField id="no_whatsapp" missing={missing.has("no_whatsapp")} label="No WhatsApp" icon={Phone}>
            <InputGroupInput
              id="no_whatsapp"
              name="no_whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              defaultValue={initial.noWhatsapp}
              placeholder="081234567890"
              className={inputClass}
              disabled={isPending}
            />
          </IconField>
          <div className="space-y-1.5">
            <IconField id="rencana_kedatangan" missing={missing.has("rencana_kedatangan")} label="Rencana Kedatangan (WIB)" icon={CalendarClock}>
              <InputGroupInput
                id="rencana_kedatangan"
                name="rencana_kedatangan"
                type="datetime-local"
                required
                value={arrival}
                onChange={(e) => setArrival(e.target.value)}
                className={inputClass}
                disabled={isPending}
              />
            </IconField>
            {preview && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
                <CalendarClock className="size-3.5" aria-hidden="true" />
                {preview}
              </p>
            )}
          </div>
        </div>

        <fieldset className="mt-5" disabled={isPending}>
          <legend className={cn(labelClass, "mb-2")}>
            Keterangan Kehadiran
            {missing.has("keterangan_kehadiran") && <RequiredMark />}
          </legend>
          {missing.has("keterangan_kehadiran") && <RequiredHint id="keterangan_kehadiran" />}
          <div className="grid gap-3 sm:grid-cols-2">
            {MODE_KEHADIRAN.map((mode) => {
              const Icon = MODE_ICON[mode];
              return (
                <label key={mode} className={cn(optionCard, "group/mode min-h-16 gap-3 px-4 py-3")}>
                  <input
                    type="radio"
                    name="keterangan_kehadiran"
                    value={mode}
                    required
                    defaultChecked={initial.keteranganKehadiran === mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="sr-only"
                  />
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-has-[:checked]/mode:bg-primary group-has-[:checked]/mode:text-primary-foreground">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink">{MODE_KEHADIRAN_LABEL[mode]}</span>
                    <span className="block text-xs text-ink-muted">{MODE_HINT[mode]}</span>
                  </span>
                  <CheckCircle2
                    aria-hidden="true"
                    className="size-5 shrink-0 text-primary opacity-0 transition-opacity group-has-[:checked]/mode:opacity-100"
                  />
                </label>
              );
            })}
          </div>
        </fieldset>

        {shirtSize}
      </Section>
    </>
  );
}

/** Bar kirim: menempel di bawah layar pada HP, biasa di akhir form pada layar lebar. */
export function SubmitBar({
  error,
  isPending,
  hint,
  label,
  pendingLabel,
  icon: Icon,
  inFlow = false,
}: {
  error?: string;
  isPending: boolean;
  hint: string;
  label: string;
  pendingLabel: string;
  icon: LucideIcon;
  inFlow?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-b-3xl border-t border-line px-5 py-4 sm:px-7",
      inFlow ? "bg-surface" : "sticky bottom-(--bottom-nav-offset) z-10 bg-white/90 backdrop-blur-md md:static md:bg-surface md:backdrop-blur-none",
    )}>
      {error && (
        <div
          role="alert"
          className="mb-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm leading-relaxed text-danger"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
      {/* pr-16 di HP: sisakan ruang untuk tombol WhatsApp melayang di kanan bawah */}
      <div className={cn("flex flex-col gap-2 md:flex-row md:items-center md:justify-between", !inFlow && "pr-16 md:pr-0")}>
        <p className={cn("text-sm text-ink-muted", !inFlow && "hidden md:block")}>{hint}</p>
        <Button
          type="submit"
          disabled={isPending}
          className={cn("w-full rounded-xl bg-primary px-6 text-[15px] font-semibold text-white hover:bg-brand-green-deep md:w-auto", inFlow ? "h-11" : "h-12")}
        >
          {isPending ? pendingLabel : (
            <>
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export function ProfileForm({ initial, readOnly = false }: { initial: ProfileInitial; readOnly?: boolean }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<ProfileActionResult | null, FormData>(updateProfile, null);
  const { missing, formProps } = useMissingFields();

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message ?? "Profil berhasil disimpan.");
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} {...formProps}>
      {/* Peserta dengan profil lengkap: semua field dikunci, tanpa tombol simpan. */}
      <fieldset disabled={readOnly} className="min-w-0">
        <ProfileFields initial={initial} isPending={isPending} firstStep={1} profileEmail={initial.email} missing={missing} />
      </fieldset>

      {readOnly ? (
        <div className="flex items-start gap-2.5 rounded-b-3xl border-t border-line bg-surface px-5 py-4 text-sm text-ink-muted sm:px-7">
          <LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <p>{PROFILE_LOCKED_MESSAGE}</p>
        </div>
      ) : (
        <SubmitBar
          error={state?.error}
          isPending={isPending}
          hint="Pastikan data sudah benar sebelum disimpan."
          label="Simpan Perubahan"
          pendingLabel="Menyimpan..."
          icon={Save}
          inFlow
        />
      )}
    </form>
  );
}
