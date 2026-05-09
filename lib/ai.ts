import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function generateConversationReply(
  businessName: string,
  messageHistory: { role: "user" | "assistant"; content: string }[],
  services: { label: string; value: string }[] = [],
  intakeQuestion: string = "What type of roofing issue are you dealing with?"
): Promise<string> {
  const serviceList = services.length > 0
    ? services.map((s) => s.label).join(", ")
    : "repair, replacement, storm damage, inspection";

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    system: `You are a friendly intake assistant for ${businessName}.
Your job is to collect these 4 things from the homeowner, one question at a time:
1. Type of service needed (${serviceList})
2. Urgency (emergency/active issue, needs attention soon, or just getting estimates)
3. Timeline (ASAP, within a month, or planning ahead)
4. Whether they own the home

Rules:
- Keep replies short — this is SMS, not email. Max 2 sentences.
- Ask only one question at a time.
- Be friendly and natural, not robotic.
- Never quote prices. If asked about cost, say "Someone from ${businessName} will go over pricing when they reach out."
- Once you have all 4 pieces of info, end with exactly this phrase: "Perfect, I have everything I need! Someone from ${businessName} will be in touch very soon."`,
    messages: messageHistory,
  });

  return (response.content[0] as { text: string }).text;
}

export async function generateLeadSummary(
  messageHistory: { role: string; content: string }[]
): Promise<{ summary: string; score: "hot" | "warm" | "cold" | "unqualified" }> {
  const transcript = messageHistory
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    system: "You analyze lead qualification conversations and return JSON only. No other text.",
    messages: [
      {
        role: "user",
        content: `Based on this conversation, return a JSON object with exactly two fields:
- "summary": a 2-3 sentence summary of the lead (issue, urgency, timeline)
- "score": one of "hot", "warm", "cold", or "unqualified"

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

  const text = (response.content[0] as { text: string }).text;
  try {
    return JSON.parse(text);
  } catch {
    return { summary: text, score: "warm" as const };
  }
}