import type { AiBinding, ApiContext } from "../admin/lib/context";
import { error, type ApiRequest, type ApiResponse } from "../admin/lib/http";
import { buildSystemPrompt } from "./knowledge";
import { TOOLS, executeTool, type ToolCall } from "./tools";

const DEFAULT_MODEL = "@cf/qwen/qwen3-30b-a3b-fp8";
const MAX_MESSAGES = 24;
const MAX_CHARS_PER_MESSAGE = 2000;
const MAX_TOOL_RUNS = 3;

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

interface ModelMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
}

interface ModelResult {
  response?: string;
  tool_calls?: { name: string; arguments?: unknown }[];
}

function normalizeArguments(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      // not JSON
    }
  }
  return {};
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

interface BookingContext {
  id: string;
  service: string;
  date: string;
  timeSlot: string;
}

function parseBookingContext(body: unknown): BookingContext | null {
  if (typeof body !== "object" || body === null) return null;
  const raw = (body as { booking?: unknown }).booking;
  if (typeof raw !== "object" || raw === null) return null;
  const record = raw as Record<string, unknown>;
  const id = typeof record.id === "string" ? record.id : "";
  const service = typeof record.service === "string" ? record.service : "";
  const date = typeof record.date === "string" ? record.date : "";
  const timeSlot = typeof record.timeSlot === "string" ? record.timeSlot : "";
  if (!id && !date) return null;
  return { id, service, date, timeSlot };
}

function bookingSessionNote(booking: BookingContext): string {
  const details = [
    booking.service ? `service: ${booking.service}` : "",
    booking.date ? `date: ${booking.date}` : "",
    booking.timeSlot ? `time: ${booking.timeSlot}` : "",
    booking.id ? `reference: ${booking.id}` : "",
  ]
    .filter(Boolean)
    .join(", ");
  return `This patient already has a confirmed booking (${details}). Treat it as done. Do not call check_availability or create_booking again for it. If they thank you or ask about it, respond warmly and offer further help.`;
}

function parseTurns(body: unknown): ChatTurn[] | null {
  if (typeof body !== "object" || body === null) return null;
  const raw = (body as { messages?: unknown }).messages;
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const turns: ChatTurn[] = [];
  for (const item of raw.slice(-MAX_MESSAGES)) {
    if (typeof item !== "object" || item === null) continue;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") {
      continue;
    }
    const text = content.trim().slice(0, MAX_CHARS_PER_MESSAGE);
    if (!text) continue;
    turns.push({ role, content: text });
  }

  return turns.length > 0 ? turns : null;
}

async function runModel(
  ai: AiBinding,
  model: string,
  messages: ModelMessage[],
): Promise<ModelResult> {
  const result = (await ai.run(model, {
    messages,
    tools: TOOLS,
    stream: false,
    max_tokens: 700,
    temperature: 0.4,
  })) as ModelResult;
  return result ?? {};
}

class ThinkFilter {
  private buffer = "";
  private inThink = false;

  push(chunk: string): string {
    this.buffer += chunk;
    let output = "";
    for (;;) {
      if (!this.inThink) {
        const open = this.buffer.indexOf(" thinking");
        if (open === -1) {
          const keep = " thinking".length - 1;
          if (this.buffer.length > keep) {
            output += this.buffer.slice(0, this.buffer.length - keep);
            this.buffer = this.buffer.slice(this.buffer.length - keep);
          }
          break;
        }
        output += this.buffer.slice(0, open);
        this.buffer = this.buffer.slice(open + " thinking".length);
        this.inThink = true;
      } else {
        const close = this.buffer.indexOf(" response");
        if (close === -1) {
          const keep = " response".length - 1;
          this.buffer = this.buffer.slice(
            Math.max(0, this.buffer.length - keep),
          );
          break;
        }
        this.buffer = this.buffer.slice(close + " response".length);
        this.inThink = false;
      }
    }
    return output;
  }

  flush(): string {
    const wasThinking = this.inThink;
    this.inThink = false;
    if (wasThinking) {
      this.buffer = "";
      return "";
    }
    const out = this.buffer;
    this.buffer = "";
    return out;
  }
}

