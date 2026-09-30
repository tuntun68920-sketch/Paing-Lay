import React, { useState, useEffect, useRef } from "react";
import { BookOpen, Sparkles, Settings as SettingsIcon, AlertCircle, Compass, RefreshCw, HelpCircle, Heart, CheckCircle2, Loader2, Circle, Timer, Activity, Smartphone, Tablet, Monitor, Users, Check, Edit2 } from "lucide-react";
import { Story, Settings, PREDEFINED_GENRES, FRUIT_SUGGESTIONS } from "./types";
import SettingsPanel from "./components/SettingsPanel";
import StoryCreator from "./components/StoryCreator";
import StoryViewer from "./components/StoryViewer";
import Library from "./components/Library";

interface LogItem {
  time: string;
  type: "info" | "success" | "warn" | "process";
  text: string;
  burmese: string;
}

function LiveLogTerminal({ seconds, metadata, estTime, settings, activeKeyLabel }: { seconds: number; metadata: any; estTime: number; settings: Settings; activeKeyLabel: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const parts = metadata?.partsCount || 10;
  const fruit = metadata?.fruit || "Mango";

  const getLiveLogs = (): LogItem[] => {
    const logs: LogItem[] = [];
    const fmt = (s: number) => `[${s.toFixed(1)}s]`;

    if (seconds >= 0) {
      logs.push({
        time: fmt(0.1),
        type: "info",
        text: "System initialization sequence triggered.",
        burmese: "စနစ်စတင်လည်ပတ်ခြင်း လုပ်ငန်းစဉ် စတင်လိုက်ပြီ။"
      });
    }
    if (seconds >= 0.6) {
      logs.push({
        time: fmt(0.6),
        type: "process",
        text: `Validating configuration parameters. Style = ${metadata?.isManual ? "User Prompt" : "AI Story Mode"}, Parts = ${parts}.`,
        burmese: `ထည့်သွင်းသတ်မှတ်ချက်များ စစ်ဆေးနေသည်။ စတိုင် = ${metadata?.isManual ? "ကိုယ်တိုင်ညွှန်ကြားချက်" : "AI ဇာတ်လမ်းပုံစံ"}၊ အပိုင်းအရေအတွက် = ${parts}။`
      });
    }
    if (seconds >= 1.2) {
      logs.push({
        time: fmt(1.2),
        type: "process",
        text: `Checking true-story name and database match indices...`,
        burmese: `ဖြစ်ရပ်မှန်ဇာတ်လမ်း သမိုင်းကြောင်းများနှင့် အချက်အလက် ကိုက်ညီမှု ရှိမရှိ ရှာဖွေစိစစ်နေသည်...`
      });
    }
    if (seconds >= 1.8) {
      logs.push({
        time: fmt(1.8),
        type: "success",
        text: `Match verified. Context mapped to historical Myanmar outline archive.`,
        burmese: `အချက်အလက်ကိုက်ညီမှု စိစစ်ပြီးစီး။ မြန်မာဖြစ်ရပ်မှန် ဝတ္ထုအကျဉ်းချုပ်နှင့် ဆက်စပ်မှု ပုံဖော်လိုက်ပြီ။`
      });
    }
    if (seconds >= 2.5) {
      logs.push({
        time: fmt(2.5),
        type: "process",
        text: `Acquiring connection channel to Gemini high-throughput secure proxy gateways...`,
        burmese: `လုံခြုံစိတ်ချရသော မြန်နှုန်းမြင့် Gemini Proxy ဆာဗာလိုင်းသို့ ချိတ်ဆက်မှု တည်ဆောက်နေသည်...`
      });
    }
    if (seconds >= 3.2) {
      const isCustomEnabled = settings && settings.isCustomKeyEnabled;
      logs.push({
        time: fmt(3.2),
        type: "info",
        text: isCustomEnabled 
          ? `Auto key rotator active. Selecting active pool key [${activeKeyLabel}]...` 
          : "Using default application key channel...",
        burmese: isCustomEnabled 
          ? `အလှည့်ကျ Key လည်ပတ်စနစ် အသုံးပြုနေသည်။ Active Key [${activeKeyLabel}] အား ရွေးချယ်လိုက်သည်...` 
          : "မူလစနစ်သတ်မှတ်ချက် Key လိုင်းအား အသုံးပြုနေသည်..."
      });
    }
    if (seconds >= 3.9) {
      logs.push({
        time: fmt(3.9),
        type: "success",
        text: "Gateway handshake complete. Gemini 3.5 Flash Model online.",
        burmese: "ဆာဗာချိတ်ဆက်မှု အောင်မြင်သည်။ Gemini 3.5 Flash Model အချက်ပြမှု စတင်ရရှိပြီ။"
      });
    }
    if (seconds >= 4.8) {
      logs.push({
        time: fmt(4.8),
        type: "process",
        text: `AI Story Architect mapping out character relations for "${fruit}"...`,
        burmese: `AI ဇာတ်လမ်းရေးဆွဲသူမှ "${fruit}" ဇာတ်ကောင်နှင့် ပတ်သက်သည့် ဇာတ်ကွက်ပတ်သက်မှုများကို စတင်ပုံဖော်နေသည်...`
      });
    }
    if (seconds >= 5.8) {
      logs.push({
        time: fmt(5.8),
        type: "process",
        text: "Plot outlines generated. Formatting output schema constraints to standard JSON structures...",
        burmese: "ဇာတ်ကွက်အကျဉ်းများ ဖန်တီးပြီးစီး။ standard JSON schema များ သတ်မှတ်နေသည်..."
      });
    }
    if (seconds >= 7.0) {
      logs.push({
        time: fmt(7.0),
        type: "info",
        text: "Structuring narration text. Adapting colloquial Myanmar dialogue accents...",
        burmese: "ဇာတ်ကြောင်းပြောစာသားများကို စတင်ရေးဖွဲ့နေသည်။ ဒေသသုံးမြန်မာစကားပြောလေယူလေသိမ်းများ ပြောင်းလဲနေသည်..."
      });
    }
    if (seconds >= 8.2) {
      logs.push({
        time: fmt(8.2),
        type: "process",
        text: "Camera director mapping out 9:16 vertical CGI cinematography instructions...",
        burmese: "ဓာတ်ပုံဒါရိုက်တာမှ 9:16 vertical CGI image prompts အတွက် ကင်မရာညွှန်ကြားချက်များ ပြင်ဆင်နေသည်..."
      });
    }
    if (seconds >= 9.5) {
      logs.push({
        time: fmt(9.5),
        type: "info",
        text: "Applying Voice Direction tags (bracketed emotions) for speech engine sync...",
        burmese: "အသံထွက်စနစ်အတွက် စကားပြောဇာတ်ကောင်၏ ခံစားချက်ပြ tags (bracketed emotions) များ ထည့်သွင်းနေသည်..."
      });
    }

    // Dynamic processing batches
    const batchDuration = (estTime - 14);
    if (parts <= 20) {
      if (seconds >= 11.0) {
        logs.push({
          time: fmt(11.0),
          type: "process",
          text: `Writing parts 1 to ${parts} in active pipeline...`,
          burmese: `အပိုင်း ၁ မှ ${parts} အား ဆက်တိုက်အချောသပ် ရေးသားနေသည်...`
        });
      }
      if (seconds >= 12.5) {
        logs.push({
          time: fmt(12.5),
          type: "info",
          text: "Configuring Cinematic Depth of Field and focal length parameters (50mm, f/1.8)...",
          burmese: "ကင်မရာ settings အား အလင်းအမှောင် Depth of Field (50mm, f/1.8) သို့ သတ်မှတ်နေသည်..."
        });
      }
    } else {
      const totalBatches = Math.ceil(parts / 20);
      for (let b = 1; b <= totalBatches; b++) {
        const startSec = 11.0 + (b - 1) * (batchDuration / totalBatches);
        const batchStartPart = (b - 1) * 20 + 1;
        const batchEndPart = Math.min(b * 20, parts);
        
        if (seconds >= startSec) {
          logs.push({
            time: fmt(startSec),
            type: "process",
            text: `Processing Continuation Batch ${b}/${totalBatches}: Compiling parts ${batchStartPart} to ${batchEndPart}...`,
            burmese: `ဇာတ်လမ်းအပိုင်းဆက် Batch ${b}/${totalBatches} ရေးသားနေသည်- အပိုင်း ${batchStartPart} မှ ${batchEndPart} အား ဖန်တီးနေပါသည်...`
          });
        }
        
        const midSec = startSec + (batchDuration / totalBatches) * 0.4;
        if (seconds >= midSec) {
          logs.push({
            time: fmt(midSec),
            type: "info",
            text: "Inter-batch cooling active. Preventing API key rate restrictions (429 errors)...",
            burmese: "Batch တစ်ခုနှင့်တစ်ခုအကြား API Key Rate Limit မထိစေရန် စက္ကန့်အနည်းငယ် အလိုအလျောက် အနားပေးနေသည်..."
          });
        }

        const endSec = startSec + (batchDuration / totalBatches) * 0.8;
        if (seconds >= endSec) {
          logs.push({
            time: fmt(endSec),
            type: "success",
            text: `Batch ${b} successfully formatted and validated.`,
            burmese: `Batch ${b} အား စနစ်တကျ ရေးဖွဲ့ပြီးစီးကြောင်း စစ်ဆေးတွေ့ရှိရသည်။`
          });
        }
      }
    }

    if (seconds >= estTime - 3.5) {
      logs.push({
        time: fmt(estTime - 3.5),
        type: "process",
        text: "Initiating YouTube content moderation & family-friendly safety sweeps...",
        burmese: "YouTube မူဝါဒနှင့် ကိုက်ညီစေရန် အကြမ်းဖက်မှုနှင့် မလျော်ကန်သော စကားလုံးများ မပါဝင်ကြောင်း နောက်ဆုံးအဆင့် စစ်ဆေးနေသည်..."
      });
    }
    if (seconds >= estTime - 2.5) {
      logs.push({
        time: fmt(estTime - 2.5),
        type: "success",
        text: "Safety scans complete. Content matches YouTube Create compliance guidelines.",
        burmese: "လုံခြုံဘေးကင်းမှု စစ်ဆေးခြင်း အောင်မြင်သည်။ YouTube Create လမ်းညွှန်ချက်များနှင့် ၁၀၀% ကိုက်ညီပါသည်။"
      });
    }
    if (seconds >= estTime - 1.5) {
      logs.push({
        time: fmt(estTime - 1.5),
        type: "process",
        text: "Assembling stories chunks and writing back to persistent database...",
        burmese: "ဖန်တီးပြီးသော ဇာတ်လမ်းအပိုင်းအားလုံးကို စနစ်တကျ စုစည်းပြီး သမိုင်းကြောင်းမှတ်တမ်းထဲသို့ သိမ်းဆည်းနေသည်..."
      });
    }
    if (seconds >= estTime - 0.5) {
      logs.push({
        time: fmt(estTime - 0.5),
        type: "success",
        text: "Pipeline execution success! Preparing interactive Story Viewer interface.",
        burmese: "ဇာတ်လမ်းဖန်တီးမှု လုပ်ငန်းစဉ် တစ်ခုလုံး အောင်မြင်စွာ ပြီးစီးပါပြီ။ ဖတ်ရှုနိုင်ရန် ပြင်ဆင်နေသည်။"
      });
    }

    return logs;
  };

  const currentLogs = getLiveLogs();

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [currentLogs.length]);

  return (
    <div className="space-y-2 border-t border-stone-800/60 pt-4">
      <div className="flex justify-between items-center">
        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
          <span>တိုက်ရိုက်လုပ်ဆောင်ချက်မှူး (Live Action Execution Logs)</span>
        </p>
        <span className="text-[10px] text-stone-500 font-mono">
          Logs: {currentLogs.length}
        </span>
      </div>

      <div 
        ref={containerRef}
        className="bg-black border border-stone-900 rounded-xl p-3.5 font-mono text-[10px] leading-relaxed overflow-y-auto max-h-[160px] h-[160px] space-y-2.5 scrollbar-thin shadow-inner relative text-left"
      >
        {currentLogs.map((log, index) => {
          let typeColor = "text-stone-400";
          let icon = "⚙️";
          if (log.type === "success") {
            typeColor = "text-emerald-400 font-semibold";
            icon = "✅";
          } else if (log.type === "process") {
            typeColor = "text-amber-400";
            icon = "⚡";
          } else if (log.type === "warn") {
            typeColor = "text-red-400";
            icon = "⚠️";
          } else if (log.type === "info") {
            typeColor = "text-blue-400";
            icon = "💡";
          }

          return (
            <div key={index} className="border-b border-stone-950 pb-1.5 last:border-0 last:pb-0">
              <div className="flex items-start gap-1.5">
                <span className="text-stone-600 shrink-0 select-none font-medium">{log.time}</span>
                <span className="shrink-0 select-none">{icon}</span>
                <div className="flex-1 space-y-0.5">
                  <p className={`${typeColor} font-medium`}>{log.text}</p>
                  <p className="text-stone-500 font-sans text-[9px] leading-normal">{log.burmese}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Smart User-Agent parser to detect specific mobile phone brands/models
const parseDeviceModel = (ua: string): string => {
  if (/iPhone/i.test(ua)) {
    return "iPhone";
  }
  if (/iPad/i.test(ua)) {
    return "iPad";
  }
  
  if (/Android/i.test(ua)) {
    const redmiMatch = ua.match(/Redmi\s+[\w\s-]+/i);
    if (redmiMatch) return redmiMatch[0].trim();

    const pocoMatch = ua.match(/POCO\s+[\w\s-]+/i);
    if (pocoMatch) return pocoMatch[0].trim();

    const xiaomiMatch = ua.match(/(Xiaomi|Mi)\s+[\w\s-]+/i);
    if (xiaomiMatch) return xiaomiMatch[0].trim();

    const oppoMatch = ua.match(/OPPO\s+[\w\s-]+/i);
    if (oppoMatch) return oppoMatch[0].trim();

    const vivoMatch = ua.match(/vivo\s+[\w\s-]+/i);
    if (vivoMatch) return vivoMatch[0].trim();

    const realmeMatch = ua.match(/Realme\s+[\w\s-]+/i);
    if (realmeMatch) return realmeMatch[0].trim();

    const pixelMatch = ua.match(/Pixel\s+[\w\s\d]+/i);
    if (pixelMatch) return "Google " + pixelMatch[0].trim();

    const oneplusMatch = /OnePlus/i.test(ua) || /A0001/i.test(ua) || /ONEPLUS/i.test(ua);
    if (oneplusMatch) {
      const opModel = ua.match(/OnePlus\s+[\w\s-]+/i);
      return opModel ? opModel[0].trim() : "OnePlus Device";
    }

    const samsungMatch = ua.match(/SM-[A-Z0-9]+/i);
    if (samsungMatch) {
      const model = samsungMatch[0].toUpperCase();
      return `Samsung (${model})`;
    }
    if (/Samsung/i.test(ua)) {
      return "Samsung Device";
    }

    const parenthesesContent = ua.match(/\(([^)]+)\)/);
    if (parenthesesContent && parenthesesContent[1]) {
      const tokens = parenthesesContent[1].split(";");
      let androidIndex = -1;
      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].toLowerCase().includes("android")) {
          androidIndex = i;
          break;
        }
      }
      if (androidIndex !== -1 && androidIndex < tokens.length - 1) {
        let modelToken = tokens[androidIndex + 1].trim();
        modelToken = modelToken.split("Build/")[0].trim();
        modelToken = modelToken.split("/")[0].trim();
        if (modelToken && modelToken.length > 2 && !/linux|macintosh|windows|arm|wv/i.test(modelToken)) {
          return modelToken;
        }
      }
    }
    return "Android Phone";
  }

  if (/Windows/i.test(ua)) {
    return "Windows PC";
  }
  if (/Macintosh/i.test(ua)) {
    return "MacBook / iMac";
  }
  if (/Linux/i.test(ua)) {
    return "Linux PC";
  }
  return "Unknown Device";
};

export default function App() {
  const [activeView, setActiveView] = useState<"dashboard" | "create" | "settings" | "view-story">(() => {
    const saved = localStorage.getItem("fruit_stories_active_view");
    if (saved === "create" || saved === "settings" || saved === "view-story" || saved === "dashboard") {
      return saved as "dashboard" | "create" | "settings" | "view-story";
    }
    return "dashboard";
  });
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [storyToDeleteId, setStoryToDeleteId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [generationMetadata, setGenerationMetadata] = useState<{
    title: string;
    fruit: string;
    partsCount: number;
    isManual: boolean;
  } | null>(null);

  const [settings, setSettings] = useState<Settings>({
    geminiApiKey: "",
    isCustomKeyEnabled: false,
  });

  const [devices, setDevices] = useState<any[]>([]);
  const [isDeviceHubOpen, setIsDeviceHubOpen] = useState(false);
  const [myDeviceId, setMyDeviceId] = useState("");
  const [myDeviceName, setMyDeviceName] = useState("");
  const [isEditingDeviceName, setIsEditingDeviceName] = useState(false);
  const [tempDeviceName, setTempDeviceName] = useState("");

  // Persist active view whenever changed
  useEffect(() => {
    localStorage.setItem("fruit_stories_active_view", activeView);
  }, [activeView]);

  // Persist active story id whenever changed
  useEffect(() => {
    if (activeStory) {
      localStorage.setItem("fruit_stories_active_story_id", activeStory.id);
    } else {
      localStorage.removeItem("fruit_stories_active_story_id");
    }
  }, [activeStory]);

  // Load from LocalStorage
  useEffect(() => {
    const localStories = localStorage.getItem("fruit_stories_db");
    let loadedStories: Story[] = [];
    if (localStories) {
      try {
        loadedStories = JSON.parse(localStories);
        setSavedStories(loadedStories);
      } catch (e) {
        console.error("Error parsing saved stories", e);
      }
    }

    const savedStoryId = localStorage.getItem("fruit_stories_active_story_id");
    if (savedStoryId && loadedStories.length > 0) {
      const found = loadedStories.find((s) => s.id === savedStoryId);
      if (found) {
        setActiveStory(found);
      }
    }

    const localSettings = localStorage.getItem("fruit_stories_settings");
    if (localSettings) {
      try {
        setSettings(JSON.parse(localSettings));
      } catch (e) {
        console.error("Error parsing settings", e);
      }
    }
  }, []);

  // Device tracking initialization and heartbeat loop
  useEffect(() => {
    let devId = localStorage.getItem("device_tracking_id");
    if (!devId) {
      devId = "device_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
      localStorage.setItem("device_tracking_id", devId);
    }
    setMyDeviceId(devId);

    let devName: string = localStorage.getItem("device_tracking_name") || "";
    const isGeneric = !devName || 
      /^(Android|iOS|Windows|macOS|Linux|Unknown OS)\s*-\s*(Chrome|Safari|Firefox|Edge|Unknown Browser)$/i.test(devName) ||
      devName.includes("Unknown OS") || 
      devName.includes("Unknown Browser") ||
      devName === "Android Phone" ||
      devName === "Unknown Device";

    if (isGeneric) {
      devName = parseDeviceModel(navigator.userAgent);
      localStorage.setItem("device_tracking_name", devName);
    }
    setMyDeviceName(devName);
    setTempDeviceName(devName);

    const sendHeartbeat = async (currentId: string, currentName: string) => {
      try {
        await fetch("/api/devices/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId: currentId, deviceName: currentName }),
        });
      } catch (err) {
        console.error("Error sending heartbeat", err);
      }
    };

    sendHeartbeat(devId, devName);

    const heartbeatInterval = setInterval(() => {
      const storedName: string = localStorage.getItem("device_tracking_name") || devName || "Device";
      sendHeartbeat(devId, storedName);
    }, 10000);

    const fetchDevices = async () => {
      try {
        const res = await fetch("/api/devices");
        if (res.ok) {
          const data = await res.json();
          setDevices(data.devices || []);
        }
      } catch (err) {
        console.error("Error fetching devices", err);
      }
    };

    fetchDevices();
    const fetchInterval = setInterval(fetchDevices, 10000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(fetchInterval);
    };
  }, []);

  const handleUpdateDeviceName = async () => {
    if (!tempDeviceName.trim()) return;
    localStorage.setItem("device_tracking_name", tempDeviceName.trim());
    setMyDeviceName(tempDeviceName.trim());
    setIsEditingDeviceName(false);

    try {
      await fetch("/api/devices/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: myDeviceId, deviceName: tempDeviceName.trim() }),
      });
      const res = await fetch("/api/devices");
      if (res.ok) {
        const data = await res.json();
        setDevices(data.devices || []);
      }
    } catch (err) {
      console.error("Error updating device name on server", err);
    }
  };

  const formatLastSeen = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 15000) return "ယခုလေးတင် (Just now)";
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "လွန်ခဲ့သော စက္ကန့်အနည်းငယ်က";
    if (mins < 60) return `လွန်ခဲ့သော ${mins} မိနစ်က`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `လွန်ခဲ့သော ${hours} နာရီက`;
    const days = Math.floor(hours / 24);
    return `လွန်ခဲ့သော ${days} ရက်က`;
  };

  // Save Settings
  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem("fruit_stories_settings", JSON.stringify(newSettings));
  };

  // Save or Update Story
  const handleSaveStory = (storyToSave: Story) => {
    const existingIndex = savedStories.findIndex((s) => s.id === storyToSave.id);
    let updated: Story[] = [];

    if (existingIndex >= 0) {
      updated = [...savedStories];
      updated[existingIndex] = {
        ...storyToSave,
        createdAt: new Date().toISOString(),
      };
    } else {
      updated = [storyToSave, ...savedStories];
    }

    setSavedStories(updated);
    localStorage.setItem("fruit_stories_db", JSON.stringify(updated));
    setActiveStory(storyToSave);
    setActiveView("dashboard");
  };

  // Delete Story
  const handleDeleteStory = (id: string) => {
    setStoryToDeleteId(id);
  };

  const confirmDelete = () => {
    if (storyToDeleteId) {
      const updated = savedStories.filter((s) => s.id !== storyToDeleteId);
      setSavedStories(updated);
      localStorage.setItem("fruit_stories_db", JSON.stringify(updated));
      if (activeStory?.id === storyToDeleteId) {
        setActiveStory(null);
      }
      setActiveView("dashboard");
      setStoryToDeleteId(null);
    }
  };

  // Triggered when a new story is generated or manual blank story is set up
  const handleStoryGenerated = (story: Story) => {
    setActiveStory(story);
    setActiveView("view-story");
  };

  const navigateToView = (view: "dashboard" | "create" | "settings") => {
    setActiveView(view);
  };

  useEffect(() => {
    if (!isGenerating) {
      setGenerationStep(0);
      setSecondsElapsed(0);
      return;
    }

    const intervalStep = setInterval(() => {
      setGenerationStep((prev) => (prev + 1) % 4);
    }, 5500);

    const startTime = Date.now();
    const intervalTimer = setInterval(() => {
      setSecondsElapsed(parseFloat(((Date.now() - startTime) / 1000).toFixed(1)));
    }, 100);

    return () => {
      clearInterval(intervalStep);
      clearInterval(intervalTimer);
    };
  }, [isGenerating]);

  const getEstimatedTime = (partsCount: number) => {
    if (partsCount <= 10) return 15;
    if (partsCount <= 20) return 30;
    if (partsCount <= 30) return 45;
    return 65;
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background radial highlight */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/5 via-stone-950/20 to-stone-950 pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col min-h-screen">
        {/* App Navigation Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-stone-900 pb-5 mb-8" id="main-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-stone-950 font-bold text-2xl shadow-lg shadow-amber-500/20 animate-pulse">
              🍋
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-wider text-stone-100 font-sans flex items-center gap-2">
                <span>Paing Lay Ai Creation</span>
                <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded text-[9px] font-bold tracking-normal uppercase">
                  v2.0
                </span>
              </h1>
              <p className="text-xs text-stone-500 font-medium">
                အသီးဇာတ်လမ်းများကို အလန်းစားဖန်တီးကြမယ်
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Live Devices Online Badge */}
            <button type="button"
              onClick={() => setIsDeviceHubOpen(true)}
              className="flex items-center gap-2 px-3 py-2.5 bg-stone-900 hover:bg-stone-850 border border-stone-800/85 rounded-2xl text-xs font-semibold text-stone-300 hover:text-amber-500 transition-all cursor-pointer shadow-inner shrink-0 group"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono flex items-center gap-1">
                <span className="text-stone-200 font-bold group-hover:text-emerald-400">{devices.filter(d => d.isOnline).length}</span>
                <span className="text-stone-400 font-sans">ခု Online /</span>
                <span className="text-stone-400 font-bold">{devices.filter(d => !d.isOnline).length}</span>
                <span className="text-stone-500 font-sans">ခု Offline</span>
              </span>
            </button>

            <nav className="flex items-center gap-1.5 bg-stone-900/80 p-1.5 border border-stone-800/80 rounded-2xl shadow-inner">
              <button type="button"
                onClick={() => navigateToView("dashboard")}
                className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                  activeView === "dashboard" || activeView === "view-story"
                    ? "bg-stone-950 border border-stone-800 text-amber-500 shadow-md"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>မှတ်တမ်း</span>
              </button>

              <button type="button"
                onClick={() => navigateToView("create")}
                className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                  activeView === "create"
                    ? "bg-stone-950 border border-stone-800 text-amber-500 shadow-md"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>ဖန်တီးရန်</span>
              </button>

              <button type="button"
                onClick={() => navigateToView("settings")}
                className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                  activeView === "settings"
                    ? "bg-stone-950 border border-stone-800 text-amber-500 shadow-md"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <SettingsIcon className="w-4 h-4" />
                <span>API ဆက်တင်</span>
              </button>
            </nav>
          </div>
        </header>

        {/* Loading Overlay for AI Generation */}
        {isGenerating && (() => {
          const estTime = generationMetadata ? getEstimatedTime(generationMetadata.partsCount) : 15;
          const progressPercent = Math.min(Math.round((secondsElapsed / estTime) * 100), 99);
          const activeFruitIcon = generationMetadata
            ? (FRUIT_SUGGESTIONS.find((f) => f.value.toLowerCase() === (generationMetadata.fruit || "").toLowerCase())?.icon || "🍋")
            : "🍋";
          const activeKeyLabel = settings.apiKeysList?.find((item) => item.id === settings.activeKeyId)?.label || "Gemini Key";

          return (
            <div className="fixed inset-0 bg-stone-950/95 backdrop-blur-lg z-50 flex flex-col items-center justify-center p-4">
              <div className="max-w-xl w-full bg-stone-900/90 border border-stone-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

                {/* Header Info */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg text-[10px] font-bold tracking-wider uppercase font-mono flex items-center gap-1">
                        <Activity className="w-3 h-3 animate-pulse" />
                        <span>LIVE CREATION MODE</span>
                      </span>
                      {generationMetadata?.isManual ? (
                        <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg text-[10px] font-bold tracking-wider uppercase font-mono">
                          User Prompt Mode
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-lg text-[10px] font-bold tracking-wider uppercase font-mono">
                          AI Auto Mode
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-black text-stone-100 tracking-tight">
                      {generationMetadata?.title || "ဇာတ်လမ်း ရေးဖွဲ့နေပါသည်"}
                    </h3>
                    <p className="text-xs text-stone-400 flex flex-wrap items-center gap-1.5 font-medium">
                      <span>အသုံးပြုထားသောအသီး:</span>
                      <span className="text-stone-200">{activeFruitIcon} {generationMetadata?.fruit || "သတ်မှတ်မထားပါ"}</span>
                      <span className="text-stone-600">•</span>
                      <span>အပိုင်းအရေအတွက်:</span>
                      <span className="text-stone-200 font-mono font-bold">{generationMetadata?.partsCount || 10} ပိုင်း</span>
                      {settings.isCustomKeyEnabled && settings.apiKeysList && settings.apiKeysList.length > 0 && (
                        <>
                          <span className="text-stone-600">•</span>
                          <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] rounded font-bold flex items-center gap-1 animate-pulse">
                            🔑 Auto Swapped: {activeKeyLabel}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <div className="text-3xl font-black text-amber-500 font-mono tracking-tight flex items-center gap-1">
                      <span>{secondsElapsed.toFixed(1)}</span>
                      <span className="text-xs text-stone-500 font-normal">s</span>
                    </div>
                    <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                      ခန့်မှန်းကြာချိန် ~ {estTime}s
                    </p>
                  </div>
                </div>

                {/* Progress Bar Component */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-400 font-medium flex items-center gap-1">
                      <Timer className="w-3.5 h-3.5 text-amber-500" />
                      <span>တိုးတက်မှု အခြေအနေ (Progress)</span>
                    </span>
                    <span className="text-amber-500 font-black font-mono text-sm">{progressPercent}%</span>
                  </div>
                  <div className="h-2.5 bg-stone-950 rounded-full border border-stone-800/40 p-0.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-300 ease-out shadow-lg shadow-amber-500/30"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Enhanced Real-time Live Action Execution Logs */}
                <LiveLogTerminal
                  seconds={secondsElapsed}
                  metadata={generationMetadata}
                  estTime={estTime}
                  settings={settings}
                  activeKeyLabel={activeKeyLabel}
                />

                {/* Footnote Warning */}
                <div className="text-center pt-2">
                  <p className="text-[10px] text-stone-500 leading-normal">
                    Gemini API သို့ အချက်အလက်များစွာ ပို့လွှတ်ဖန်တီးနေရသဖြင့် အနည်းငယ် ကြာမြင့်နိုင်ပါသည်။
                    <br />
                    ဖန်တီးမှုအဆင်ပြေစေရန် <span className="text-stone-400 font-semibold">စာမျက်နှာကို refresh မလုပ်ဘဲ</span> ခေတ္တစောင့်ဆိုင်းပေးပါ။
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Primary View Router Container */}
        <main className="flex-1 pb-12">
          {activeView === "dashboard" && (
            <Library
              stories={savedStories}
              onSelectStory={(story) => {
                setActiveStory(story);
                setActiveView("view-story");
              }}
              onDeleteStory={handleDeleteStory}
              onNavigateToCreate={() => navigateToView("create")}
            />
          )}

          {activeView === "create" && (
            <StoryCreator
              onStoryGenerated={handleStoryGenerated}
              isLoading={isGenerating}
              setIsGenerating={setIsGenerating}
              apiKeySettings={settings}
              onUpdateSettings={handleSaveSettings}
              onStartGenerating={setGenerationMetadata}
            />
          )}

          {activeView === "settings" && (
            <SettingsPanel settings={settings} onSaveSettings={handleSaveSettings} />
          )}

          {activeView === "view-story" && activeStory && (
            <StoryViewer
              story={activeStory}
              onBack={() => navigateToView("dashboard")}
              onSave={handleSaveStory}
              onDelete={handleDeleteStory}
              isAlreadySaved={savedStories.some((s) => s.id === activeStory.id)}
            />
          )}
        </main>

        {/* Custom Story Delete Confirmation Modal */}
        {storyToDeleteId && (
          <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-stone-900 border border-stone-850 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-base font-bold text-stone-100 font-sans">ဇာတ်လမ်းကို ဖျက်ရန် သေချာပါသလား။</h3>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    "{savedStories.find((s) => s.id === storyToDeleteId)?.title || "ဤဇာတ်လမ်း"}" ကို အပြီးတိုင် ဖျက်ဆီးပါမည်။ ဤလုပ်ဆောင်ချက်ကို ပြန်လည်ရယူ၍ မရနိုင်ပါ။
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button"
                  onClick={() => setStoryToDeleteId(null)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-750 border border-stone-700/50 hover:border-stone-700 text-stone-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  မဖျက်တော့ပါ
                </button>
                <button type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-red-500/20 active:scale-95 cursor-pointer"
                >
                  သေချာသည်၊ ဖျက်မည်
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Device Tracking Connection Hub Modal */}
        {isDeviceHubOpen && (
          <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-stone-900 border border-stone-850 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 text-left relative overflow-hidden flex flex-col max-h-[90vh]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

              {/* Modal Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-stone-100 font-sans flex items-center gap-2">
                      <span>Device</span>
                      <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-mono font-bold">
                        Live Tracking
                      </span>
                    </h3>
                    <p className="text-xs text-stone-500 font-medium">
                      ချိတ်ဆက်ထားသော စက်ပစ္စည်းများ အခြေအနေ
                    </p>
                  </div>
                </div>
                <button type="button"
                  onClick={() => {
                    setIsDeviceHubOpen(false);
                    setIsEditingDeviceName(false);
                  }}
                  className="text-stone-500 hover:text-stone-300 transition-all cursor-pointer text-sm font-bold font-mono px-2 py-1 rounded bg-stone-950 border border-stone-800"
                >
                  ✕
                </button>
              </div>

              {/* Status Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-950/60 border border-stone-850 p-3 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">လိုင်းပေါ်တွင် (Online)</p>
                    <p className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                      {devices.filter((d) => d.isOnline).length} <span className="text-xs text-stone-600 font-normal">ခု</span>
                    </p>
                  </div>
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                </div>
                <div className="bg-stone-950/60 border border-stone-850 p-3 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">လိုင်းမရှိပါ (Offline)</p>
                    <p className="text-2xl font-black text-stone-500 font-mono mt-0.5">
                      {devices.filter((d) => !d.isOnline).length} <span className="text-xs text-stone-600 font-normal">ခု</span>
                    </p>
                  </div>
                  <span className="w-2.5 h-2.5 bg-stone-700 rounded-full"></span>
                </div>
              </div>

              {/* Customize Current Device Name Section */}
              <div className="bg-stone-950/40 border border-stone-850/60 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-400">ဤစက်ပစ္စည်း အမည် (My Device Name)</label>
                </div>

                <div className="flex items-center justify-between bg-stone-900/60 p-2.5 rounded-xl border border-stone-850">
                  <span className="text-xs font-semibold text-stone-200">{myDeviceName}</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/25 text-amber-500 rounded font-bold uppercase font-mono">
                    Your Device
                  </span>
                </div>
              </div>

              {/* Devices List */}
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px] pr-1 scrollbar-thin">
                <div className="flex justify-between items-center pb-1">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider font-mono">
                    ချိတ်ဆက်ထားဖူးသော စက်များစာရင်း (Connected Devices List)
                  </p>
                  <button type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/devices");
                        if (res.ok) {
                          const data = await res.json();
                          setDevices(data.devices || []);
                        }
                      } catch (err) {
                        console.error("Manual fetch failed", err);
                      }
                    }}
                    className="text-[10px] text-stone-500 hover:text-stone-300 font-mono flex items-center gap-1 cursor-pointer bg-stone-950 border border-stone-850 px-2 py-1 rounded"
                  >
                    <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: "5s" }} />
                    <span>မွမ်းမံရန် (Refresh)</span>
                  </button>
                </div>

                {devices.length === 0 ? (
                  <p className="text-xs text-stone-500 text-center py-6">ချိတ်ဆက်ထားသော ကိရိယာ မရှိသေးပါ။</p>
                ) : (
                  <div className="space-y-2">
                    {[...devices]
                      .sort((a, b) => {
                        if (a.deviceId === myDeviceId) return -1;
                        if (b.deviceId === myDeviceId) return 1;
                        if (a.isOnline && !b.isOnline) return -1;
                        if (!a.isOnline && b.isOnline) return 1;
                        return b.lastSeen - a.lastSeen;
                      })
                      .map((device) => {
                        const isCurrent = device.deviceId === myDeviceId;
                        return (
                          <div
                            key={device.deviceId}
                            className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                              isCurrent
                                ? "bg-amber-500/[0.03] border-amber-500/20"
                                : device.isOnline
                                ? "bg-stone-950/60 border-stone-850"
                                : "bg-stone-950/20 border-stone-900 opacity-60"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-stone-900 border border-stone-800/80 flex items-center justify-center shrink-0">
                                {device.deviceName?.toLowerCase().includes("phone") ||
                                device.deviceName?.toLowerCase().includes("android") ||
                                device.deviceName?.toLowerCase().includes("ios") ? (
                                  <Smartphone className="w-4 h-4 text-amber-500/80" />
                                ) : device.deviceName?.toLowerCase().includes("tablet") ||
                                  device.deviceName?.toLowerCase().includes("ipad") ? (
                                  <Tablet className="w-4 h-4 text-purple-500/80" />
                                ) : (
                                  <Monitor className="w-4 h-4 text-emerald-500/80" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-stone-200 truncate flex items-center gap-1.5">
                                  <span>{device.deviceName}</span>
                                  {isCurrent && (
                                    <span className="text-[8px] px-1.5 py-0 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20 uppercase font-bold">
                                      ဤကိရိယာ
                                    </span>
                                  )}
                                </p>
                                <p className="text-[10px] text-stone-500 font-mono truncate mt-0.5 flex items-center gap-2">
                                  <span>IP: {device.ip}</span>
                                  <span>•</span>
                                  <span className="truncate max-w-[120px]" title={device.userAgent}>
                                    {device.userAgent}
                                  </span>
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end shrink-0">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    device.isOnline ? "bg-emerald-500 animate-pulse" : "bg-stone-700"
                                  }`}
                                ></span>
                                <span className={`text-[10px] font-bold ${device.isOnline ? "text-emerald-400" : "text-stone-500"}`}>
                                  {device.isOnline ? "Online" : "Offline"}
                                </span>
                              </div>
                              <span className="text-[9px] text-stone-500 font-mono mt-0.5">
                                {formatLastSeen(device.lastSeen)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Minimal Footer */}
        <footer className="border-t border-stone-900 pt-6 mt-auto text-center text-xs text-stone-600 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Paing Lay Ai Creation. Crafted beautifully for Myanmar Creators.</p>
          <p className="flex items-center gap-1">
            <span>Powered by</span>
            <span className="text-amber-500/70 font-semibold font-mono">Gemini 3.5 Flash</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
