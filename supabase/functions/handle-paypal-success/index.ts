import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYPAL_MODE = Deno.env.get("PAYPAL_MODE") || "sandbox";
const PAYPAL_WEBHOOK_ID = Deno.env.get("PAYPAL_WEBHOOK_ID")!;
const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID")!;
const PAYPAL_SECRET = Deno.env.get("PAYPAL_SECRET")!;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const PAYPAL_API_BASE = PAYPAL_MODE === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken(): Promise<string> {
  const auth = btoa(${PAYPAL_CLIENT_ID}:);
  const res = await fetch(${PAYPAL_API_BASE}/v1/oauth2/token, {
    method: "POST",
    headers: {
      "Authorization": Basic ,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(PayPal token error (): );
  }

  const data = await res.json();
  return data.access_token;
}

async function verifyPayPalWebhook(req: Request, body: string): Promise<boolean> {
  const accessToken = await getPayPalAccessToken();

  const transmissionId = req.headers.get("paypal-transmission-id");
  const transmissionTime = req.headers.get("paypal-transmission-time");
  const certUrl = req.headers.get("paypal-cert-url");
  const authAlgo = req.headers.get("paypal-auth-algo");
  const transmissionSig = req.headers.get("paypal-transmission-sig");

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    return false;
  }

  const verifyBody = {
    transmission_id: transmissionId,
    transmission_time: transmissionTime,
    cert_url: certUrl,
    auth_algo: authAlgo,
    transmission_sig: transmissionSig,
    webhook_id: PAYPAL_WEBHOOK_ID,
    webhook_event: JSON.parse(body),
  };

  const res = await fetch(${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature, {
    method: "POST",
    headers: {
      "Authorization": Bearer ,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(verifyBody),
  });

  if (!res.ok) {
    return false;
  }

  const data = await res.json();
  return data.verification_status === "SUCCESS";
}

serve(async (req) => {
  try {
    const body = await req.text();

    const isValid = await verifyPayPalWebhook(req, body);
    if (!isValid) {
      console.error("Invalid PayPal webhook signature");
      return new Response("Invalid signature", { status: 403 });
    }

    const event = JSON.parse(body);
    if (event.event_type !== "CHECKOUT.ORDER.COMPLETED") {
      return new Response("Event not handled", { status: 200 });
    }

    const orderId = event.resource?.id;
    const customDataStr = event.resource?.purchase_units?.[0]?.custom_id;

    if (!orderId || typeof orderId !== "string") {
      console.error("Missing order id on PayPal event");
      return new Response("Missing order id", { status: 400 });
    }

    if (!customDataStr) {
      console.warn("Missing custom_id on PayPal order", { orderId });
      return new Response("No custom data", { status: 200 });
    }

    let customData: { user_id?: string; credit_amount?: number };
    try {
      customData = JSON.parse(customDataStr);
    } catch {
      console.error("Invalid custom_id JSON", { orderId });
      return new Response("Invalid custom data", { status: 400 });
    }

    const userId = customData.user_id;
    const creditAmount = Number(customData.credit_amount);

    if (!userId || !Number.isFinite(creditAmount) || creditAmount <= 0) {
      console.error("Invalid custom data", { orderId, customData });
      return new Response("Invalid data", { status: 400 });
    }

    const { error } = await supabaseAdmin.rpc("admin_add_credits", {
      p_user_id: userId,
      p_amount: creditAmount,
      p_is_paid: true,
      p_operation_type: "paid_add",
      p_related_order_id: orderId,
      p_remark: PayPal order  credited  credits,
    });

    if (error) {
      console.error("Failed to add credits:", error);
      return new Response("Internal Server Error", { status: 500 });
    }

    console.log(Successfully added  credits to user );
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
});
