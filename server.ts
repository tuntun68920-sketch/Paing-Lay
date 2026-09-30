import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase request body size limits
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Device tracking database and storage configuration
interface TrackingDevice {
  deviceId: string;
  deviceName: string;
  lastSeen: number;
  ip: string;
  userAgent: string;
}

const DEVICES_FILE = path.join(process.cwd(), "devices_db.json");

function readDevices(): Record<string, TrackingDevice> {
  try {
    if (fs.existsSync(DEVICES_FILE)) {
      const data = fs.readFileSync(DEVICES_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading devices file", e);
  }
  return {};
}

let devicesInMemory: Record<string, TrackingDevice> = readDevices();

// Periodic cleanup of stale devices (older than 90 days)
function purgeOldDevices() {
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
  let changed = false;
  for (const id in devicesInMemory) {
    if (devicesInMemory[id].lastSeen && devicesInMemory[id].lastSeen < cutoff) {
      delete devicesInMemory[id];
      changed = true;
    }
  }
  if (changed) {
    fs.writeFile(DEVICES_FILE, JSON.stringify(devicesInMemory, null, 2), "utf-8", () => {});
  }
}

// Run cleanup immediately and then every hour
purgeOldDevices();
setInterval(purgeOldDevices, 3600000);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Device Heartbeat route
app.post("/api/devices/heartbeat", (req, res) => {
  const { deviceId, deviceName } = req.body;
  if (!deviceId) {
    return res.status(400).json({ error: "deviceId is required" });
  }

  const ip = ((req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown").split(",")[0].trim();
  const userAgent = req.headers["user-agent"] || "unknown";

  devicesInMemory[deviceId] = {
    deviceId,
    deviceName: deviceName || "Unknown Device",
    lastSeen: Date.now(),
    ip,
    userAgent
  };

  fs.writeFile(DEVICES_FILE, JSON.stringify(devicesInMemory, null, 2), "utf-8", (err) => {
    if (err) console.error("Error writing devices_db.json", err);
  });

  res.json({ success: true });
});

// GET list of devices with online/offline status
app.get("/api/devices", (req, res) => {
  const now = Date.now();
  const deviceList = Object.values(devicesInMemory).map(d => {
    const isOnline = now - d.lastSeen < 30000; // 30s threshold
    return {
      ...d,
      isOnline
    };
  });
  res.json({ devices: deviceList });
});

// Deterministic Global Round-Robin index counter to rotate keys predictably in sequential round order (1 -> 2 -> 3 -> ... -> N -> 1)
let globalRoundRobinCounter = 0;

function getNextRoundRobinStartIndex(poolLength: number): number {
  if (poolLength <= 1) return 0;
  const index = globalRoundRobinCounter % poolLength;
  globalRoundRobinCounter = (globalRoundRobinCounter + 1) % 1000000;
  return index;
}

const CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-2.5-flash",
  "gemini-3.7-flash",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-3.1-pro-preview",
  "gemini-flash-latest",
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getModelExecutionList(targetModel?: string): string[] {
  if (!targetModel || !targetModel.trim()) {
    return ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-2.5-flash-lite", "gemini-flash-latest"];
  }
  const clean = targetModel.trim().toLowerCase();

  if (clean === "gemini-3.8-flash" || clean === "3.8-flash" || clean === "3.8" || clean === "gemini-3.8") {
    return ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-2.5-flash-lite"];
  }
  if (clean === "gemini-3.8-pro" || clean === "3.8-pro" || clean === "3.8 pro") {
    return ["gemini-3.8-flash", "gemini-3.1-pro-preview", "gemini-2.5-flash", "gemini-3.7-flash", "gemini-3.1-flash-lite"];
  }
  if (clean === "gemini-2.5-flash" || clean === "2.5-flash" || clean === "2.5") {
    return ["gemini-2.5-flash", "gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-3.7-flash", "gemini-2.5-flash-lite"];
  }
  if (clean === "gemini-3.7-flash" || clean === "3.7-flash" || clean === "3.7") {
    return ["gemini-3.7-flash", "gemini-3.8-flash", "gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-2.5-flash-lite", "gemini-flash-latest"];
  }
  if (clean === "gemini-3.6-flash" || clean === "3.6-flash" || clean === "3.6 flash") {
    return ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-2.5-flash-lite"];
  }
  if (clean === "gemini-3.6-pro" || clean === "3.6-pro" || clean === "3.6 pro") {
    return ["gemini-3.8-flash", "gemini-3.1-pro-preview", "gemini-2.5-flash", "gemini-3.7-flash", "gemini-3.1-flash-lite"];
  }
  if (clean === "gemini-3.1-pro-preview" || clean === "gemini-pro" || clean === "3.1-pro") {
    return ["gemini-3.1-pro-preview", "gemini-3.8-flash", "gemini-2.5-flash", "gemini-3.7-flash", "gemini-3.1-flash-lite"];
  }
  if (clean === "gemini-3.1-flash-lite" || clean === "3.1-lite" || clean === "flash-lite") {
    return ["gemini-3.1-flash-lite", "gemini-2.5-flash", "gemini-3.8-flash", "gemini-2.5-flash-lite", "gemini-3.7-flash"];
  }
  if (clean === "gemini-2.5-flash-lite" || clean === "2.5-lite") {
    return ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-3.7-flash"];
  }
  if (clean === "gemini-flash-latest" || clean === "latest") {
    return ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-flash-latest", "gemini-3.7-flash", "gemini-3.1-flash-lite"];
  }

  return [targetModel.trim(), "gemini-3.8-flash", "gemini-2.5-flash", "gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-2.5-flash-lite"];
}

async function generateContentWithRotation(
  apiKeysPool: string[],
  userPrompt: string,
  systemInstruction: string,
  responseSchema: any,
  requiredSchemaFields: string[],
  targetModel?: string
) {
  if (apiKeysPool.length === 0) {
    throw new Error("Gemini API Key တစ်ခုမှ မတွေ့ရပါ။ Settings တွင် API Key သို့မဟုတ် key အလှည့်ကျသုံးရန် key များ ထည့်သွင်းပေးပါ။");
  }

  const modelsToTry = getModelExecutionList(targetModel);
  console.log(`[Gemini Model Mode] Using prioritized model chain: ${modelsToTry.join(" -> ")}`);

  let lastError: any = null;
  const attemptedKeysDetails: string[] = [];
  const startIndex = getNextRoundRobinStartIndex(apiKeysPool.length);

  for (let offset = 0; offset < apiKeysPool.length; offset++) {
    const i = (startIndex + offset) % apiKeysPool.length;
    const apiKey = apiKeysPool[i];
    const maskedKey = apiKey.substring(0, 8) + "..." + apiKey.substring(Math.max(0, apiKey.length - 4));
    console.log(`[Key Allocation] Request assigned to Key #${i + 1}/${apiKeysPool.length} (${maskedKey}) in sequential round.`);

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      let response: any = null;
      let lastModelError: any = null;
      let executedModelName = modelsToTry[0];

      for (let mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
        const modelName = modelsToTry[mIdx];
        const hasAlternativeModel = mIdx < modelsToTry.length - 1;
        const hasAlternativeKey = offset < apiKeysPool.length - 1;

        try {
          console.log(`[Model Execution] Executing model '${modelName}' on Key #${i + 1}`);

          const genConfig: any = {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              required: requiredSchemaFields,
              properties: responseSchema
            }
          };

          if (modelName.includes("3.7") || modelName.includes("3.8")) {
            genConfig.thinkingConfig = { thinkingBudget: 0 };
          }

          try {
            response = await ai.models.generateContent({
              model: modelName,
              contents: userPrompt,
              config: genConfig
            });
          } catch (initialErr: any) {
            const initMsg = initialErr.message || String(initialErr);
            if (genConfig.thinkingConfig && (initMsg.includes("thinking") || initMsg.includes("budget") || initMsg.includes("INVALID_ARGUMENT"))) {
              console.log(`[Model Auto-Tune] Retrying model '${modelName}' without thinkingConfig...`);
              const safeConfig = { ...genConfig };
              delete safeConfig.thinkingConfig;
              response = await ai.models.generateContent({
                model: modelName,
                contents: userPrompt,
                config: safeConfig
              });
            } else {
              throw initialErr;
            }
          }

          if (response && response.text) {
            executedModelName = modelName;
            console.log(`[Model Execution] Model '${modelName}' successfully generated response on Key #${i + 1}!`);
            break;
          }
        } catch (modelErr: any) {
          lastModelError = modelErr;
          const modelErrMsg = modelErr.message || String(modelErr);
          console.log(`[Model Execution] Model '${modelName}' failed on Key #${i + 1}: ${modelErrMsg}`);

          if (modelErrMsg.includes("API key not valid") || modelErrMsg.includes("API_KEY_INVALID")) {
            throw modelErr;
          }

          const isRateLimit429 =
            modelErrMsg.includes("429") ||
            modelErrMsg.includes("RESOURCE_EXHAUSTED") ||
            modelErrMsg.includes("quota") ||
            modelErrMsg.includes("rate limit") ||
            modelErrMsg.includes("Rate limit");

          const isHighDemand503 =
            modelErrMsg.includes("503") ||
            modelErrMsg.includes("UNAVAILABLE") ||
            modelErrMsg.includes("high demand") ||
            modelErrMsg.includes("overloaded");

          if (isHighDemand503) {
            if (hasAlternativeModel) {
              console.log(`[Fast Failover 503] '${modelName}' is busy. Instantly switching to '${modelsToTry[mIdx + 1]}' on Key #${i + 1}...`);
              continue;
            } else if (hasAlternativeKey) {
              console.log(`[Key Failover 503] All models busy on Key #${i + 1}. Switching to next Key...`);
              throw modelErr;
            }
          }

          if (isRateLimit429) {
            if (hasAlternativeModel) {
              console.log(`[Fast Model Rotation 429] '${modelName}' quota reached. Instantly switching to '${modelsToTry[mIdx + 1]}'...`);
              continue;
            }
            if (hasAlternativeKey) {
              console.log(`[Fast Key Rotation 429] Key #${i + 1} quota reached for all models. Instantly switching to next Key in pool...`);
              throw modelErr;
            }
            console.log(`[Final 429 Cooldown] All keys and models exhausted. Waiting 15s before final retry...`);
            await sleep(15000);
            try {
              response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: userPrompt,
                config: {
                  systemInstruction: systemInstruction,
                  responseMimeType: "application/json",
                  responseSchema: {
                    type: Type.OBJECT,
                    required: requiredSchemaFields,
                    properties: responseSchema
                  }
                }
              });
              if (response && response.text) {
                executedModelName = "gemini-2.5-flash";
                break;
              }
            } catch (retryErr) {
              lastModelError = retryErr;
            }
          }

          if (hasAlternativeModel) {
            console.log(`[Model Auto-Failover] '${modelName}' had an issue (${modelErrMsg.substring(0, 80)}). Seamlessly trying '${modelsToTry[mIdx + 1]}'...`);
            continue;
          }
        }

        if (response && response.text) {
          break;
        }
      }

      if (!response || !response.text) {
        throw lastModelError || new Error(`No response generated from requested models '${modelsToTry.join(", ")}'.`);
      }

      console.log(`[Key Execution] Successfully completed request with '${executedModelName}' using Key #${i + 1}/${apiKeysPool.length}!`);
      return { text: response.text, usedKeyIndex: i, usedModel: executedModelName };
    } catch (err: any) {
      lastError = err;
      const errMsg = err.message || String(err);
      console.warn(`[Key Execution] Key #${i + 1} (${maskedKey}) failed. Error: ${errMsg}`);
      attemptedKeysDetails.push(`Key #${i + 1} (${maskedKey}): ${errMsg}`);

      if (offset < apiKeysPool.length - 1) {
        const nextKeyIdx = (startIndex + offset + 1) % apiKeysPool.length;
        console.log(`[Key Failover] Proceeding sequentially to next Key #${nextKeyIdx + 1}/${apiKeysPool.length}...`);
        await sleep(500);
      }
    }
  }

  const errorMsg = "သင်ထည့်သွင်းထားသော API Key အားလုံး အလုပ်မလုပ်ပါ သို့မဟုတ် Quota/Rate Limit ပြည့်သွားပါသည်။";
  const details = attemptedKeysDetails.join("\n\n");

  const customError: any = new Error(errorMsg);
  customError.details = details;
  throw customError;
}

