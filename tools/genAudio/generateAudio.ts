import "dotenv/config";

import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

type Dialogue = {
  sequence: number;
  speakerNo: number;
  en: string;
  ja: string;
};

type TeachingMaterial = {
  id: number;
  phase: number;
  situation: string;
  dialogues: Dialogue[];
};

const REGION = process.env.AWS_REGION ?? "ap-northeast-1";

const INPUT_JSON = process.argv[2] ?? "materials/phase1-morning.json";
const OUTPUT_DIR = process.argv[3] ?? "public/audio";

const polly = new PollyClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ""
  }
});

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function synthesizeToMp3(params: {
  text: string;
  voiceId: "Joanna" | "Kazuha" | "Mizuki" | "Takumi";
  outputPath: string;
}) {
  if (await exists(params.outputPath)) {
    console.log(`skip: ${params.outputPath}`);
    return;
  }

  const command = new SynthesizeSpeechCommand({
    Text: params.text,
    TextType: "text",
    OutputFormat: "mp3",
    VoiceId: params.voiceId,
    Engine: "neural"
  });

  const response = await polly.send(command);

  if (!response.AudioStream) {
    throw new Error(`AudioStream is empty: ${params.outputPath}`);
  }

  const chunks: Uint8Array[] = [];



  for await (const chunk of response.AudioStream as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }

  await writeFile(params.outputPath, Buffer.concat(chunks));
  console.log(`created: ${params.outputPath}`);
}

async function main() {
  const jsonText = await readFile(INPUT_JSON, "utf-8");
  const materials = JSON.parse(jsonText) as TeachingMaterial[];

  await mkdir(OUTPUT_DIR, { recursive: true });

  for (const material of materials) {
    for (const dialogue of material.dialogues) {
      const enPath = path.join(OUTPUT_DIR, `${material.id}-${dialogue.sequence}_en.mp3`);
      const jaPath = path.join(OUTPUT_DIR, `${material.id}-${dialogue.sequence}_ja.mp3`);

      await synthesizeToMp3({
        text: dialogue.en,
        voiceId: "Joanna",
        outputPath: enPath
      });

      await synthesizeToMp3({
        text: dialogue.ja,
        voiceId: "Kazuha",
        outputPath: jaPath
      });
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
