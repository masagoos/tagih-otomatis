"use client";

import { useState } from "react";
import Link from "next/link";
import { importInvoices, type ImportRow } from "../actions";

type Result = { imported: number; errors: string[] };

function parseCsv(text: string): ImportRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // deteksi pemisah: koma atau titik koma (umum di Excel lokal ID)
  const delim = lines[0].includes(";") ? ";" : ",";
  const header = lines[0].split(delim).map((h) => h.trim().toLowerCase());

  const idx = {
    name: header.findIndex((h) => ["nama", "name"].includes(h)),
    phone: header.findIndex((h) => ["nomor hp", "no hp", "no wa", "phone", "hp"].includes(h)),
    amount: header.findIndex((h) => ["nominal", "jumlah", "amount"].includes(h)),
    due: header.findIndex((h) => ["jatuh tempo", "due_date", "tanggal"].includes(h)),
    desc: header.findIndex((h) => ["keterangan", "description", "catatan"].includes(h)),
  };

  return lines.slice(1).map((line) => {
    const cols = line.split(delim).map((c) => c.trim());
    let due = cols[idx.due] ?? "";
    // DD/MM/YYYY atau DD-MM-YYYY -> YYYY-MM-DD
    const m = due.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) due = `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;

    return {
      name: idx.name >= 0 ? cols[idx.name] : "",
      phone: idx.phone >= 0 ? cols[idx.phone] : "",
      amount: idx.amount >= 0 ? cols[idx.amount] : "",
      due_date: due,
      description: idx.desc >= 0 ? cols[idx.desc] : undefined,
    };
  });
}

export default function ImportForm() {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState<"idle" | "importing" | "done">("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [parseError, setParseError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError("");
    setResult(null);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setParseError(
        "Untuk sekarang hanya file .csv yang didukung. Di Excel: File → Save As → pilih CSV (Comma delimited)."
      );
      setRows([]);
      return;
    }

    const text = await file.text();
    const parsed = parseCsv(text);
    if (parsed.length === 0) {
      setParseError("Tidak ada baris data terbaca. Pastikan ada header dan minimal 1 baris data.");
    }
    setRows(parsed);
  }

  async function handleImport() {
    setStatus("importing");
    const res = await importInvoices(rows);
    setResult(res);
    setStatus("done");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard/invoices" className="text-sm text-gray-500 hover:text-gray-900">
        ← Kembali ke daftar tagihan
      </Link>
      <h1 className="mt-2 text-xl font-bold text-gray-900">Import Tagihan (CSV)</h1>

      <div className="mt-4 rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">
          Kolom yang dibutuhkan (nama header bebas urutan, tidak peka huruf besar/kecil):
        </p>
        <code className="mt-2 block rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
          nama, no wa, nominal, jatuh tempo, keterangan
        </code>
        <p className="mt-2 text-xs text-gray-400">
          Format tanggal: YYYY-MM-DD atau DD/MM/YYYY. Nominal boleh pakai titik
          ribuan, mis. 1.500.000.
        </p>

        <input
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="mt-4 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
        />

        {parseError && (
          <p className="mt-3 text-sm text-red-600">{parseError}</p>
        )}

        {rows.length > 0 && status === "idle" && (
          <>
            <p className="mt-4 text-sm text-gray-700">
              <strong>{fileName}</strong> — {rows.length} baris siap diimpor.
            </p>
            <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Nama</th>
                    <th className="px-3 py-2 text-left">No. HP</th>
                    <th className="px-3 py-2 text-left">Nominal</th>
                    <th className="px-3 py-2 text-left">Jatuh Tempo</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 10).map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-1.5">{r.name}</td>
                      <td className="px-3 py-1.5">{r.phone}</td>
                      <td className="px-3 py-1.5">{r.amount}</td>
                      <td className="px-3 py-1.5">{r.due_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 10 && (
                <p className="p-2 text-center text-xs text-gray-400">
                  +{rows.length - 10} baris lainnya
                </p>
              )}
            </div>
            <button
              onClick={handleImport}
              className="mt-4 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Import {rows.length} Tagihan
            </button>
          </>
        )}

        {status === "importing" && (
          <p className="mt-4 text-sm text-gray-500">Memproses...</p>
        )}

        {result && (
          <div className="mt-4 space-y-2">
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
              {result.imported} tagihan berhasil diimpor.
            </div>
            {result.errors.length > 0 && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <p className="font-medium">{result.errors.length} baris gagal:</p>
                <ul className="mt-1 list-inside list-disc">
                  {result.errors.slice(0, 20).map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
            <Link
              href="/dashboard/invoices"
              className="inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Lihat Daftar Tagihan
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