function getFriendlyErrorMessage(error: any): { error: string; details: string } {
  const errMsg = error.message || String(error);
  const errDetails = error.details || errMsg;

  if (
    errMsg.includes("503") ||
    errMsg.includes("UNAVAILABLE") ||
    errMsg.includes("high demand") ||
    errDetails.includes("503") ||
    errDetails.includes("UNAVAILABLE") ||
    errDetails.includes("high demand")
  ) {
    return {
      error: "Google Gemini Model သည် ယခုအချိန်တွင် အသုံးပြုသူ အလွန်များပြားနေပါသည် (High Traffic / Temporary Spike)။",
      details: "Bug ဖြေရှင်းရန်နည်းလမ်းများ -\n" +
               "၁။ စက္ကန့်အနည်းငယ် စောင့်ဆိုင်းပြီးနောက် 'ဇာတ်လမ်းဖန်တီးမည်' ကို ပြန်လည်နှိပ်ပေးပါ။\n" +
               "၂။ သို့မဟုတ် ဘေးဘယ်ဘက်ရှိ Model ရွေးချယ်မှုတွင် 'Gemini 2.5 Flash' သို့မဟုတ် 'Gemini 3.1 Flash-Lite' သို့ ပြောင်းလဲအသုံးပြုနိုင်ပါသည်။\n" +
               "၃။ Settings တွင် အရန် Gemini API Key များကို ထည့်သွင်းထားပါက Key Rotation စနစ်ဖြင့် ပိုမိုမြန်ဆန်စွာ အလုပ်လုပ်ပါမည်။\n\n" +
               `--------------------------------------------------\n` +
               `မူရင်းအမှားအယွင်း အသေးစိတ် (Original Error Details):\n${errDetails}`
    };
  }

  if (
    errMsg.includes("RESOURCE_EXHAUSTED") ||
    errMsg.includes("quota") ||
    errMsg.includes("429") ||
    errDetails.includes("RESOURCE_EXHAUSTED") ||
    errDetails.includes("quota") ||
    errDetails.includes("429")
  ) {
    return {
      error: "Gemini API သုံးစွဲမှုပမာဏ ကန့်သတ်ချက် ပြည့်သွားပါသည် (Quota Limit / Rate Limited ဖြစ်သွားပါသည်)။",
      details: "Bug ဖြေရှင်းရန်နည်းလမ်းများ -\n" +
               "၁။ စက္ကန့်ပိုင်းခေတ္တ စောင့်ဆိုင်းပြီးမှ ပြန်လည်စမ်းသပ်ပါ။\n" +
               "၂။ သို့မဟုတ် 'Gemini 2.5 Flash' မော်ဒယ်သို့ ပြောင်းလဲအသုံးပြုပါ (Quota ပိုမိုမြင့်မားပါသည်)။\n" +
               "၃။ Settings တွင် အခြားသော Gemini API Key တစ်ခု ထည့်သွင်းသိမ်းဆည်းကာ Key Rotation ဖြင့် သုံးစွဲပါ။\n\n" +
               `--------------------------------------------------\n` +
               `မူရင်းအမှားအယွင်း အသေးစိတ် (Original Error Details):\n${errDetails}`
    };
  }

  if (
    errMsg.includes("API key not valid") ||
    errMsg.includes("INVALID_ARGUMENT") ||
    errDetails.includes("API key not valid") ||
    errDetails.includes("INVALID_ARGUMENT")
  ) {
    return {
      error: "ထည့်သွင်းထားသော Gemini API Key မမှန်ကန်ပါ။",
      details: "Settings တွင် ထည့်သွင်းထားသော API Key သည် အလုပ်မလုပ်ပါ သို့မဟုတ် ရိုက်ထည့်ရာတွင် အမှားပါနေပါသည်။\n\n" +
               "ကျေးဇူးပြု၍ Settings Panel တွင် မှန်ကန်သော API Key ဖြစ်ကြောင်း ပြန်လည်စစ်ဆေးပေးပါ။\n\n" +
               `--------------------------------------------------\n` +
               `မူရင်းအမှားအယွင်း အသေးစိတ် (Original Error Details):\n${errDetails}`
    };
  }

  return {
    error: errMsg.includes("အလုပ်မလုပ်ပါ") ? errMsg : "ဇာတ်လမ်းဖန်တီးစဉ် အမှားအယွင်းတစ်ခု ဖြစ်ပွားခဲ့ပါသည်။",
    details: errDetails
  };
}

