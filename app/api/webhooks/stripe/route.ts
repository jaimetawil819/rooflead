import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type StripeReference = string | { id: string } | null;

function getStripeId(ref: StripeReference) {
  if (!ref) return null;
  return typeof ref === "string" ? ref : ref.id;
}

function getSubscriptionPriceId(subscription: Stripe.Subscription) {
  return subscription.items.data[0]?.price.id ?? null;
}

async function rememberStripeEvent(event: Stripe.Event) {
  const supabase = getAdminClient();
  const { error } = await supabase.from("stripe_events").insert({
    id: event.id,
    type: event.type,
  });

  if (!error) return { ok: true, duplicate: false };
  if (error.code === "23505") return { ok: true, duplicate: true };

  console.error("Stripe event idempotency insert failed:", error.message);
  return { ok: false, duplicate: false };
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const supabase = getAdminClient();
  const customerId = getStripeId(subscription.customer);

  if (!customerId) return;

  await supabase
    .from("businesses")
    .update({
      subscription_status: subscription.status,
      stripe_subscription_id: subscription.id,
      stripe_price_id: getSubscriptionPriceId(subscription),
    })
    .eq("stripe_customer_id", customerId);
}

async function markInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const supabase = getAdminClient();
  const customerId = getStripeId(invoice.customer);

  if (!customerId) return;

  await supabase
    .from("businesses")
    .update({ subscription_status: "past_due" })
    .eq("stripe_customer_id", customerId);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return new NextResponse("Webhook signature verification failed", { status: 400 });
  }

  const eventMemory = await rememberStripeEvent(event);

  if (!eventMemory.ok) {
    return NextResponse.json({ error: "Failed to record Stripe event" }, { status: 500 });
  }

  if (eventMemory.duplicate) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = getStripeId(session.customer);
      const subscriptionId = getStripeId(session.subscription);

      if (customerId) {
        const update: Record<string, string> = { subscription_status: "active" };
        if (subscriptionId) update.stripe_subscription_id = subscriptionId;

        await getAdminClient()
          .from("businesses")
          .update(update)
          .eq("stripe_customer_id", customerId);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await syncSubscription(event.data.object as Stripe.Subscription);
      break;
    }
    case "invoice.payment_failed": {
      await markInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
