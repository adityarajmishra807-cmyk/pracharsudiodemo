import { createServerFn } from "@tanstack/react-start";

import { chatWithGemini } from "./gemini.server";
import { ChatWithGeminiInputSchema } from "./types";

export const chatWithGeminiServer = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatWithGeminiInputSchema.parse(input))
  .handler(async ({ data }) => {
    return chatWithGemini(data);
  });