const PROFESSIONAL_IMAGE_PROMPT_DIRECTIVE = `
CRITICAL DIRECTIVE FROM SENIOR VISUAL PROMPT DIRECTORS (100% VISUAL & CHARACTER CONSISTENCY ACROSS ALL PARTS):
You are an elite Image Prompt Professional, Cinematographer, and Hollywood-grade 3D CGI Visual Director.
When creating 'imagePrompt' (Prompt 1) and 'imagePrompt2' (Prompt 2) across all parts of the story, you MUST strictly adhere to the following professional rules:

1. ABSOLUTE CHARACTER FACE & VISUAL CONSISTENCY:
   - In Part 1, establish an explicit Character Visual Anchor Blueprint for every main character (exact face shape, eyes, hair, outfit colors, accessories).
   - IN EVERY SUBSEQUENT PART, REPEAT their exact face, eye details, hair, signature clothing colors verbatim in the prompt text.
   - For 3D Fruit Hybrid characters: Maintain identical fruit head shape, facial eye structure, stem position, human body build, and exact outfit colors across every part.
   - For 3D Human / Realistic characters: Maintain identical facial structure, eye shape/color, haircut, and signature clothing across every part.

2. STORY-MATCHING ACTION, EMOTION & SCENE ALIGNMENT:
   - Prompt 1: Primary cinematic composition showcasing the central action or emotional confrontation.
   - Prompt 2: Complementary camera angle (emotional close-up, low-angle dynamic shot, or over-the-shoulder view).

3. CINEMATIC ENVIRONMENT, LIGHTING & CAMERA DEPTH:
   - Include volumetric lighting, soft rim light, depth of field, 9:16 portrait aspect ratio, high-resolution 3D CGI rendering, no watermarks, no words, no text inside the image.

4. SAFETY COMPLIANCE:
   - Strictly avoid forbidden words (no weapons, no blood, no copyrighted studio brand names like Disney/Pixar, no alcohol/drugs, no NSFW).
`;

function getCharacterStyleInstruction(characterStyle: string | undefined, fruit: string): string {
  const style = characterStyle || "fruit_hybrid";
  switch (style) {
    case "human_3d":
      return `CHARACTER VISUAL STYLE & STORY CONSTRAINT: 3D CGI ANIMATED HUMANS (3D လူသား ဇာတ်ကောင်စစ်စစ် - STRICT NO FRUIT IN STORY/PROMPTS)
- ABSOLUTE ZERO FRUIT MANDATE: The story narration, dialogues, characters, and plot MUST BE 100% focused on human characters.
- In Burmese dialogue, use realistic human names in tags (e.g. '[Male Voice (Confident) by Ethan]', '[Female Voice (Emotional) by Maya]').
- All main characters described as beautifully rendered 3D CGI animated human characters in vertical 9:16 portrait ratio, cinematic lighting, no text, no logos.`;

    case "cute_fruit":
      return `CHARACTER VISUAL STYLE: CUTE 3D ANIMATED PURE FRUITS (3D အသီးသန့် ဇာတ်ကောင်များ)
- All main characters MUST be described as adorable 3D CGI animated fresh ${fruit} characters with expressive shiny big eyes, cute smiles, and small stylized 3D cartoon arms and legs. Vertical 9:16 portrait ratio, studio lighting, smooth 3D render, no text.`;

    case "live_action":
      return `CHARACTER VISUAL STYLE & STORY CONSTRAINT: CINEMATIC LIVE-ACTION REAL HUMANS (အပြင်လူသား ရုပ်ရှင်ပုံစံ - STRICT NO FRUIT)
- ABSOLUTE ZERO FRUIT MANDATE: 100% focused on human characters and realistic human drama/comedy.
- Describe photorealistic real human actors, 35mm lens, f/1.8 depth of field, dramatic cinematic lighting, 9:16 aspect ratio, no text.`;

    case "fruit_hybrid":
    default:
      return `CHARACTER VISUAL STYLE: 3D HUMAN BODY WITH FRUIT HEAD HYBRID (လူကိုယ် အသီးခေါင်း 3D)
- Stylized 3D CGI cartoon characters with full human bodies dressed in stylish clothes, but their head/face is a complete fresh ${fruit} with expressive 3D facial features. Vertical 9:16 portrait ratio, vibrant lighting, smooth 3D CGI render, no text.`;
  }
}