function tokenStream(
  source: ReadableStream<Uint8Array>,
  preEvents: unknown[],
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = source.getReader();
  const filter = new ThinkFilter();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: unknown) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(payload)}\n\n`),
        );
      };

      for (const event of preEvents) send(event);

      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;
            try {
              const parsed = JSON.parse(payload) as { response?: unknown };
              if (typeof parsed.response === "string" && parsed.response) {
                const visible = filter.push(parsed.response);
                if (visible) send({ type: "token", value: visible });
              }
            } catch {
              // ignore non-JSON keep-alive chunks
            }
          }
        }

        const tail = filter.flush();
        if (tail) send({ type: "token", value: tail });
      } catch (err) {
        send({
          type: "error",
          message: err instanceof Error ? err.message : "The assistant stopped.",
        });
      } finally {
        send({ type: "done" });
        controller.close();
        reader.releaseLock();
      }
    },
    cancel() {
      void reader.cancel();
    },
  });
}

export async function handleChat(
  req: ApiRequest,
  ctx: ApiContext,
): Promise<ApiResponse> {
  if (!ctx.ai) {
    return error(503, "The assistant is not available right now.");
  }

  const turns = parseTurns(req.body);
  if (!turns) {
    return error(400, "Invalid chat payload.");
  }

  const model = ctx.env.CHAT_MODEL?.trim() || DEFAULT_MODEL;
  const booking = parseBookingContext(req.body);
  const systemContent = buildSystemPrompt({
    today: todayIso(),
    extraKnowledge: ctx.env.CLINIC_KNOWLEDGE,
    sessionNote: booking ? bookingSessionNote(booking) : undefined,
  });
  const messages: ModelMessage[] = [
    {
      role: "system",
      content: /qwen/i.test(model) ? `${systemContent}\n\n/no_think` : systemContent,
    },
    ...turns,
  ];

  const events: unknown[] = [];
  const userText = turns
    .filter((turn) => turn.role === "user")
    .map((turn) => turn.content)
    .join("\n");
  let bookingLocked = Boolean(booking);

  try {
    for (let run = 0; run <= MAX_TOOL_RUNS; run += 1) {
      const result = await runModel(ctx.ai, model, messages);
      const calls = (result.tool_calls ?? []).filter(
        (call) => call && typeof call.name === "string",
      );

      if (calls.length === 0) break;

      messages.push({
        role: "assistant",
        content: JSON.stringify(calls.length === 1 ? calls[0] : calls),
      });

      for (const call of calls) {
        const toolCall: ToolCall = {
          name: call.name,
          arguments: normalizeArguments(call.arguments),
        };

        let toolResult: unknown;
        if (call.name === "create_booking" && bookingLocked) {
          toolResult = {
            ok: false,
            error:
              "A booking already exists in this conversation. Do not create another one; just respond warmly to the patient.",
          };
        } else {
          try {
            toolResult = await executeTool(toolCall, ctx, {
              userText,
              bookingLocked,
            });
          } catch (err) {
            toolResult = {
              ok: false,
              error:
                err instanceof Error
                  ? err.message
                  : "That action is temporarily unavailable.",
            };
          }
        }

        if (
          call.name === "create_booking" &&
          typeof toolResult === "object" &&
          toolResult !== null &&
          (toolResult as { ok?: boolean }).ok &&
          (toolResult as { booking?: unknown }).booking
        ) {
          bookingLocked = true;
          events.push({
            type: "booking",
            booking: (toolResult as { booking: unknown }).booking,
          });
        }

        messages.push({
          role: "tool",
          name: call.name,
          content: JSON.stringify(toolResult),
        });
      }
    }

    const stream = (await ctx.ai.run(model, {
      messages,
      stream: true,
      max_tokens: 700,
      temperature: 0.4,
    })) as ReadableStream<Uint8Array>;

    return {
      status: 200,
      body: undefined,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
      stream: tokenStream(stream, events),
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "The assistant is unavailable.";
    return error(502, message);
  }
}
