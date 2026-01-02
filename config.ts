import { openai } from "@ai-sdk/openai";

// user input
export const TEXT_INPUT_MAX_TOKENS = 150000;
export const TEXT_INPUT_MAX_LENGTH = TEXT_INPUT_MAX_TOKENS * 4;
export const MAX_NUM_SLIDES = 50;

// ai configuration
export const AI_MODEL = openai("gpt-5-mini");
export const AI_REASONING_EFFORT = "medium";
export const AI_INPUT_TOKEN_COST = 0.25 / 1000000;
export const AI_OUTPUT_TOKEN_COST = 2.0 / 1000000;
export const NUM_BUFFER_SLIDES = 2;