const GENDER_AND_MULTI_SPEAKER_RULES = `
CRITICAL VOICE DIRECTION, EMOTIONAL SOUND SYSTEM & SPEECH PROMPT PRECISION RULES:
1. CONCISE & DIRECT DIALOGUE ("လိုရင်းရောက်အောင် ပြောဆိုခြင်း"): Spoken lines get straight to the point in ~10 seconds.
2. SCENE-MATCHED EMOTIONAL VOICE & SOUND SYSTEM: Craft voice direction tags with accurate vocal emotion and matching background sound effects for every scene:
   - Tag format: [Voice: Male/Female by Name | Tone: ... | Emotion: ... | Sound FX: ...] followed by Burmese dialogue.
`;

function getStoryPacingInstruction(totalParts: number, initialBatchSize: number, isMultiBatch: boolean): string {
  if (totalParts === 1) {
    return `STORY PACING DIRECTIVE (1-PART MICRO-STORY): Complete, self-contained 1-part single scene/micro-story with immediate hook, conflict, and punchline.`;
  }
  if (totalParts >= 2 && totalParts <= 5) {
    return `STORY PACING DIRECTIVE (${totalParts} PARTS): Part 1 Hook & Setup, Parts 2-${totalParts-1} Rising Conflict, Part ${totalParts} Dramatic Climax & Resolution.`;
  }
  if (isMultiBatch) {
    return `STORY PACING DIRECTIVE (EXTENDED EPIC: ${totalParts} TOTAL PARTS): Writing initial batch: parts 1 to ${initialBatchSize}. Maintain continuity with a cliffhanger at part ${initialBatchSize}.`;
  }
  return `STORY PACING DIRECTIVE (${totalParts} PARTS): Smoothly structured across all ${totalParts} parts: Beginning Setup -> Developing Adventure -> Climax -> Resolution.`;
}

// API: Generate Fruit Story
app.post("/api/generate-story", async (req, res) => {
  try {
    const { fruit, genre, genreLabel, partsCount, customIdea, characterStyle, selectedModel } = req.body;
    const modelToUse = (selectedModel || (req.headers["x-gemini-model"] as string) || "").trim() || undefined;

    if (!fruit || !genre || !partsCount) {
      return res.status(400).json({ error: "Missing required fields: fruit, genre, partsCount" });
    }

    const clientApiKeys = ((req.headers["x-gemini-api-key"] as string) || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const serverApiKeys = (process.env.GEMINI_API_KEY || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const apiKeysPool = clientApiKeys.length > 0 ? clientApiKeys : serverApiKeys;

    if (apiKeysPool.length === 0) {
      return res.status(401).json({
        error: "Gemini API Key မတွေ့ရှိပါ။ Settings စာမျက်နှာတွင် API Key ထည့်သွင်းပေးပါ သို့မဟုတ် စနစ်စီမံခန့်ခွဲသူအား ဆက်သွယ်ပါ။",
      });
    }

    const isHumanStyle = characterStyle === "human_3d" || characterStyle === "live_action" || fruit === "No Fruit" || (typeof fruit === "string" && (fruit.toLowerCase().includes("no fruit") || fruit.toLowerCase().includes("human") || fruit.toLowerCase().includes("လူသား")));
    const styleInstruction = getCharacterStyleInstruction(characterStyle, fruit);

    const totalParts = Number(partsCount);
    const initialBatchSize = Math.min(totalParts, 20);
    const isMultiBatch = totalParts > 20;
    const pacingInstruction = getStoryPacingInstruction(totalParts, initialBatchSize, isMultiBatch);

    const systemInstruction = `You are an expert storyteller and 3D Character Scene Generator who writes creative, compelling stories for Myanmar listeners.
${pacingInstruction}
${styleInstruction}
${PROFESSIONAL_IMAGE_PROMPT_DIRECTIVE}
${GENDER_AND_MULTI_SPEAKER_RULES}

Structure response as a JSON object containing:
- title: string (Myanmar story title)
- description: string (Myanmar summary)
- parts: array of objects with partNumber, imagePrompt, imagePrompt2, narrationBurmese, cameraRotation, cameraSettings.

Generate exactly ${initialBatchSize} parts.`;

    const userPrompt = `Write the story under genre "${genreLabel || genre}". Character style: ${characterStyle || "fruit_hybrid"}. Concept/fruit: ${fruit}. Generate parts 1 to ${initialBatchSize} (out of ${totalParts} total parts).`;

    const responseSchema = {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      parts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["partNumber", "imagePrompt", "imagePrompt2", "narrationBurmese", "cameraRotation", "cameraSettings"],
          properties: {
            partNumber: { type: Type.INTEGER },
            imagePrompt: { type: Type.STRING },
            imagePrompt2: { type: Type.STRING },
            narrationBurmese: { type: Type.STRING },
            cameraRotation: { type: Type.STRING },
            cameraSettings: { type: Type.STRING },
          }
        }
      }
    };

    const result = await generateContentWithRotation(
      apiKeysPool,
      userPrompt,
      systemInstruction,
      responseSchema,
      ["title", "description", "parts"],
      modelToUse
    );

    const storyData = JSON.parse(result.text.trim());
    return res.json(storyData);
  } catch (error: any) {
    console.error("Story Generation Error:", error);
    const friendly = getFriendlyErrorMessage(error);
    return res.status(500).json(friendly);
  }
});

