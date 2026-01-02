import { z } from "zod";
import { TEXT_INPUT_MAX_LENGTH, MAX_NUM_SLIDES } from "./config";

export const docToSlidesReqSchema = z.object({
  text: z
    .string()
    .min(1)
    .max(TEXT_INPUT_MAX_LENGTH, {
      message: `Text input must be at least 1 character and at most ${TEXT_INPUT_MAX_LENGTH} characters long`,
    }),
  numSlides: z
    .number()
    .min(1)
    .max(MAX_NUM_SLIDES, {
      message: `Number of slides must be between 1 and ${MAX_NUM_SLIDES}`,
    }),
});
export type DocToSlidesReq = z.infer<typeof docToSlidesReqSchema>;

export const linesSchema = z.array(
  z.object({
    lineIndex: z.number(),
    lineContent: z.string(),
  })
);
export type Lines = z.infer<typeof linesSchema>;

export const aiInputSchema = z.object({
  lines: linesSchema,
});
export type AIInput = z.infer<typeof aiInputSchema>;

export const aiOutputSchema = z.object({
  slideBreaks: z
    .array(z.number())
    .describe(
      "The index of the line where a slide break should be inserted (i.e., where the next slide should start)"
    ),
});
export type AIOutput = z.infer<typeof aiOutputSchema>;

export const docToSlidesRspSchema = z.object({
  slides: z.array(z.string()),
  cost: z.number(),
  runTime: z.number(),
});
export type DocToSlidesRsp = z.infer<typeof docToSlidesRspSchema>;
