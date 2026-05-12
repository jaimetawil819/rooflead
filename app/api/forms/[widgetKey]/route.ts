import { NextRequest, NextResponse } from "next/server";
import { parseLeadFormBody } from "@/lib/form-validation";
import { getClientIp, checkRateLimit } from "@/lib/rate-limit";
import { getAdminClient } from "@/lib/supabase/admin";
import { isSmsOptedOut } from "@/lib/sms-opt-outs";
import { sendSMS } from "@/lib/twilio";
import { createRequestLogger } from "@/lib/logger";

type WidgetBusiness = { name: string | null };
type WidgetRow = {
  business_id: string;
  intake_question: string | null;
  services: { label: string; value: string }[] | null;
  businesses: WidgetBusiness | WidgetBusiness[] | null;
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function withCors(response: NextResponse) {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

function getBusinessName(businesses: WidgetRow["businesses"]) {
  if (Array.isArray(businesses)) {
    return businesses[0]?.name ?? "the team";
  }

  return businesses?.name ?? "the team";
}

function getServiceLabel(
  serviceType: string | null,
  services: WidgetRow["services"]
) {
  if (!serviceType) return "";

  const service = services?.find(
    (option) => option.value === serviceType || option.label === serviceType
  );

  return service?.label ?? serviceType;
}

function buildGreeting(
  name: string | null,
  businessName: string,
  serviceLabel: string,
  intakeQuestion: string
) {
  const firstName = name?.split(" ")[0] || "there";

  if (serviceLabel) {
    return `Hi ${firstName}! Thanks for reaching out to ${businessName}. I saw your request about ${serviceLabel}. Is this an active leak or storm damage, or are you looking for an estimate soon?`;
  }

  return `Hi ${firstName}! Thanks for reaching out to ${businessName}. I have a few quick questions to make sure we can help you. ${intakeQuestion}`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ widgetKey: string }> }
) {
  const supabase = getAdminClient();
  const { widgetKey } = await params;
  const logger = createRequestLogger("lead_form");

  const clientIp = getClientIp(req.headers);
  const rateLimit = checkRateLimit(`lead-form:${widgetKey}:${clientIp}`);

  if (!rateLimit.allowed) {
    return withCors(
      NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        }
      )
    );
  }

  const validation = parseLeadFormBody(await req.text());

  if (!validation.ok) {
    return withCors(
      NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    );
  }

  const { name, phone, address, serviceType } = validation.data;

  const { data: widget } = await supabase
    .from("form_widgets")
    .select("business_id, intake_question, services, businesses(name)")
    .eq("widget_key", widgetKey)
    .single();

  if (!widget) {
    logger.warn("invalid_widget_key");
    return withCors(
      NextResponse.json(
        { error: "Invalid widget key", requestId: logger.requestId },
        { status: 404, headers: { "x-request-id": logger.requestId } }
      )
    );
  }

  const typedWidget = widget as WidgetRow;
  const businessName = getBusinessName(typedWidget.businesses);
  const intakeQuestion = widget.intake_question ?? "What type of roofing issue are you dealing with?";
  const serviceLabel = getServiceLabel(serviceType, typedWidget.services);
  const duplicateWindowStart = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const { data: recentLead } = await supabase
    .from("leads")
    .select("id")
    .eq("business_id", typedWidget.business_id)
    .eq("phone", phone)
    .gte("created_at", duplicateWindowStart)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recentLead) {
    return withCors(
      NextResponse.json({
        success: true,
        duplicate: true,
        leadId: recentLead.id,
      })
    );
  }

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      business_id: typedWidget.business_id,
      name,
      phone,
      address,
      service_type: serviceType,
      status: "new",
      last_message_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    logger.error("lead_create_failed", error, {
      businessId: typedWidget.business_id,
    });
    return withCors(
      NextResponse.json(
        { error: "Failed to create lead", requestId: logger.requestId },
        { status: 500, headers: { "x-request-id": logger.requestId } }
      )
    );
  }

  // Send greeting SMS to the lead unless this phone has opted out.
  if (phone) {
    const optedOut = await isSmsOptedOut(supabase, phone);

    if (optedOut) {
      await supabase
        .from("leads")
        .update({ sms_opted_out_at: new Date().toISOString() })
        .eq("id", lead.id);
    } else {
      const greeting = buildGreeting(
        name,
        businessName,
        serviceLabel,
        intakeQuestion
      );
      try {
        await sendSMS(phone, greeting);
      } catch (err) {
        logger.error("greeting_sms_failed", err, {
          leadId: lead.id,
          businessId: typedWidget.business_id,
        });
      }

      // Save greeting to messages table.
      await supabase.from("messages").insert({
        lead_id: lead.id,
        role: "assistant",
        body: greeting,
      });

      await supabase
        .from("leads")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", lead.id);
    }
  }

  logger.info("lead_form_submitted", {
    leadId: lead.id,
    businessId: typedWidget.business_id,
  });

  return withCors(
    NextResponse.json(
      { success: true, leadId: lead.id },
      { headers: { "x-request-id": logger.requestId } }
    )
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
