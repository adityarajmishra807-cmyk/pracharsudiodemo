import { z } from "zod";

export const AiMessageSchema = z.object({
  role: z.enum(["user", "model"]),
  text: z.string().min(1).max(12000),
});

export const PracharContextSchema = z.object({
  workspaceName: z.string().max(200).optional(),
  currentPage: z.string().max(200).optional(),
  userRole: z.enum(["owner", "member"]).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const ChatWithGeminiInputSchema = z.object({
  message: z.string().trim().min(1).max(12000),
  history: z.array(AiMessageSchema).max(30).default([]),
  context: PracharContextSchema.optional(),
});

export type AiMessage = z.infer<typeof AiMessageSchema>;
export type PracharContext = z.infer<typeof PracharContextSchema>;
export type ChatWithGeminiInput = z.infer<typeof ChatWithGeminiInputSchema>;

export type ChatWithGeminiResult = {
  text: string;
  model: string;
};
