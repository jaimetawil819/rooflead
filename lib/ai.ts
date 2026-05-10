import Anthropic from "@anthropic-ai/sdk";
import type {
  ContentBlock,
  ToolUnion,
  ToolUseBlock,
} from "@anthropic-ai/sdk/resources/messages";

const client = new Anthropic();
const MAX_CONVERSATION_MESSAGES = 20;
const EMPTY_REPLY_FALLBACK =
  "Thanks. Could you share a little more detail about the roofing issue?";

export type ConversationReply = {
  reply: string;
  isComplete: boolean;
};

export type LeadScore = "hot" | "warm" | "cold" | "unqualified";
export type LeadUrgency = "emergency" | "soon" | "estimate" | "unknown";
export type LeadSummary = {
  summary: string;
  score: LeadScore;
  urgency: LeadUrgency;
  timeline: string | null;
  isHomeowner: boolean | null;
  qualificationReason: string | null;
};

const COMPLETE_INTAKE_TOOL: ToolUnion = {
  name: "complete_intake",
  description:
    "Call this only when the homeowner has provided the service needed, urgency, timeline, and whether they own the home. Include the exact final SMS reply to send.",
  input_schema: {
    type: "object",
    properties: {
      final_reply: {
        type: "string",
        description:
          "Short final SMS message confirming intake is complete and the business will follow up.",
      },
    },
    required: ["final_reply"],
  },
};

function getTextContent(content: ContentBlock[]) {
  return content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

function getCompleteIntakeReply(content: ContentBlock[]) {
  const toolUse = content.find(
    (block): block is ToolUseBlock =>
      block.type === "tool_use" && block.name === "complete_intake"
  );

  if (!toolUse || typeof toolUse.input !== "object" || toolUse.input === null) {
    return null;
  }

  const input = toolUse.input as Record<string, unknown>;
  const finalReply = input.final_reply;

  return typeof finalReply === "string" && finalReply.trim()
    ? finalReply.trim()
    : null;
}

function getFirstTextBlock(content: ContentBlock[]) {
  const text = content.find((block) => block.type === "text");
  return text?.type === "text" ? text.text : "";
}

function handoffReply(businessName: string) {
  return `Thanks, I have enough to pass this along. Someone from ${businessName} will follow up shortly.`;
}

function logAiError(area: string, error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`${area} failed: ${message}`);
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asLeadScore(value: unknown): LeadScore {
  return value === "hot" ||
    value === "warm" ||
    value === "cold" ||
    value === "unqualified"
    ? value
    : "warm";
}

function asUrgency(value: unknown): LeadUrgency {
  return value === "emergency" ||
    value === "soon" ||
    value === "estimate" ||
    value === "unknown"
    ? value
    : "unknown";
}

function asNullableBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function parseLeadSummaryJson(text: string): LeadSummary {
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;

    return {
      summary: asString(parsed.summary, text),
      score: asLeadScore(parsed.score),
      urgency: asUrgency(parsed.urgency),
      timeline: asString(parsed.timeline) || null,
      isHomeowner: asNullableBoolean(parsed.is_homeowner),
      qualificationReason: asString(parsed.qualification_reason) || null,
    };
  } catch {
    return {
      summary: text,
      score: "warm",
      urgency: "unknown",
      timeline: null,
      isHomeowner: null,
      qualificationReason: null,
    };
  }
}

export async function generateConversationReply(
  businessName: string,
  messageHistory: { role: "user" | "assistant"; content: string }[],
  services: { label: string; value: string }[] = [],
  intakeQuestion: string = "What type of roofing issue are you dealing with?"
): Promise<ConversationReply> {
  if (messageHistory.length >= MAX_CONVERSATION_MESSAGES) {
    return {
      reply: handoffReply(businessName),
      isComplete: true,
    };
  }

  const serviceList = services.length > 0
    ? services.map((s) => s.label).join(", ")
    : "repair, replacement, storm damage, inspection";

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system: `You are a friendly intake assistant for ${businessName}.
Your job is to collect these 4 things from the homeowner, one question at a time:
1. Type of service needed (${serviceList}). Use this service question when needed: "${intakeQuestion}"
2. Urgency (emergency/active issue, needs attention soon, or just getting estimates)
3. Timeline (ASAP, within a month, or planning ahead)
4. Whether they own the home

Rules:
- Keep replies short — this is SMS, not email. Max 2 sentences.
- Ask only one question at a time.
- Be friendly and natural, not robotic.
- Never quote prices. If asked about cost, say "Someone from ${businessName} will go over pricing when they reach out."
- Once you have all 4 pieces of info, call the complete_intake tool. Do not call it before all 4 are known.`,
      messages: messageHistory,
      tools: [COMPLETE_INTAKE_TOOL],
    });

    const completionReply = getCompleteIntakeReply(response.content);

    if (completionReply) {
      return {
        reply: completionReply,
        isComplete: true,
      };
    }

    return {
      reply: getTextContent(response.content) || EMPTY_REPLY_FALLBACK,
      isComplete: false,
    };
  } catch (error) {
    logAiError("Anthropic conversation reply", error);
    return {
      reply: "Sorry, I had trouble processing that. Someone from the team will follow up shortly.",
      isComplete: false,
    };
  }
}

export async function generateLeadSummary(
  messageHistory: { role: string; content: string }[]
): Promise<LeadSummary> {
  const transcript = messageHistory
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system: "You analyze lead qualification conversations and return JSON only. No other text.",
      messages: [
        {
          role: "user",
          content: `Based on this conversation, return a JSON object with exactly six fields:
- "summary": a 2-3 sentence summary of the lead (issue, urgency, timeline)
- "score": one of "hot", "warm", "cold", or "unqualified"
- "urgency": one of "emergency", "soon", "estimate", or "unknown"
- "timeline": short phrase such as "ASAP", "this week", "within a month", "planning ahead", or null
- "is_homeowner": true, false, or null if unclear
- "qualification_reason": one concise sentence explaining why the score was chosen

Scoring guide:
- hot = active damage or emergency, ready to move forward immediately
- warm = real need but not urgent
- cold = planning stage, low urgency
- unqualified = renter with no authority, wrong number, or no real need

Conversation:
${transcript}

Return only the JSON object.`,
        },
      ],
    });

    return parseLeadSummaryJson(getFirstTextBlock(response.content));
  } catch (error) {
    logAiError("Anthropic lead summary", error);
    return {
      summary: "AI summary could not be generated. Review the conversation manually.",
      score: "warm",
      urgency: "unknown",
      timeline: null,
      isHomeowner: null,
      qualificationReason: "Summary generation failed, so the lead needs manual review.",
    };
  }
}
