import "server-only";

const FONNTE_BASE = "https://api.fonnte.com";

type FonnteSendResponse = {
  status: boolean;
  id?: string[];
  detail?: string;
  reason?: string;
};

type FonnteDeviceResponse = {
  status: boolean;
  device?: string;
  device_status?: "connect" | "disconnect";
  name?: string;
  reason?: string;
};

export async function checkDeviceStatus(
  token: string
): Promise<{ connected: boolean; deviceNumber?: string; error?: string }> {
  const res = await fetch(`${FONNTE_BASE}/device`, {
    method: "POST",
    headers: { Authorization: token },
  });
  const data = (await res.json()) as FonnteDeviceResponse;

  if (!data.status) return { connected: false, error: data.reason ?? "Token tidak valid" };
  return { connected: data.device_status === "connect", deviceNumber: data.device };
}

export async function sendWhatsApp(
  token: string,
  target: string,
  message: string
): Promise<{ ok: boolean; providerMsgId?: string; error?: string }> {
  const body = new URLSearchParams({ target, message, countryCode: "62" });

  const res = await fetch(`${FONNTE_BASE}/send`, {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = (await res.json()) as FonnteSendResponse;

  if (!data.status) return { ok: false, error: data.reason ?? data.detail ?? "Gagal mengirim" };
  return { ok: true, providerMsgId: data.id?.[0] };
}

// Jeda acak antar pesan — mitigasi utama risiko nomor WA kena banned oleh WhatsApp.
export function randomDelayMs(minSec = 3, maxSec = 8): number {
  return (minSec + Math.random() * (maxSec - minSec)) * 1000;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