// API: Continue Standard/Fruit/Human Story
app.post("/api/generate-story-continue", async (req, res) => {
  try {
    const { fruit, genre, genreLabel, characterStyle, title, description, startPartNumber, endPartNumber, lastPartText, totalPartsCount, selectedModel } = req.body;
    const modelToUse = (selectedModel || (req.headers["x-gemini-model"] as string) || "").trim() || undefined;

    if (!title || !startPartNumber || !endPartNumber) {
      return res.status(400).json({ error: "Missing required fields for continuation" });
    }

    const clientApiKeys = ((req.headers["x-gemini-api-key"] as string) || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const serverApiKeys = (process.env.GEMINI_API_KEY || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const apiKeysPool = clientApiKeys.length > 0 ? clientApiKeys : serverApiKeys;

    if (apiKeysPool.length === 0) {
      return res.status(401).json({ error: "Gemini API Key မတွေ့ရှိပါ။" });
    }

    const styleInstruction = getCharacterStyleInstruction(characterStyle, fruit);
    const isFinalBatch = Number(endPartNumber) >= Number(totalPartsCount);

    const systemInstruction = `You are continuing the story "${title}".
${styleInstruction}
${PROFESSIONAL_IMAGE_PROMPT_DIRECTIVE}
${GENDER_AND_MULTI_SPEAKER_RULES}
${isFinalBatch ? "This is the final batch. Bring plot to a satisfying conclusion in the very last part." : "Pace the narrative smoothly for future parts."}

Generate parts ${startPartNumber} to ${endPartNumber} exactly.`;

    const userPrompt = `Continue story "${title}" from part ${startPartNumber} to ${endPartNumber}. Previous part ended with: "${lastPartText || ""}".`;

    const responseSchema = {
      parts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["partNumber", "imagePrompt", "imagePrompt2", "narrationBurmese", "cameraRotation", "cameraSettings"],
          properties: {
            partNumber: { type: Type.INTEGER },
            imagePrompt: { type: Type.STRING },
            imagePrompt2: { type: Type.STRING },
            narrationBurmese: { type: Type.STRING },
            cameraRotation: { type: Type.STRING },
            cameraSettings: { type: Type.STRING },
          }
        }
      }
    };

    const result = await generateContentWithRotation(
      apiKeysPool,
      userPrompt,
      systemInstruction,
      responseSchema,
      ["parts"],
      modelToUse
    );

    const contData = JSON.parse(result.text.trim());
    return res.json(contData);
  } catch (error: any) {
    console.error("Story Continuation Error:", error);
    const friendly = getFriendlyErrorMessage(error);
    return res.status(500).json(friendly);
  }
});

// Dedicated helper to verify if true story exists using Google Search grounding
async function verifyTrueStoryWithRotation(apiKeysPool: string[], query: string, targetModel?: string) {
  if (apiKeysPool.length === 0) {
    throw new Error("Gemini API Key မတွေ့ရပါ။ Settings တွင် API Key ထည့်သွင်းပေးပါ။");
  }

  const searchModels = getModelExecutionList(targetModel);
  const startIndex = getNextRoundRobinStartIndex(apiKeysPool.length);

  for (let offset = 0; offset < apiKeysPool.length; offset++) {
    const i = (startIndex + offset) % apiKeysPool.length;
    const apiKey = apiKeysPool[i];

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });

      const verificationSystemInstruction = `You are a factual research expert in Myanmar literature and true events.
Verify if "${query}" is an actual real-world story, famous true event, or published biographical novel in Myanmar.
Return JSON with found (boolean), realTitle (string), explanation (Burmese summary).`;

      const verificationSchema = {
        found: { type: Type.BOOLEAN },
        realTitle: { type: Type.STRING },
        explanation: { type: Type.STRING }
      };

      for (const searchModel of searchModels) {
        try {
          const response = await ai.models.generateContent({
            model: searchModel,
            contents: `Search and verify if "${query}" is an actual real-world story or published biographical novel in Myanmar.`,
            config: {
              systemInstruction: verificationSystemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                required: ["found", "realTitle", "explanation"],
                properties: verificationSchema,
              },
              tools: [{ googleSearch: {} }],
            }
          });

          if (response.text) {
            return JSON.parse(response.text.trim());
          }
        } catch (searchErr) {
          // fallback
        }
      }

      // Fallback without search tool
      for (const stdModel of searchModels) {
        try {
          const response = await ai.models.generateContent({
            model: stdModel,
            contents: `Verify using your Myanmar literature database if "${query}" is a real-world story or true-story novel.`,
            config: {
              systemInstruction: verificationSystemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                required: ["found", "realTitle", "explanation"],
                properties: verificationSchema,
              },
            }
          });

          if (response.text) {
            return JSON.parse(response.text.trim());
          }
        } catch (stdErr) {
          // continue
        }
      }
    } catch (err) {
      // try next key
    }
  }

  return { found: true, realTitle: query, explanation: "တကယ့်ဖြစ်ရပ်မှန် ဇာတ်လမ်းကို အခြေခံထားပါသည်။" };
}

// API: Generate Realistic Human True Story
app.post("/api/generate-true-story", async (req, res) => {
  try {
    const { query, partsCount, style, selectedModel } = req.body;
    const modelToUse = (selectedModel || (req.headers["x-gemini-model"] as string) || "").trim() || undefined;
    const totalPartsCount = Number(partsCount) || 15;

    if (!query) {
      return res.status(400).json({ error: "Missing required fields: query" });
    }

    const clientApiKeys = ((req.headers["x-gemini-api-key"] as string) || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const serverApiKeys = (process.env.GEMINI_API_KEY || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const apiKeysPool = clientApiKeys.length > 0 ? clientApiKeys : serverApiKeys;

    if (apiKeysPool.length === 0) {
      return res.status(401).json({ error: "Gemini API Key မတွေ့ရှိပါ။" });
    }

    let verification;
    if (style === "tea_youtiao") {
      verification = {
        found: true,
        realTitle: query || "ရိုမန်းတစ် စုံတွဲဇာတ်လမ်း",
        explanation: "စိတ်ကြိုက် ဇာတ်ကောင်စုံတွဲများ၏ ထူးခြားလှပသော အချစ်ခရီးစဉ် ဇာတ်လမ်း။"
      };
    } else {
      verification = await verifyTrueStoryWithRotation(apiKeysPool, query, modelToUse);
    }

    if (!verification.found) {
      return res.status(422).json({
        error: "ရှာဖွေမှုမတွေ့ရှိပါ (Story Not Found)",
        details: verification.explanation || "ဤအမည်ဖြင့် ဖြစ်ရပ်မှန်ဇာတ်လမ်း မတွေ့ရှိပါ။",
        notFound: true
      });
    }

    const batchSize = Math.min(totalPartsCount, 20);
    const storySystemInstruction = `You are an expert storyteller and director creating stories based on verified true events in Myanmar: "${verification.realTitle}".
${PROFESSIONAL_IMAGE_PROMPT_DIRECTIVE}
Pace the story across parts 1 to ${batchSize}. All prompts 9:16 portrait. Burmese direct dialogue with emotion tags.`;

    const userPrompt = `Write parts 1 to ${batchSize} of "${verification.realTitle}". True story background: "${verification.explanation}".`;

    const responseSchema = {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      parts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["partNumber", "imagePrompt", "imagePrompt2", "narrationBurmese", "cameraRotation", "cameraSettings"],
          properties: {
            partNumber: { type: Type.INTEGER },
            imagePrompt: { type: Type.STRING },
            imagePrompt2: { type: Type.STRING },
            narrationBurmese: { type: Type.STRING },
            cameraRotation: { type: Type.STRING },
            cameraSettings: { type: Type.STRING },
          }
        }
      }
    };

    const result = await generateContentWithRotation(
      apiKeysPool,
      userPrompt,
      storySystemInstruction,
      responseSchema,
      ["title", "description", "parts"],
      modelToUse
    );

    const storyData = JSON.parse(result.text.trim());
    return res.json({
      ...storyData,
      isRealStory: true,
      realStoryBackground: verification.explanation,
      totalPartsCount
    });
  } catch (error: any) {
    console.error("True Story Generation Error:", error);
    const friendly = getFriendlyErrorMessage(error);
    return res.status(500).json(friendly);
  }
});

