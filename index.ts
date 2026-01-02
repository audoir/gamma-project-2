import "dotenv/config";
import { readFileSync, writeFileSync } from "fs";
import { transformDocToSlides } from "./transform";
import {
  DocToSlidesReq,
  docToSlidesReqSchema,
  docToSlidesRspSchema,
} from "./models";

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error(
      "Usage: node index.js <input-file-path> <output-file-path> <target-slides>"
    );
    process.exit(1);
  }

  const inputFilePath = args[0];
  const fileContent = readFileSync(inputFilePath, "utf-8");
  const outputFilePath = args[1];
  const targetSlides = parseInt(args[2], 10);

  const docToSlidesReq: DocToSlidesReq = docToSlidesReqSchema.parse({
    text: fileContent,
    numSlides: targetSlides,
  });

  console.log("Transforming document into slides...");
  const result = docToSlidesRspSchema.parse(
    await transformDocToSlides(docToSlidesReq)
  );

  writeFileSync(
    outputFilePath,
    JSON.stringify(result.slides, null, 2),
    "utf-8"
  );

  console.log(`Results written to ${outputFilePath}`);
  console.log(`Number of slides: ${result.slides.length}`);
  console.log(`Cost: $${result.cost.toFixed(4)}`);
  console.log(`Runtime: ${result.runTime}s`);
}

main();
