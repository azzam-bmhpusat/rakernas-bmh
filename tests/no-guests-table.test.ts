import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const root = path.join(__dirname, "..");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const sources = ["app", "components", "lib", "scripts"].flatMap((d) => walk(path.join(root, d)));
const rel = (f: string) => path.relative(root, f).replace(/\\/g, "/");

describe("tabel guests sudah dihapus: semua kode memakai profiles", () => {
  it("tidak ada kode yang membaca/menulis tabel guests", () => {
    const offenders = sources.filter((f) => /from\(\s*["'`]guests["'`]\s*\)|public\.guests|\.rpc\(\s*["']approve_registration["']/.test(fs.readFileSync(f, "utf-8")));
    expect(offenders.map(rel)).toEqual([]);
  });

  it("skrip usang yang menyisipkan ke guests sudah dihapus", () => {
    expect(fs.existsSync(path.join(root, "scripts", "seed-and-verify.ts"))).toBe(false);
    expect(fs.existsSync(path.join(root, "supabase", "seed.sql"))).toBe(false);
  });

  it("setiap pembacaan peserta dari profiles di kode aplikasi dibatasi pada profil yang punya nama", () => {
    // Pengecualian: pengelolaan akun (Manajemen User, pagar admin) memang membaca semua profil (role/email).
    const allowAllProfiles = new Set([
      "lib/user-list.ts",
      "app/(admin)/manajemen-user/actions.ts",
      "lib/participant-account.ts",
      "app/admin/actions.ts",
      // Profil akun sendiri (difilter .eq("id", user.id)), termasuk kolom privat no_whatsapp/rencana_kedatangan.
      "components/profile/profile-content.tsx",
      "app/(site)/profile/actions.ts",
      "components/rakernas/profile-gate.tsx",
      "components/auth/account-menu.tsx",
      "scripts/migrate-guests-to-profiles.ts",
      "scripts/verify-rls.ts",
      "scripts/create-admin.ts",
      "scripts/run-uat-simulation.ts",
      "scripts/cleanup-test-data.ts",
      // /form: baca/ubah satu peserta (difilter id + role peserta); reset kata sandi semua akun peserta.
      "app/(site)/form/actions.ts",
      "scripts/reset-peserta-passwords.ts",
    ]);
    const bad: string[] = [];
    for (const f of sources) {
      const name = rel(f);
      if (allowAllProfiles.has(name)) continue;
      const src = fs.readFileSync(f, "utf-8");
      // setiap .from("profiles") pada berkas ini harus diikuti filter nama tidak null dalam rantai yang sama
      for (const m of src.matchAll(/\.from\("profiles"\)([\s\S]{0,400}?)(?:;|\)\s*,\s*\n|\]\s*\)|\n\s*\n)/g)) {
        if (!m[0].includes('.not("nama", "is", null)')) bad.push(`${name}: ${m[0].slice(0, 80).replace(/\s+/g, " ")}`);
      }
    }
    expect(bad).toEqual([]);
  });
});