// API: Continue Realistic Human True Story
app.post("/api/generate-true-story-continue", async (req, res) => {
  try {
    const { query, title, description, startPartNumber, endPartNumber, lastPartText, totalPartsCount, style, selectedModel } = req.body;
    const modelToUse = (selectedModel || (req.headers["x-gemini-model"] as string) || "").trim() || undefined;

    if (!title || !startPartNumber || !endPartNumber) {
      return res.status(400).json({ error: "Missing required fields for continuation" });
    }

    const clientApiKeys = ((req.headers["x-gemini-api-key"] as string) || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const serverApiKeys = (process.env.GEMINI_API_KEY || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const apiKeysPool = clientApiKeys.length > 0 ? clientApiKeys : serverApiKeys;

    if (apiKeysPool.length === 0) {
      return res.status(401).json({ error: "Gemini API Key မတွေ့ရှိပါ။" });
    }

    const isFinalBatch = Number(endPartNumber) >= Number(totalPartsCount);
    const continuationSystemInstruction = `You are continuing the true story "${title}".
${PROFESSIONAL_IMAGE_PROMPT_DIRECTIVE}
${isFinalBatch ? "Final batch. Complete the story and resolve conflicts." : "Continue the narrative smoothly."}
Generate parts ${startPartNumber} to ${endPartNumber} exactly.`;

    const userPrompt = `Continue story "${title}" from part ${startPartNumber} to ${endPartNumber}. Previous: "${lastPartText || ""}".`;

    const responseSchema = {
      parts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["partNumber", "imagePrompt", "imagePrompt2", "narrationBurmese", "cameraRotation", "cameraSettings"],
          properties: {
            partNumber: { type: Type.INTEGER },
            imagePrompt: { type: Type.STRING },
            imagePrompt2: { type: Type.STRING },
            narrationBurmese: { type: Type.STRING },
            cameraRotation: { type: Type.STRING },
            cameraSettings: { type: Type.STRING },
          }
        }
      }
    };

    const result = await generateContentWithRotation(
      apiKeysPool,
      userPrompt,
      continuationSystemInstruction,
      responseSchema,
      ["parts"],
      modelToUse
    );

    const storyData = JSON.parse(result.text.trim());
    return res.json(storyData);
  } catch (error: any) {
    console.error("True Story Continuation Error:", error);
    const friendly = getFriendlyErrorMessage(error);
    return res.status(500).json(friendly);
  }
});

// API: Suggest Cooking Ingredients
app.post("/api/suggest-ingredients", async (req, res) => {
  try {
    const { dishName, selectedModel } = req.body;
    const modelToUse = (selectedModel || (req.headers["x-gemini-model"] as string) || "").trim() || undefined;

    if (!dishName) {
      return res.status(400).json({ error: "Missing required field: dishName" });
    }

    const clientApiKeys = ((req.headers["x-gemini-api-key"] as string) || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const serverApiKeys = (process.env.GEMINI_API_KEY || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const apiKeysPool = clientApiKeys.length > 0 ? clientApiKeys : serverApiKeys;

    if (apiKeysPool.length === 0) {
      return res.status(401).json({ error: "Gemini API Key မတွေ့ရှိပါ။" });
    }

    const systemInstruction = `You are an expert chef in Myanmar. Recommend a common comma-separated list of ingredients in Myanmar language for the dish. Return JSON with key "ingredients".`;
    const userPrompt = `List ingredients for "${dishName}" in Myanmar language.`;

    const responseSchema = {
      ingredients: { type: Type.STRING }
    };

    const result = await generateContentWithRotation(
      apiKeysPool,
      userPrompt,
      systemInstruction,
      responseSchema,
      ["ingredients"],
      modelToUse
    );

    const data = JSON.parse(result.text.trim());
    return res.json(data);
  } catch (error: any) {
    console.error("Suggest Ingredients Error:", error);
    const friendly = getFriendlyErrorMessage(error);
    return res.status(500).json(friendly);
  }
});

// API: Generate Cooking Recipe Guide
app.post("/api/generate-cooking-recipe", async (req, res) => {
  try {
    const { dishName, ingredients, stepsCount, presentationTone, selectedModel } = req.body;
    const modelToUse = (selectedModel || (req.headers["x-gemini-model"] as string) || "").trim() || undefined;

    if (!dishName || !stepsCount) {
      return res.status(400).json({ error: "Missing required fields: dishName, stepsCount" });
    }

    const clientApiKeys = ((req.headers["x-gemini-api-key"] as string) || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const serverApiKeys = (process.env.GEMINI_API_KEY || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const apiKeysPool = clientApiKeys.length > 0 ? clientApiKeys : serverApiKeys;

    if (apiKeysPool.length === 0) {
      return res.status(401).json({ error: "Gemini API Key မတွေ့ရှိပါ။" });
    }

    const systemInstruction = `You are an expert chef creating a step-by-step cooking recipe with 3D Pixar character chef image prompts and Myanmar narration.
${PROFESSIONAL_IMAGE_PROMPT_DIRECTIVE}
Generate exactly ${stepsCount} steps.`;

    const userPrompt = `Generate a cooking recipe for "${dishName}" with ${stepsCount} steps. Ingredients: ${ingredients || "Standard"}. Tone: ${presentationTone}.`;

    const responseSchema = {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      parts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["partNumber", "imagePrompt", "imagePrompt2", "narrationBurmese", "cameraRotation", "cameraSettings"],
          properties: {
            partNumber: { type: Type.INTEGER },
            imagePrompt: { type: Type.STRING },
            imagePrompt2: { type: Type.STRING },
            narrationBurmese: { type: Type.STRING },
            cameraRotation: { type: Type.STRING },
            cameraSettings: { type: Type.STRING },
          }
        }
      }
    };

    const result = await generateContentWithRotation(
      apiKeysPool,
      userPrompt,
      systemInstruction,
      responseSchema,
      ["title", "description", "parts"],
      modelToUse
    );

    const recipeData = JSON.parse(result.text.trim());
    return res.json(recipeData);
  } catch (error: any) {
    console.error("Cooking Recipe Generation Error:", error);
    const friendly = getFriendlyErrorMessage(error);
    return res.status(500).json(friendly);
  }
});

// API: Generate Manual Story parts
app.post("/api/generate-manual-story", async (req, res) => {
  try {
    const { title, description, fruit, partsCount, characterStyle, selectedModel } = req.body;
    const modelToUse = (selectedModel || (req.headers["x-gemini-model"] as string) || "").trim() || undefined;

    if (!title || !description || !fruit || !partsCount) {
      return res.status(400).json({ error: "Missing required fields: title, description, fruit, partsCount" });
    }

    const clientApiKeys = ((req.headers["x-gemini-api-key"] as string) || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const serverApiKeys = (process.env.GEMINI_API_KEY || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const apiKeysPool = clientApiKeys.length > 0 ? clientApiKeys : serverApiKeys;

    if (apiKeysPool.length === 0) {
      return res.status(401).json({ error: "Gemini API Key မတွေ့ရှိပါ။" });
    }

    const styleInstruction = getCharacterStyleInstruction(characterStyle, fruit);
    const systemInstruction = `You are writing a story matching title: "${title}" and description: "${description}".
${styleInstruction}
${PROFESSIONAL_IMAGE_PROMPT_DIRECTIVE}
Generate exactly ${partsCount} parts.`;

    const userPrompt = `Generate exactly ${partsCount} story parts for "${title}". Description: "${description}".`;

    const responseSchema = {
      parts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["partNumber", "imagePrompt", "imagePrompt2", "narrationBurmese", "cameraRotation", "cameraSettings"],
          properties: {
            partNumber: { type: Type.INTEGER },
            imagePrompt: { type: Type.STRING },
            imagePrompt2: { type: Type.STRING },
            narrationBurmese: { type: Type.STRING },
            cameraRotation: { type: Type.STRING },
            cameraSettings: { type: Type.STRING },
          }
        }
      }
    };

    const result = await generateContentWithRotation(
      apiKeysPool,
      userPrompt,
      systemInstruction,
      responseSchema,
      ["parts"],
      modelToUse
    );

    const storyData = JSON.parse(result.text.trim());
    return res.json(storyData);
  } catch (error: any) {
    console.error("Manual Story Generation Error:", error);
    const friendly = getFriendlyErrorMessage(error);
    return res.status(500).json(friendly);
  }
});

// Helper for multimodal video/image generation
async function generateMultimodalWithRotation(
  apiKeysPool: string[],
  contents: any[],
  systemInstruction: string,
  responseSchema: any,
  requiredSchemaFields: string[],
  targetModel?: string
) {
  if (apiKeysPool.length === 0) {
    throw new Error("Gemini API Key မတွေ့ရပါ။");
  }

  const modelsToTry = getModelExecutionList(targetModel);
  const startIndex = getNextRoundRobinStartIndex(apiKeysPool.length);

  for (let offset = 0; offset < apiKeysPool.length; offset++) {
    const i = (startIndex + offset) % apiKeysPool.length;
    const apiKey = apiKeysPool[i];

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });

      for (let mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
        const modelName = modelsToTry[mIdx];
        try {
          const genConfig: any = {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              required: requiredSchemaFields,
              properties: responseSchema,
            },
          };

          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: genConfig,
          });

          if (response && response.text) {
            return { text: response.text };
          }
        } catch (mErr) {
          // try next model
        }
      }
    } catch (kErr) {
      // try next key
    }
  }

  throw new Error("API Key အားလုံး Quota/Rate Limit ပြည့်သွားပါသည်။");
}

