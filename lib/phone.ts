// Normalisasi nomor HP Indonesia ke format 628xxxxxxxxxx (tanpa +)
// Contoh: "0812-3456-7890" -> "6281234567890", "+62 812 3456 7890" -> "6281234567890"
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  let normalized: string;
  if (digits.startsWith("62")) normalized = digits;
  else if (digits.startsWith("0")) normalized = "62" + digits.slice(1);
  else if (digits.startsWith("8")) normalized = "62" + digits;
  else return null;

  // nomor seluler ID: 62 + 8xx + 7-11 digit
  if (!/^628\d{8,12}$/.test(normalized)) return null;
  return normalized;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}
