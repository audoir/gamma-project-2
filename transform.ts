import {
  AI_MODEL,
  AI_REASONING_EFFORT,
  NUM_BUFFER_SLIDES,
  AI_INPUT_TOKEN_COST,
  AI_OUTPUT_TOKEN_COST,
} from "./config";
import {
  aiOutputSchema,
  AIOutput,
  DocToSlidesRsp,
  Lines,
  DocToSlidesReq,
} from "./models";
import { generateObject, LanguageModelUsage, ModelMessage } from "ai";

export const transformDocToSlides = async (
  req: DocToSlidesReq
): Promise<DocToSlidesRsp> => {
  const { text, numSlides } = req;

  const startTime = Date.now();

  const lines = splitText(text);
  validateSplit(text, lines);

  const { aiOutput, usage } = await splitSlides(lines, numSlides);
  const slides = assembleSlides(lines, aiOutput);
  validateSlides(text, slides);

  const endTime = Date.now();

  return {
    slides,
    cost:
      (usage.inputTokens ?? 0) * AI_INPUT_TOKEN_COST +
      (usage.outputTokens ?? 0) * AI_OUTPUT_TOKEN_COST,
    runTime: (endTime - startTime) / 1000,
  };
};

const splitText = (text: string): Lines => {
  return text
    .split(/(\n)/)
    .filter((line) => line !== "")
    .map((line, index) => ({
      lineIndex: index,
      lineContent: line,
    }));
};

const validateSplit = (text: string, lines: Lines) => {
  if (text !== lines.map((s) => s.lineContent).join("")) {
    throw new Error("Line reconstruction mismatch");
  }
};

const validateSlides = (text: string, slides: string[]) => {
  const reconstructedText = slides.join("");
  if (text !== reconstructedText) {
    throw new Error("Slide reconstruction mismatch");
  }
};

const splitSlides = async (
  lines: Lines,
  numSlides: number
): Promise<{ aiOutput: AIOutput; usage: LanguageModelUsage }> => {
  const messages: ModelMessage[] = [
    {
      role: "system",
      content: `
You are an expert at splitting markdown text into presentation slides.

You will be provided with an array of markdown text lines. These lines are created by splitting the original text on newlines. Each line is also provided with its respective index.

Process the lines and determine the optimal slide breaks. The slideBreaks array should contain the indices of lines at which a slide break should be inserted (i.e., where the next slide should start).

The target number of slides is ${numSlides}. This means that based on the number of lines, the slide breaks should be inserted at approximately every ${Math.round(
        lines.length / numSlides
      )} lines.

Add slide breaks based on the logical grouping of content. For example, if there is a heading or a clear topic shift, that's a good place to break, so that the slide starts with the heading or the main point of that section.

IMPORTANT: Never have a slide end with a heading or the main point of the next section.

It's more important to preserve the logical grouping of content than hit the exact number of slides, and you can go over or under by up to ${NUM_BUFFER_SLIDES} slides.
      `,
    },
    {
      role: "user",
      content: `
Here are the lines:

${JSON.stringify(lines, null, 2)}
`,
    },
  ];

  const { object, usage } = await generateObject({
    model: AI_MODEL,
    messages,
    schema: aiOutputSchema,
    providerOptions: {
      openai: {
        reasoningEffort: AI_REASONING_EFFORT,
      },
    },
  });

  return { aiOutput: aiOutputSchema.parse(object), usage };
};

const assembleSlides = (lines: Lines, aiOutput: AIOutput): string[] => {
  const slides: string[] = [];
  const slideBreaks = aiOutput.slideBreaks.toSorted((a, b) => a - b);

  let currentSlideLines: string[] = [];
  let breakIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if we should break at this line
    if (breakIndex < slideBreaks.length && i === slideBreaks[breakIndex]) {
      // End current slide and start new one
      if (currentSlideLines.length > 0) {
        slides.push(currentSlideLines.join(""));
        currentSlideLines = [];
      }
      breakIndex++;
    }

    currentSlideLines.push(line.lineContent);
  }

  // Add any remaining lines as the final slide
  if (currentSlideLines.length > 0) {
    slides.push(currentSlideLines.join(""));
  }

  return slides;
};
