import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicFooter } from "@/components/rakernas/public-page";
import { ProfileContent } from "@/components/profile/profile-content";
import { ProfileSkeleton } from "@/components/profile/profile-skeleton";

export const metadata: Metadata = {
  title: "Profil Saya",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <>
      <main className="page-bg flex-1 pt-[calc(72px+env(safe-area-inset-top))]">
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileContent />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <PublicFooter />
      </Suspense>
    </>
  );
}
