import * as XLSX from "xlsx";
import { NFRow } from "../types";

/**
 * Lê XLSX/CSV e retorna lista única de NFs
 */
export function parseNFFile(buffer: Buffer): { nfs: string[]; rawHeaders: string[] } {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const wsName = wb.SheetNames[0];
  const ws = wb.Sheets[wsName];
  const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });

  if (json.length === 0) return { nfs: [], rawHeaders: [] };

  const headers = Object.keys(json[0]);
  const nfCol = headers.find(h => h.toLowerCase().includes("nf")) ?? headers[0];

  const rawNFs = json.map(r => String(r[nfCol] ?? "").trim());
  const cleaned = rawNFs
    .map(v => v.replace(/[^\d]/g, "")) // só números
    .filter(v => v.length > 0);

  const uniq: string[] = [];
  const seen = new Set<string>();
  for (const nf of cleaned) {
    if (!seen.has(nf)) {
      uniq.push(nf);
      seen.add(nf);
    }
  }
  return { nfs: uniq, rawHeaders: headers };
}
