export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface BookingConfirmation {
  id: string;
  name: string;
  service: string;
  date: string;
  timeSlot: string;
}

export interface ChatHandlers {
  onToken: (value: string) => void;
  onBooking: (booking: BookingConfirmation) => void;
  onError: (message: string) => void;
  onDone: () => void;
}

export interface StreamChatOptions {
  signal?: AbortSignal;
  booking?: BookingConfirmation | null;
}

export async function streamChat(
  messages: ChatTurn[],
  handlers: ChatHandlers,
  options: StreamChatOptions = {},
): Promise<void> {
  let response: Response;
  try {
    response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, booking: options.booking ?? undefined }),
      signal: options.signal,
    });
  } catch (err) {
    if ((err as Error).name !== "AbortError") {
      handlers.onError("I couldn't reach the assistant. Please try again.");
    }
    handlers.onDone();
    return;
  }

  if (!response.ok || !response.body) {
    let message = "The assistant is unavailable right now.";
    try {
      const data = (await response.json()) as { error?: unknown };
      if (typeof data.error === "string") message = data.error;
    } catch {
      // ignore non-JSON error bodies
    }
    handlers.onError(message);
    handlers.onDone();
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const blocks = buffer.split("\n\n");
      buffer = blocks.pop() ?? "";

      for (const block of blocks) {
        const line = block
          .split("\n")
          .find((entry) => entry.startsWith("data:"));
        if (!line) continue;
        const payload = line.slice(5).trim();
        if (!payload) continue;

        let event: {
          type?: string;
          value?: string;
          message?: string;
          booking?: BookingConfirmation;
        };
        try {
          event = JSON.parse(payload) as typeof event;
        } catch {
          continue;
        }

        if (event.type === "token" && event.value) {
          handlers.onToken(event.value);
        } else if (event.type === "booking" && event.booking) {
          handlers.onBooking(event.booking);
        } else if (event.type === "error") {
          handlers.onError(event.message ?? "The assistant stopped responding.");
        }
      }
    }
  } catch (err) {
    if ((err as Error).name !== "AbortError") {
      handlers.onError("The connection was interrupted.");
    }
  } finally {
    reader.releaseLock();
    handlers.onDone();
  }
}
