import "server-only";

const MAYAR_BASE = "https://api.mayar.id/hl/v2";

type MayarPaymentLinkResponse = {
  statusCode: number;
  messages?: string;
  data?: { id: string; link: string };
};

export async function createPaymentLink(params: {
  name: string;
  amount: number;
  redirectUrl: string;
  notes?: string;
}): Promise<{ ok: boolean; id?: string; link?: string; error?: string }> {
  const apiKey = process.env.MAYAR_API_KEY;
  if (!apiKey) return { ok: false, error: "MAYAR_API_KEY belum diset" };

  const res = await fetch(`${MAYAR_BASE}/products/payment-link/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: params.name,
      amount: params.amount,
      redirectUrl: params.redirectUrl,
      notes: params.notes,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, error: `Mayar API error ${res.status}: ${text.slice(0, 200)}` };
  }

  const data = (await res.json()) as MayarPaymentLinkResponse;
  if (!data.data?.link) return { ok: false, error: data.messages ?? "Respons Mayar tidak valid" };

  return { ok: true, id: data.data.id, link: data.data.link };
}
