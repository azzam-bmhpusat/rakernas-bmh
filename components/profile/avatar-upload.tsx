"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Camera, Eye, Trash2 } from "lucide-react";
import { removeAvatar, uploadAvatar, type ProfileActionResult } from "@/app/(site)/profile/actions";
import { AVATAR_MIME } from "@/lib/avatar";
import { UserAvatar } from "@/components/auth/user-avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const SIZE = 512;

/** Potong tengah jadi persegi 512px WebP agar kecil (< 1 MB) berapa pun ukuran foto aslinya. */
async function toSquareWebp(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = Math.min(SIZE, side);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak tersedia");
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
  if (!blob || blob.type !== "image/webp") throw new Error("WebP tidak didukung");
  return new File([blob], "avatar.webp", { type: "image/webp" });
}

export function AvatarUpload({ src, name }: { src: string | null; name: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const viewRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isPreview) backRef.current?.focus();
    else viewRef.current?.focus();
  }, [isPreview]);

  function report(result: ProfileActionResult) {
    if (result.success) {
      toast.success(result.message);
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error ?? "Terjadi kesalahan.");
    }
  }

  function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    event.target.value = "";
    if (!picked || isPending) return;
    startTransition(async () => {
      let file = picked;
      try {
        file = await toSquareWebp(picked);
      } catch {
        // browser tanpa dukungan: kirim file asli, server tetap memvalidasi
      }
      const fd = new FormData();
      fd.set("avatar", file);
      try {
        report(await uploadAvatar(fd));
      } catch {
        toast.error("Terjadi kesalahan saat mengunggah foto.");
      }
    });
  }

  function onRemove() {
    if (!src || isPending) return;
    startTransition(async () => {
      try {
        report(await removeAvatar());
      } catch {
        toast.error("Terjadi kesalahan saat menghapus foto.");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen && isPending) return;
        if (nextOpen) setIsPreview(false);
        setOpen(nextOpen);
      }}
    >
      <DialogTrigger
        type="button"
        aria-label="Kelola foto profil"
        aria-disabled={isPending}
        aria-busy={isPending}
        className="flex shrink-0 cursor-pointer flex-col items-center gap-3 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold-soft aria-disabled:cursor-wait lg:gap-4 lg:rounded-full"
      >
        <span className="relative block">
          <UserAvatar
            src={src}
            name={name}
            className="size-[72px] text-2xl ring-2 ring-brand-gold shadow-lg shadow-black/20 lg:size-[120px] lg:text-4xl"
          />
          <span
            aria-hidden="true"
            className="absolute right-0.5 bottom-0.5 hidden size-[34px] items-center justify-center rounded-full bg-brand-gold text-brand-green-night shadow-md lg:flex"
          >
            <Camera className="size-4" aria-hidden="true" />
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-white lg:hidden">
          <Camera className="size-3.5" aria-hidden="true" />
          {isPending ? "Memproses foto…" : "Ubah foto"}
        </span>
        {isPending && <span role="status" className="hidden text-xs text-white/75 lg:block">Memproses foto…</span>}
      </DialogTrigger>
      <input ref={inputRef} type="file" accept={AVATAR_MIME.join(",")} className="sr-only" onChange={onPick} tabIndex={-1} aria-hidden="true" />
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl p-6 sm:max-w-md">
        <DialogHeader className="pr-6">
          <DialogTitle>{isPreview && src ? "Lihat foto" : "Foto profil"}</DialogTitle>
          <DialogDescription>
            {isPreview && src ? "Foto profil Anda saat ini." : "Lihat, unggah, atau hapus foto profil Anda."}
          </DialogDescription>
        </DialogHeader>
        {isPreview && src ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- foto Supabase Storage, mengikuti UserAvatar tanpa remotePatterns */}
            <img src={src} alt={`Foto profil ${name}`} className="max-h-[60dvh] w-full rounded-xl object-contain" />
            <Button ref={backRef} type="button" variant="outline" className="h-11 rounded-xl" onClick={() => setIsPreview(false)}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Kembali
            </Button>
          </>
        ) : (
          <div className="grid gap-2" aria-busy={isPending}>
            {src && (
              <Button ref={viewRef} type="button" variant="ghost" className="h-12 justify-start rounded-xl px-4" disabled={isPending} onClick={() => setIsPreview(true)}>
                <Eye className="size-4" aria-hidden="true" />
                Lihat foto
              </Button>
            )}
            <Button type="button" variant="ghost" className="h-12 justify-start rounded-xl px-4" disabled={isPending} onClick={() => inputRef.current?.click()}>
              <Camera className="size-4" aria-hidden="true" />
              Unggah foto
            </Button>
            {src && (
              <Button type="button" variant="destructive" className="h-12 justify-start rounded-xl px-4" disabled={isPending} onClick={onRemove}>
                <Trash2 className="size-4" aria-hidden="true" />
                Hapus foto
              </Button>
            )}
            {isPending && (
              <p role="status" className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                Memproses foto…
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