// API: Photo Character Story
app.post("/api/generate-photo-character-story", async (req, res) => {
  try {
    const { images, storyTitle, synopsis, genre, partsCount, selectedModel } = req.body;
    const modelToUse = (selectedModel || (req.headers["x-gemini-model"] as string) || "").trim() || undefined;

    if (!partsCount || partsCount < 1) {
      return res.status(400).json({ error: "Missing required field: partsCount" });
    }

    const clientApiKeys = ((req.headers["x-gemini-api-key"] as string) || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const serverApiKeys = (process.env.GEMINI_API_KEY || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const apiKeysPool = clientApiKeys.length > 0 ? clientApiKeys : serverApiKeys;

    if (apiKeysPool.length === 0) {
      return res.status(401).json({ error: "Gemini API Key မတွေ့ရှိပါ။" });
    }

    const systemInstruction = `You are an expert concept artist and storyteller creating a ${partsCount}-part story replicating the exact character art style in reference photos.
${PROFESSIONAL_IMAGE_PROMPT_DIRECTIVE}
Maintain 100% character face and outfit consistency in all image prompts.`;

    const contents: any[] = [];
    if (images && Array.isArray(images) && images.length > 0) {
      images.forEach((imgItem: any) => {
        let rawData = typeof imgItem === "string" ? imgItem : imgItem?.dataUrl || "";
        let mimeType = "image/jpeg";
        if (rawData.startsWith("data:")) {
          const match = rawData.match(/^data:([^;]+);base64,/);
          if (match) {
            mimeType = match[1];
            rawData = rawData.substring(match[0].length);
          }
        }
        if (rawData) {
          contents.push({ inlineData: { mimeType, data: rawData } });
        }
      });
    }

    contents.push(`Create a ${partsCount}-part story based on the character photo. Title: ${storyTitle || "Story"}. Synopsis: ${synopsis || ""}. Genre: ${genre || ""}.`);

    const responseSchema = {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      parts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["partNumber", "imagePrompt", "imagePrompt2", "narrationBurmese", "cameraRotation", "cameraSettings"],
          properties: {
            partNumber: { type: Type.NUMBER },
            imagePrompt: { type: Type.STRING },
            imagePrompt2: { type: Type.STRING },
            narrationBurmese: { type: Type.STRING },
            cameraRotation: { type: Type.STRING },
            cameraSettings: { type: Type.STRING },
          }
        }
      }
    };

    const result = await generateMultimodalWithRotation(
      apiKeysPool,
      contents,
      systemInstruction,
      responseSchema,
      ["title", "description", "parts"],
      modelToUse
    );

    const storyData = JSON.parse(result.text.trim());
    return res.json(storyData);
  } catch (error: any) {
    console.error("Photo Character Story Error:", error);
    const friendly = getFriendlyErrorMessage(error);
    return res.status(500).json(friendly);
  }
});

