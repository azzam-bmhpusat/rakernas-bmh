import type { ReactNode } from "react";

/** Shared by the streamed content and its fallback to keep the page geometry stable. */
export function ProfileHero({ avatar, identity, actions }: {
  avatar: ReactNode;
  identity: ReactNode;
  actions: ReactNode;
}) {
  return (
    <section
      aria-label="Profil Saya"
      className="relative [--profile-nav:calc(72px_+_env(safe-area-inset-top))] -mt-[var(--profile-nav)] rounded-b-[20px] bg-linear-to-br from-brand-green-deep to-brand-green-night pt-(--profile-nav) text-white"
    >
      <div className="site-container grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 pt-8 pb-8 text-left lg:flex lg:gap-7 lg:pt-10 lg:pb-10">
        {avatar}
        <div className="w-full min-w-0 lg:flex-1">
          <p className="text-xs font-semibold tracking-[0.16em] text-brand-gold-soft uppercase">Profil Saya</p>
          {identity}
        </div>
        <div className="col-span-full flex w-full flex-col items-stretch gap-4 lg:w-[280px] lg:shrink-0 lg:gap-3">
          {actions}
        </div>
      </div>
    </section>
  );
}

export function ProfileBody({ children }: { children: ReactNode }) {
  return <div className="site-container pt-5 pb-12 lg:pt-10 lg:pb-[104px]">{children}</div>;
}

export function ProfileParticipantLayout({ summary, form }: { summary: ReactNode; form: ReactNode }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,380fr)_minmax(0,792fr)] lg:items-start lg:gap-7">
      <aside className="min-w-0 space-y-4">{summary}</aside>
      <div className="min-w-0 rounded-3xl border border-line bg-white shadow-sm">{form}</div>
    </div>
  );
}

export function ProfileSummaryCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-line bg-white p-5 shadow-sm lg:p-6">
      <h2 className="font-heading text-base font-semibold text-primary">Ringkasan Kehadiran</h2>
      <ul className="mt-4 divide-y divide-line">{children}</ul>
    </div>
  );
}

export function ProfileSection({ step, title, description, children }: {
  step: number;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-line px-5 py-6 last:border-b-0 sm:px-7" aria-labelledby={`profile-step-${step}`}>
      <div className="mb-5 flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {step}
        </span>
        <div>
          <h2 id={`profile-step-${step}`} className="font-heading text-base font-semibold text-primary">{title}</h2>
          <p className="text-sm text-ink-muted">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
