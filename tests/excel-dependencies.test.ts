import { PassThrough, Readable } from "node:stream";
import { describe, expect, it, vi } from "vitest";
import ExcelJS from "exceljs";

vi.mock("server-only", () => ({}));

import { buildUserImportTemplate, parseUserImportWorkbook } from "@/lib/user-import";

describe("ExcelJS dependency compatibility", () => {
  it("preserves template validation, text formatting, and imported participant data", async () => {
    const data = await buildUserImportTemplate();
    const buffer = Uint8Array.from(data).buffer;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.getWorksheet("Template")!;

    expect(sheet.getCell("I2").numFmt).toBe("@");
    expect(sheet.getCell("I2").value).toBe("081234567890");
    expect(sheet.getCell("C2").dataValidation).toMatchObject({
      type: "list",
      formulae: ['"admin,direktur,pengurus,peserta,user"'],
    });
    expect(await parseUserImportWorkbook(buffer)).toMatchObject({
      ok: true,
      rows: [{
        rowNumber: 2,
        input: { email: "peserta@contoh.com", password: "RahasiaKuat123", role: "peserta" },
        profile: { nama: "Ahmad Fauzi", no_whatsapp: "081234567890", rencana_kedatangan: "2026-11-20T14:00" },
      }],
    });
  });

  it("returns a readable error for an invalid XLSX upload", async () => {
    expect(await parseUserImportWorkbook(new TextEncoder().encode("invalid workbook").buffer))
      .toMatchObject({ ok: false, error: expect.stringContaining("File tidak dapat dibaca") });
  });

  it("writes and reads streaming workbooks with cell styles", async () => {
    const output = new PassThrough();
    const chunks: Buffer[] = [];
    output.on("data", (chunk: Buffer) => chunks.push(chunk));
    const writer = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: output, useStyles: true });
    const sheet = writer.addWorksheet("Peserta");
    sheet.addRow(["Nama", "WhatsApp"]).font = { bold: true };
    sheet.addRow(["Ahmad Fauzi", "081234567890"]);
    sheet.getCell("B2").numFmt = "@";
    await writer.commit();

    const data = Buffer.concat(chunks);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Uint8Array.from(data).buffer);
    expect(workbook.getWorksheet("Peserta")!.getCell("A1").font.bold).toBe(true);
    expect(workbook.getWorksheet("Peserta")!.getCell("B2").value).toBe("081234567890");

    const rows: ExcelJS.CellValue[][] = [];
    const reader = new ExcelJS.stream.xlsx.WorkbookReader(Readable.from([data]), {});
    for await (const worksheet of reader) {
      for await (const row of worksheet) rows.push(row.values as ExcelJS.CellValue[]);
    }
    expect(rows[1]).toEqual([undefined, "Ahmad Fauzi", "081234567890"]);
  });

  it("round-trips CSV with quoted commas and embedded newlines", async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("CSV");
    sheet.addRow(["Nama", "Catatan"]);
    sheet.addRow(["Ahmad, Fauzi", "Baris pertama\nBaris kedua"]);
    const csv = await workbook.csv.writeBuffer();
    const imported = new ExcelJS.Workbook();
    const result = await imported.csv.read(Readable.from([Buffer.from(csv)]));
    expect(result.getCell("A2").value).toBe("Ahmad, Fauzi");
    expect(result.getCell("B2").value).toBe("Baris pertama\nBaris kedua");
  });

  it("preserves extended conditional formatting that requires UUID generation", async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Nilai");
    sheet.addRows([[10], [50], [90]]);
    sheet.addConditionalFormatting({
      ref: "A1:A3",
      rules: [{
        type: "iconSet",
        priority: 1,
        iconSet: "3Stars",
        cfvo: [{ type: "percent", value: 0 }, { type: "percent", value: 33 }, { type: "percent", value: 67 }],
      }],
    });
    const imported = new ExcelJS.Workbook();
    await imported.xlsx.load(await workbook.xlsx.writeBuffer());
    expect(imported.getWorksheet("Nilai")!.model).toMatchObject({
      conditionalFormattings: [{
        ref: "A1:A3",
        rules: [{ type: "iconSet", iconSet: "3Stars" }],
      }],
    });
  });
});