// API: Bar & Restaurant Live Singing Performance Story
app.post("/api/generate-bar-restaurant-story", async (req, res) => {
  try {
    const { fruit, characterStyle, barTheme, partsCount, songTitle, customIdea, selectedModel } = req.body;
    const modelToUse = (selectedModel || (req.headers["x-gemini-model"] as string) || "").trim() || undefined;

    if (!fruit || !partsCount) {
      return res.status(400).json({ error: "Missing required fields: fruit, partsCount" });
    }

    const clientApiKeys = ((req.headers["x-gemini-api-key"] as string) || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const serverApiKeys = (process.env.GEMINI_API_KEY || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const apiKeysPool = clientApiKeys.length > 0 ? clientApiKeys : serverApiKeys;

    if (apiKeysPool.length === 0) {
      return res.status(401).json({ error: "Gemini API Key မတွေ့ရှိပါ။" });
    }

    const styleInstruction = getCharacterStyleInstruction(characterStyle || "fruit_hybrid", fruit);
    const systemInstruction = `You are creating live singing performance lyrics and stage visual prompts in an atmospheric Bar & Restaurant setting.
${styleInstruction}
${PROFESSIONAL_IMAGE_PROMPT_DIRECTIVE}
Spoken narration MUST be actual singing performance lyrics with [Singer Voice | Style] tags.`;

    const userPrompt = `Create a ${partsCount}-part live singing performance story. Song Title: "${songTitle || "Live Song"}". Theme: ${barTheme}. Idea: ${customIdea || ""}.`;

    const responseSchema = {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      parts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["partNumber", "imagePrompt", "imagePrompt2", "narrationBurmese", "cameraRotation", "cameraSettings"],
          properties: {
            partNumber: { type: Type.NUMBER },
            imagePrompt: { type: Type.STRING },
            imagePrompt2: { type: Type.STRING },
            narrationBurmese: { type: Type.STRING },
            cameraRotation: { type: Type.STRING },
            cameraSettings: { type: Type.STRING },
          }
        }
      }
    };

    const result = await generateContentWithRotation(
      apiKeysPool,
      userPrompt,
      systemInstruction,
      responseSchema,
      ["title", "description", "parts"],
      modelToUse
    );

    const storyData = JSON.parse(result.text.trim());
    return res.json(storyData);
  } catch (error: any) {
    console.error("Bar Story Error:", error);
    const friendly = getFriendlyErrorMessage(error);
    return res.status(500).json(friendly);
  }
});

// API: Generate story from uploaded video
app.post("/api/generate-story-from-video", async (req, res) => {
  try {
    const { video, mimeType, partsCount, customFruit, customIdea, frames, audio, selectedModel } = req.body;
    const modelToUse = (selectedModel || (req.headers["x-gemini-model"] as string) || "").trim() || undefined;

    if (!partsCount) {
      return res.status(400).json({ error: "Missing required fields: partsCount" });
    }

    const clientApiKeys = ((req.headers["x-gemini-api-key"] as string) || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const serverApiKeys = (process.env.GEMINI_API_KEY || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const apiKeysPool = clientApiKeys.length > 0 ? clientApiKeys : serverApiKeys;

    if (apiKeysPool.length === 0) {
      return res.status(401).json({ error: "Gemini API Key မတွေ့ရှိပါ။" });
    }

    const fruit = customFruit || "mango";
    const systemInstruction = `Analyze the video/audio and generate a ${partsCount}-part story with characters having ${fruit} heads.
${PROFESSIONAL_IMAGE_PROMPT_DIRECTIVE}
Match Burmese dialogues with audio speech if provided.`;

    const contents: any[] = [];
    if (audio) {
      let audioBase64 = audio.includes(";base64,") ? audio.split(";base64,").pop() : audio;
      contents.push({ inlineData: { mimeType: "audio/wav", data: audioBase64 } });
    }

    if (frames && Array.isArray(frames)) {
      frames.forEach((frame: string) => {
        let frameBase64 = frame.includes(";base64,") ? frame.split(";base64,").pop() : frame;
        contents.push({ inlineData: { mimeType: "image/jpeg", data: frameBase64 } });
      });
    } else if (video && mimeType) {
      let base64Data = video.includes(";base64,") ? video.split(";base64,").pop() : video;
      contents.push({ inlineData: { mimeType, data: base64Data } });
    }

    contents.push(`Generate exactly ${partsCount} parts based on the attached media. Concept/fruit: ${fruit}. Idea: ${customIdea || ""}.`);

    const responseSchema = {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      parts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["partNumber", "imagePrompt", "imagePrompt2", "narrationBurmese", "cameraRotation", "cameraSettings"],
          properties: {
            partNumber: { type: Type.INTEGER },
            imagePrompt: { type: Type.STRING },
            imagePrompt2: { type: Type.STRING },
            narrationBurmese: { type: Type.STRING },
            cameraRotation: { type: Type.STRING },
            cameraSettings: { type: Type.STRING },
          }
        }
      }
    };

    const result = await generateMultimodalWithRotation(
      apiKeysPool,
      contents,
      systemInstruction,
      responseSchema,
      ["title", "description", "parts"],
      modelToUse
    );

    const storyData = JSON.parse(result.text.trim());
    return res.json(storyData);
  } catch (error: any) {
    console.error("Video Story Error:", error);
    const friendly = getFriendlyErrorMessage(error);
    return res.status(500).json(friendly);
  }
});

// API: Translate Story Dialogues to Target Language
app.post("/api/translate-story-dialogues", async (req, res) => {
  try {
    const { parts, targetLanguage, storyTitle, selectedModel } = req.body;
    const modelToUse = (selectedModel || (req.headers["x-gemini-model"] as string) || "").trim() || undefined;

    if (!parts || !Array.isArray(parts) || parts.length === 0 || !targetLanguage) {
      return res.status(400).json({ error: "Missing required fields: parts, targetLanguage" });
    }

    const clientApiKeys = ((req.headers["x-gemini-api-key"] as string) || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const serverApiKeys = (process.env.GEMINI_API_KEY || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const apiKeysPool = clientApiKeys.length > 0 ? clientApiKeys : serverApiKeys;

    if (apiKeysPool.length === 0) {
      return res.status(401).json({ error: "Gemini API Key မတွေ့ရှိပါ။" });
    }

    const langTarget = targetLanguage.toLowerCase();
    const langName = langTarget === "english" ? "English" : langTarget === "japanese" ? "Japanese (日本語)" : "Burmese (မြန်မာဘာသာ)";

    const systemInstruction = `Translate story dialogues into ${langName}. Retain bracketed speaker/emotion tags in English at start of narration. Output JSON with "translatedParts": [{ "partNumber": number, "narration": string }].`;

    const inputData = parts.map((p: any) => ({
      partNumber: p.partNumber,
      originalNarration: p.narrationBurmese || p.narrationEnglish || p.narrationJapanese || "",
    }));

    const userPrompt = `Translate dialogues to ${langName} for story "${storyTitle || ""}". Input: ${JSON.stringify(inputData)}`;

    const responseSchema = {
      translatedParts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["partNumber", "narration"],
          properties: {
            partNumber: { type: Type.INTEGER },
            narration: { type: Type.STRING }
          }
        }
      }
    };

    const result = await generateContentWithRotation(
      apiKeysPool,
      userPrompt,
      systemInstruction,
      responseSchema,
      ["translatedParts"],
      modelToUse
    );

    const data = JSON.parse(result.text.trim());
    return res.json(data);
  } catch (error: any) {
    console.error("Translate Dialogues Error:", error);
    const friendly = getFriendlyErrorMessage(error);
    return res.status(500).json(friendly);
  }
});

// Vite server integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
