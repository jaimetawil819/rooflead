import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminClient } from "@/lib/supabase/admin";
import { auth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminClient();

  let { data: business } = await supabase
    .from("businesses")
    .select("id, name, stripe_customer_id")
    .eq("owner_id", userId)
    .single();

  if (!business) {
    const { data: newBusiness, error } = await supabase
      .from("businesses")
      .insert({ owner_id: userId, name: "My Roofing Company" })
      .select("id, name, stripe_customer_id")
      .single();
    if (error || !newBusiness) {
      return NextResponse.json({ error: "Failed to create business" }, { status: 500 });
    }
    business = newBusiness;
  }

  let customerId = business.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      name: business.name,
      metadata: { business_id: business.id, owner_id: userId },
    });
    customerId = customer.id;
    await supabase
      .from("businesses")
      .update({ stripe_customer_id: customerId })
      .eq("id", business.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRICE_ID_STARTER!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe`,
  });

  return NextResponse.json({ url: session.url });
}