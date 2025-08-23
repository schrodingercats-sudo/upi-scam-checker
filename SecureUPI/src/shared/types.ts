import z from "zod";

export const MessageAnalysisRequestSchema = z.object({
  message_content: z.string().min(1, "Message content is required"),
  message_type: z.enum(["sms", "whatsapp", "email"]),
});

export type MessageAnalysisRequest = z.infer<typeof MessageAnalysisRequestSchema>;

export const MessageAnalysisResponseSchema = z.object({
  id: z.number(),
  message_content: z.string(),
  message_type: z.string(),
  analysis_result: z.object({
    summary: z.string(),
    risk_factors: z.array(z.string()),
    legitimacy_indicators: z.array(z.string()),
    recommendations: z.array(z.string()),
    technical_analysis: z.string(),
  }),
  risk_score: z.number(),
  is_scam: z.boolean(),
  created_at: z.string(),
});

export type MessageAnalysisResponse = z.infer<typeof MessageAnalysisResponseSchema>;

export const AnalysisHistoryResponseSchema = z.array(MessageAnalysisResponseSchema);
export type AnalysisHistoryResponse = z.infer<typeof AnalysisHistoryResponseSchema>;
