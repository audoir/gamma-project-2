# Project Description

This project takes a document (in markdown format) and transforms it into a slide deck by splitting it into logical sections. The sections are split based on a target number of slides, and the logical grouping of content.

# Instructions

## Set up your environment file

Create a .env file in the root directory of the project with the following variables:

```
OPENAI_API_KEY=your_openai_api_key
```

## Install dependencies

Run the following command to install dependencies:

```bash
npm install
```

## Run the project on an example document

Run the project using the following command:

```bash
npm run transform ./assets/example.md <output-file-path> <target-slides>
```

# File description

- `config.ts`: configuration file for the project
- `models.ts`: data models for the project
- `transform.ts`: main transformation logic
- `index.ts`: main entry point

# Design Decisions

Since the maximum size of the document is 150K tokens, this fits within the context window of most frontier LLMs. Therefore, the document can be processed by a single LLM call.

The task of splitting the document into slides can be done by having the LLM process the document, and return locations of where the slides should be split. This would be more accurate and efficient than having the LLM output the text with some kind of marker.

The original document must first be annotated with location information before passing this to the LLM. This is done by splitting the document into lines, and then passing the lines and their indices to the LLM. The decision to split into lines is based on the fact that in markdown, lines represent a paragraph of text, which is a logical unit of content.

The prompt is written using best practices, such as providing a context for the LLM (*You are an expert at...*), and then providing detailed instructions of the input and expected output. A Zod schema is passed to the LLM to ensure that the LLM produces a structured output that follows the expected format.

The target number of slides and an approximate number of lines per slide are passed to the LLM; the approximate number is a hint so that the LLM doesn't have to calculate that itself during the reasoning process.

Detailed instructions are provided for how slides breaks should be inserted, including when to and not to break. Since this may conflict with the target number of slides, instructions are provided to prioritize preserving the logical grouping of content, and providing a buffer for which the LLM can go over or under the target number of slides.

The choice of model is `gpt-5-mini`, which is the latest cost-effective frontier LLM from OpenAI. The task of splitting a document into slides is not a complex task, so the more cost-effective model is chosen over the more expensive flagship model. This can be reconfigured in `config.ts`.

The reasoning effort is set to "medium" after some experimentation. This provides the LLM with token resources to reason, which is basically a scratch pad where the LLM can experiment with different slide breaks. Although this impacts run time, the transformation can be run as an asynchronous process in a real system, to minimize the impact on user experience. When set to "low", the quality was not satisfactory. Setting to "high" increased the run time and cost, but the improvement in quality was not significant.

The cost is calculated using the [cost per token](https://platform.openai.com/docs/models/gpt-5-mini).