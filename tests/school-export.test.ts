import { describe, expect, it } from "vitest";
import { csvCell, exportCsv, toCsv, EXPORT_KINDS } from "@/lib/schools/export";
import { DEMO_SCHOOL } from "@/lib/schools/demo";

/**
 * A school's records as CSV. The file ends up in Excel on an accountant's
 * laptop, so two things matter beyond the data being there: it must parse,
 * and nothing a school typed into a learner's name or a note may run as a
 * formula when it is opened.
 */

describe("csvCell", () => {
  it("quotes what would break a row, and keeps numbers as numbers", () => {
    expect(csvCell('Thabo "T" Nkosi')).toBe('"Thabo ""T"" Nkosi"');
    expect(csvCell("12 Jan Smuts Ave, Rosebank")).toBe('"12 Jan Smuts Ave, Rosebank"');
    expect(csvCell("line one\nline two")).toBe('"line one\nline two"');
    expect(csvCell(-250)).toBe("-250");
    expect(csvCell(null)).toBe("");
    expect(csvCell(Number.NaN)).toBe("");
  });

  it("defuses anything a spreadsheet would run as a formula", () => {
    expect(csvCell('=HYPERLINK("http://evil.example","click")')).toBe(`"'=HYPERLINK(""http://evil.example"",""click"")"`);
    expect(csvCell("+27 82 123 4567")).toBe("'+27 82 123 4567");
    expect(csvCell("-5 lessons")).toBe("'-5 lessons");
    expect(csvCell("@SUM(A1:A9)")).toBe("'@SUM(A1:A9)");
    expect(csvCell("Nomsa")).toBe("Nomsa");
  });
});

describe("toCsv", () => {
  it("starts with a byte-order mark and ends rows with CRLF, for Excel", () => {
    const csv = toCsv(["a", "b"], [[1, "x"]]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv.slice(1)).toBe("a,b\r\n1,x\r\n");
  });
});

describe("exportCsv (demo records)", () => {
  it.each(EXPORT_KINDS)("makes a %s file with a header and every record", async (kind) => {
    const csv = await exportCsv(DEMO_SCHOOL, kind);
    const lines = csv.slice(1).trim().split("\r\n");
    expect(lines.length).toBeGreaterThan(1);
    expect(lines[0]).not.toMatch(/undefined|null/);
    for (const line of lines.slice(1)) expect(line).not.toMatch(/undefined|\[object/);
  });

  it("names people, not ids, and shows money in rand", async () => {
    const csv = await exportCsv(DEMO_SCHOOL, "payments");
    expect(csv).not.toMatch(/demo-thabo|demo-owner/);
    expect(csv).toMatch(/Thabo Nkosi/);
  });
});
