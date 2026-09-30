import React, { useState, useEffect } from "react";
import { Story, StoryPart, PREDEFINED_GENRES, FRUIT_SUGGESTIONS, DialogueLanguage, SUPPORTED_LANGUAGES, SoundEffect, AppSettings } from "../types";
import { ArrowLeft, Save, Copy, Check, Edit3, Trash2, ArrowRight, Play, Pause, ChevronLeft, ChevronRight, Image as ImageIcon, MessageSquare, Globe, Loader2, Volume2, Music, Sparkles } from "lucide-react";
import SoundEffectBoard from "./SoundEffectBoard";
import { playSound, detectSoundEffectType } from "../utils/soundEffects";

export interface StoryViewerProps {
  story: Story;
  onBack?: () => void;
  onExit?: () => void;
  onSave?: (story: Story) => void;
  isAlreadySaved?: boolean;
  onDelete?: (id: string) => void;
  soundEffects?: SoundEffect[];
  settings?: AppSettings;
  onUpdateSettings?: (settings: AppSettings) => void;
}

export interface SpeakerLine {
  voiceTag: string;
  speaker: string;
  gender: "male" | "female" | "dual" | "neutral";
  emotion: string;
  tone?: string;
  soundFx?: string;
  dialogue: string;
}

export interface ParsedNarration {
  raw: string;
  isMultiSpeaker: boolean;
  lines: SpeakerLine[];
  cleanDialogue: string;
  singleVoiceTag?: string | null;
  singleSpeaker?: string | null;
  singleEmotion?: string | null;
  singleSoundFx?: string | null;
  singleTone?: string | null;
  voiceTag?: string | null;
  speaker?: string | null;
  emotion?: string | null;
  soundFx?: string | null;
  tone?: string | null;
}

export function parseNarration(narration: string): ParsedNarration {
  if (!narration) {
    return { raw: "", isMultiSpeaker: false, lines: [], cleanDialogue: "", voiceTag: null, speaker: null, emotion: null };
  }

  const raw = narration.trim();
  const regex = /\[([^\]]+)\]\s*([\s\S]*?)(?=\s*\[[^\]]+\]|$)/g;
  const matches = [...raw.matchAll(regex)];

  if (matches.length > 0) {
    const lines: SpeakerLine[] = [];

    for (const match of matches) {
      const tagText = match[1].trim();
      const dialogueText = match[2].trim();
      const tagLower = tagText.toLowerCase();

      let gender: "male" | "female" | "dual" | "neutral" = "neutral";
      if (
        tagLower.includes("overlapping") ||
        tagLower.includes("simultaneous") ||
        tagLower.includes("duet") ||
        tagLower.includes("both") ||
        tagLower.includes("duo") ||
        tagLower.includes("ပြိုင်တူ") ||
        tagLower.includes("နှစ်ယောက်")
      ) {
        gender = "dual";
      } else if (
        tagLower.includes("female") ||
        tagLower.includes("woman") ||
        tagLower.includes("girl") ||
        tagLower.includes("မိန်းမ") ||
        tagLower.includes("မမ") ||
        tagLower.includes("ဆရာမ")
      ) {
        gender = "female";
      } else if (
        tagLower.includes("male") ||
        tagLower.includes("man") ||
        tagLower.includes("boy") ||
        tagLower.includes("ယောက်ကျား") ||
        tagLower.includes("ကိုကို") ||
        tagLower.includes("ဆရာ")
      ) {
        gender = "male";
      }

      let speaker = "Character";
      let emotion = tagText;
      let tone: string | undefined = undefined;
      let soundFx: string | undefined = undefined;

      if (tagText.includes("|")) {
        const segments = tagText.split("|").map((s) => s.trim());
        for (const seg of segments) {
          const segLower = seg.toLowerCase();
          if (segLower.startsWith("voice:") || segLower.startsWith("voice :") || segLower.startsWith("speaker:") || segLower.startsWith("character voice:")) {
            const val = seg.replace(/^[^:]+:/i, "").trim();
            if (val.toLowerCase().includes("by ")) {
              const byParts = val.split(/by\s+/i);
              speaker = byParts[1]?.trim() || byParts[0]?.trim();
            } else {
              speaker = val;
            }
          } else if (segLower.startsWith("tone:") || segLower.startsWith("tone :")) {
            tone = seg.replace(/^[^:]+:/i, "").trim();
          } else if (segLower.startsWith("emotion:") || segLower.startsWith("emotion :") || segLower.startsWith("mood:") || segLower.startsWith("mood :")) {
            emotion = seg.replace(/^[^:]+:/i, "").trim();
          } else if (segLower.startsWith("sound fx:") || segLower.startsWith("sound fx :") || segLower.startsWith("sound:") || segLower.startsWith("sfx:") || segLower.startsWith("sound effects:") || segLower.startsWith("audio:")) {
            soundFx = seg.replace(/^[^:]+:/i, "").trim();
          } else if (segLower.startsWith("singing style:") || segLower.startsWith("style:")) {
            tone = seg.replace(/^[^:]+:/i, "").trim();
          }
        }
      } else {
        const voiceByParts = tagLower.split("voice by");
        if (voiceByParts.length === 2) {
          emotion = voiceByParts[0].trim();
          speaker = voiceByParts[1].trim();
        } else {
          const byParts = tagLower.split("by");
          if (byParts.length === 2) {
            emotion = byParts[0].trim();
            speaker = byParts[1].trim();
          }
        }
      }

      if (speaker && speaker !== "Character") {
        speaker = speaker
          .split(/[\s_]+/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
      }

      lines.push({
        voiceTag: tagText,
        speaker,
        gender,
        emotion,
        tone,
        soundFx,
        dialogue: dialogueText,
      });
    }

    const cleanDialogue = lines.map((l) => l.dialogue).join(" ");
    const isMultiSpeaker = lines.length > 1 || lines.some((l) => l.gender === "dual");

    return {
      raw,
      isMultiSpeaker,
      lines,
      cleanDialogue,
      singleVoiceTag: lines[0]?.voiceTag,
      singleSpeaker: lines[0]?.speaker,
      singleEmotion: lines[0]?.emotion,
      singleSoundFx: lines[0]?.soundFx,
      singleTone: lines[0]?.tone,
      voiceTag: lines[0]?.voiceTag,
      speaker: lines[0]?.speaker,
      emotion: lines[0]?.emotion,
      soundFx: lines[0]?.soundFx,
      tone: lines[0]?.tone,
    };
  }

  return {
    raw,
    isMultiSpeaker: false,
    lines: [
      {
        voiceTag: "narration",
        speaker: "Narrator",
        gender: "neutral",
        emotion: "storytelling",
        dialogue: raw,
      },
    ],
    cleanDialogue: raw,
    voiceTag: null,
    speaker: "Narrator",
    emotion: "storytelling",
  };
}

const copyToClipboard = (text: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => resolve(true))
        .catch(() => resolve(fallbackCopyToClipboard(text)));
    } else {
      resolve(fallbackCopyToClipboard(text));
    }
  });
};

const fallbackCopyToClipboard = (text: string): boolean => {
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
};

export default function StoryViewer({
  story,
  onBack: propOnBack,
  onExit,
  onSave,
  isAlreadySaved = false,
  onDelete,
}: StoryViewerProps) {
  const onBack = propOnBack || onExit || (() => {});

  const initialParts: StoryPart[] =
    story.parts && story.parts.length > 0
      ? story.parts
      : story.segments && story.segments.length > 0
      ? story.segments.map((seg) => ({
          partNumber: seg.segmentIndex,
          imagePrompt: seg.imagePrompt,
          narrationBurmese: seg.dialogueBurmese,
          narrationEnglish: seg.dialogueEnglish || "",
          cameraRotation: seg.cameraAngle || "",
          cameraSettings: seg.actionDescription || "",
        }))
      : Object.values(story.scenes || {}).map((sc, idx) => ({
          partNumber: idx + 1,
          imagePrompt: sc.imagePrompt || "",
          narrationBurmese: sc.contentBurmese || sc.content,
          narrationEnglish: sc.content || "",
          cameraRotation: "Slow camera pan",
          cameraSettings: "Cinematic 50mm",
        }));

  const [editedStory, setEditedStory] = useState<Story>({
    ...story,
    parts: initialParts.length > 0 ? initialParts : [{ partNumber: 1, imagePrompt: "", narrationBurmese: "" }],
    fruit: story.fruit || "Apple",
    description: story.description || story.synopsis || "",
  });

  const [activePartIndex, setActivePartIndex] = useState<number>(0);
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null);
  const [copiedPrompt2Index, setCopiedPrompt2Index] = useState<number | null>(null);
  const [copiedScriptIndex, setCopiedScriptIndex] = useState<number | null>(null);
  
  const [isSoundBoardOpen, setIsSoundBoardOpen] = useState(false);
  const [playingAudioPartIndex, setPlayingAudioPartIndex] = useState<number | null>(null);
  
  const [selectedLanguage, setSelectedLanguage] = useState<DialogueLanguage>(story.dialogueLanguage || "burmese");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleAudioPlayback = (index: number, part: StoryPart) => {
    if (typeof window === "undefined") return;

    if (playingAudioPartIndex === index) {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setPlayingAudioPartIndex(null);
      return;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const narration = getDisplayNarration(part);
    const parsed = parseNarration(narration);
    
    const emotionContext = `${parsed.emotion || ""} ${parsed.soundFx || ""} ${parsed.cleanDialogue || ""}`;
    const sfxType = detectSoundEffectType(emotionContext);
    playSound(sfxType, 0.6);

    if ("speechSynthesis" in window && parsed.cleanDialogue) {
      const utterance = new SpeechSynthesisUtterance(parsed.cleanDialogue);
      if (selectedLanguage === "english") {
        utterance.lang = "en-US";
      } else if (selectedLanguage === "japanese") {
        utterance.lang = "ja-JP";
      } else {
        utterance.lang = "my-MM";
      }
      utterance.rate = 0.95;
      utterance.pitch = parsed.lines[0]?.gender === "female" ? 1.2 : parsed.lines[0]?.gender === "male" ? 0.9 : 1.0;

      utterance.onend = () => {
        setPlayingAudioPartIndex((prev) => (prev === index ? null : prev));
      };
      utterance.onerror = () => {
        setPlayingAudioPartIndex((prev) => (prev === index ? null : prev));
      };

      setPlayingAudioPartIndex(index);
      window.speechSynthesis.speak(utterance);
    } else {
      setPlayingAudioPartIndex(index);
      setTimeout(() => {
        setPlayingAudioPartIndex((prev) => (prev === index ? null : prev));
      }, 2500);
    }
  };

  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [metaTitle, setMetaTitle] = useState(editedStory.title);
  const [metaDescription, setMetaDescription] = useState(editedStory.description || "");

  const [editingPartIndex, setEditingPartIndex] = useState<number | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [editPrompt2, setEditPrompt2] = useState("");
  const [editNarration, setEditNarration] = useState("");
  const [editCameraRotation, setEditCameraRotation] = useState("");
  const [editCameraSettings, setEditCameraSettings] = useState("");

  const activePart = editedStory.parts?.[activePartIndex] || editedStory.parts?.[0] || null;

  const getPartNarration = (part: StoryPart | null | undefined, lang: DialogueLanguage = selectedLanguage): string => {
    if (!part) return "";
    if (lang === "english") {
      return part.narrationEnglish || (editedStory.dialogueLanguage === "english" ? part.narrationBurmese : part.narrationEnglish || "");
    }
    if (lang === "japanese") {
      return part.narrationJapanese || (editedStory.dialogueLanguage === "japanese" ? part.narrationBurmese : part.narrationJapanese || "");
    }
    return part.narrationBurmese || "";
  };

  const getDisplayNarration = (part: StoryPart | null | undefined): string => {
    if (!part) return "";
    const specific = getPartNarration(part, selectedLanguage);
    if (specific && specific.trim()) return specific;
    return part.narrationBurmese || part.narrationEnglish || part.narrationJapanese || "";
  };

  const fetchTranslationInBackground = async (targetLang: DialogueLanguage) => {
    if (targetLang === "burmese" || !editedStory.parts) return;
    
    const missingParts = editedStory.parts.filter((p) => {
      if (targetLang === "english") return !p.narrationEnglish || !p.narrationEnglish.trim();
      if (targetLang === "japanese") return !p.narrationJapanese || !p.narrationJapanese.trim();
      return false;
    });

    if (missingParts.length === 0) return;

    setIsTranslating(true);
    try {
      const response = await fetch("/api/translate-story-dialogues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parts: editedStory.parts,
          targetLanguage: targetLang,
          storyTitle: editedStory.title,
        })
      });

      if (!response.ok) return;

      const data = await response.json();
      const translatedPartsMap = new Map<number, string>();
      (data.translatedParts || []).forEach((tp: { partNumber: number; narration: string }) => {
        translatedPartsMap.set(tp.partNumber, tp.narration);
      });

      setEditedStory((prev) => {
        const updatedParts = (prev.parts || []).map((p) => {
          const trans = translatedPartsMap.get(p.partNumber) || "";
          if (targetLang === "english") {
            return { ...p, narrationEnglish: trans || p.narrationEnglish || p.narrationBurmese };
          }
          if (targetLang === "japanese") {
            return { ...p, narrationJapanese: trans || p.narrationJapanese || p.narrationBurmese };
          }
          return { ...p, narrationBurmese: trans || p.narrationBurmese };
        });

        const updated: Story = { ...prev, parts: updatedParts };
        if (onSave) onSave(updated);
        return updated;
      });
    } catch {
      // Non-fatal
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwitchLanguage = (newLang: DialogueLanguage) => {
    if (newLang === selectedLanguage && !translationError) return;
    setTranslationError(null);
    setSelectedLanguage(newLang);
    setEditedStory((prev) => ({ ...prev, dialogueLanguage: newLang }));

    const hasAll = (editedStory.parts || []).every((p) => {
      if (newLang === "english") return !!p.narrationEnglish && !!p.narrationEnglish.trim();
      if (newLang === "japanese") return !!p.narrationJapanese && !!p.narrationJapanese.trim();
      return !!p.narrationBurmese;
    });

    if (!hasAll) {
      fetchTranslationInBackground(newLang);
    }
  };

  const handleCopyPrompt = async (text: string, index: number) => {
    await copyToClipboard(text);
    setCopiedPromptIndex(index);
    setTimeout(() => setCopiedPromptIndex(null), 2000);
  };

  const handleCopyPrompt2 = async (text: string, index: number) => {
    await copyToClipboard(text);
    setCopiedPrompt2Index(index);
    setTimeout(() => setCopiedPrompt2Index(null), 2000);
  };

  const handleCopyScript = async (part: any, index: number) => {
    let combinedText = getDisplayNarration(part) || "";
    if (part.cameraRotation || part.cameraSettings) {
      combinedText += "\n\n";
      if (part.cameraRotation) combinedText += `[Camera Rotation]\n${part.cameraRotation}`;
      if (part.cameraSettings) combinedText += `\n[Camera Settings]\n${part.cameraSettings}`;
    }
    await copyToClipboard(combinedText.trim());
    setCopiedScriptIndex(index);
    setTimeout(() => setCopiedScriptIndex(null), 2000);
  };

  const startEditPart = (index: number) => {
    const part = (editedStory.parts || [])[index];
    if (!part) return;
    setEditingPartIndex(index);
    setEditPrompt(part.imagePrompt);
    setEditPrompt2(part.imagePrompt2 || "");
    setEditNarration(getDisplayNarration(part));
    setEditCameraRotation(part.cameraRotation || "");
    setEditCameraSettings(part.cameraSettings || "");
  };

  const savePartEdit = (index: number) => {
    const updatedParts = [...(editedStory.parts || [])];
    const currentPart = updatedParts[index];
    if (!currentPart) return;
    
    const updatedPart: StoryPart = {
      ...currentPart,
      imagePrompt: editPrompt.trim(),
      imagePrompt2: editPrompt2.trim(),
      cameraRotation: editCameraRotation.trim(),
      cameraSettings: editCameraSettings.trim(),
      narrationBurmese: selectedLanguage === "burmese" ? editNarration.trim() : currentPart.narrationBurmese,
      narrationEnglish: selectedLanguage === "english" ? editNarration.trim() : currentPart.narrationEnglish,
      narrationJapanese: selectedLanguage === "japanese" ? editNarration.trim() : currentPart.narrationJapanese,
    };

    updatedParts[index] = updatedPart;
    const updatedStory = { ...editedStory, parts: updatedParts };
    setEditedStory(updatedStory);
    setEditingPartIndex(null);
  };

  const handleSaveMetadata = () => {
    setEditedStory({
      ...editedStory,
      title: metaTitle.trim(),
      description: metaDescription.trim(),
    });
    setIsEditingMetadata(false);
  };

  const getFruitColorGradient = (fruitName: string) => {
    const name = (fruitName || "").toLowerCase();
    if (name.includes("apple") || name.includes("ပန်းသီး")) return "from-red-600/30 via-stone-900 to-black";
    if (name.includes("watermelon") || name.includes("ဖရဲသီး")) return "from-emerald-600/30 via-stone-900 to-black";
    if (name.includes("strawberry") || name.includes("စတော်ဘယ်ရီ")) return "from-pink-600/30 via-stone-900 to-black";
    if (name.includes("mango") || name.includes("သရက်သီး") || name.includes("orange") || name.includes("လိမ္မော်")) return "from-amber-600/30 via-stone-900 to-black";
    if (name.includes("banana") || name.includes("ငှက်ပျော")) return "from-yellow-500/30 via-stone-900 to-black";
    if (name.includes("durian") || name.includes("ဒူးရင်း")) return "from-lime-600/30 via-stone-900 to-black";
    return "from-purple-600/30 via-stone-900 to-black";
  };

  const getGenreLabel = () => {
    if (editedStory.genre === "cooking_guide") return "🍳 ဟင်းချက်နည်းလမ်းညွှန်";
    if (editedStory.genre === "video-inspired") return "🎬 ဗီဒီယိုလှုံ့ဆော်မှု";
    const activeGenre = PREDEFINED_GENRES.find((g) => g.id === editedStory.genre);
    return activeGenre?.label || "စိတ်ကြိုက်အမျိုးအစား";
  };
  const activeFruitIcon = editedStory.fruit === "Chef Kitchen" ? "🍳" : (FRUIT_SUGGESTIONS.find((f) => f.value.toLowerCase() === (editedStory.fruit || "").toLowerCase())?.icon || "🍎");

  const getLanguageHeading = () => {
    if (selectedLanguage === "english") return "အင်္ဂလိပ်လို စကားပြော (English Dialogue)";
    if (selectedLanguage === "japanese") return "ဂျပန်လို စကားပြော (Japanese Dialogue / 日本語)";
    return "မြန်မာလို ဇာတ်ကြောင်းပြောနှင့် စကားပြောစကား (Burmese Dialogue)";
  };

  const parts = editedStory.parts || [];

  return (
    <div className="space-y-6" id="story-viewer">
      {/* Back and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
        <div className="flex items-center gap-3">
          <button type="button"
            onClick={onBack}
            className="p-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 rounded-xl transition-all active:scale-95 cursor-pointer"
            title="နောက်သို့ပြန်သွားမည်"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
              {getGenreLabel()}
            </span>
            <h1 className="text-xl md:text-2xl font-bold text-stone-100 font-sans tracking-tight flex items-center gap-2">
              <span>{activeFruitIcon}</span>
              <span>{editedStory.title}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <button type="button"
            onClick={() => setIsSoundBoardOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-400 font-semibold rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm text-xs md:text-sm"
            title="အသံစနစ်များ Sound FX Board ဖွင့်မည်"
          >
            <Volume2 className="w-4 h-4" />
            <span>အသံစနစ်များ (Sound FX)</span>
          </button>
          {isAlreadySaved && onDelete && (
            <button type="button"
              onClick={() => {
                onDelete(editedStory.id);
                onBack();
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 font-semibold rounded-xl transition-all active:scale-95 cursor-pointer text-xs md:text-sm"
              title="ဇာတ်လမ်းကို ဖျက်မည်"
            >
              <Trash2 className="w-4 h-4" />
              <span>ဇာတ်လမ်းဖျက်မည်</span>
            </button>
          )}
          <button type="button"
            onClick={() => onSave && onSave(editedStory)}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-stone-950 font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/10 cursor-pointer text-xs md:text-sm"
          >
            <Save className="w-4 h-4" />
            <span>
              {isAlreadySaved ? "ပြင်ဆင်ချက်များသိမ်းမည်" : "မှတ်တမ်းများကိုသိမ်းမည်"}
            </span>
          </button>
        </div>
      </div>

      {/* Language Selection Bar */}
      <div className="bg-stone-900/90 border-2 border-amber-500/30 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-stone-100">
                စကားပြော Dialogues ဘာသာစကား ရွေးချယ်မှု
              </h3>
              <span className="px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 rounded-full text-[10px] font-bold text-amber-400">
                Dialogue Language
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              ဘာသာစကား ချိန်းလိုက်သည်နှင့် ဇာတ်ကြောင်းပြောနှင့် စကားပြော Dialogue များ ချက်ချင်းပြောင်းလဲပါမည်
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang.id;
              return (
                <button type="button"
                  key={lang.id}
                  onClick={() => handleSwitchLanguage(lang.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-500 text-stone-950 shadow-md font-bold"
                      : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.nativeLabel}</span>
                  {isSelected && isTranslating && (
                    <Loader2 className="w-3 h-3 animate-spin text-stone-950 ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Metadata & Parts List (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Metadata View / Edit Panel */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl">
            {isEditingMetadata ? (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-stone-400">ဇာတ်လမ်း အချက်အလက်များကို ပြင်ဆင်ရန်</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-1">ခေါင်းစဉ်</label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      className="w-full px-4 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-1">ဇာတ်လမ်းအကျဉ်းချုပ်</label>
                    <textarea
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 focus:outline-none focus:border-amber-500 text-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingMetadata(false)}
                      className="px-4 py-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-400 text-xs font-medium rounded-lg"
                    >
                      မလုပ်တော့ပါ
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveMetadata}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-medium rounded-lg"
                    >
                      သိမ်းဆည်းမည်
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start gap-4">
                  <p className="text-sm text-stone-300 leading-relaxed font-sans">
                    {editedStory.description || "ဇာတ်လမ်းအကျဉ်းချုပ် မရှိပါ။"}
                  </p>
                  <button type="button"
                    onClick={() => {
                      setMetaTitle(editedStory.title);
                      setMetaDescription(editedStory.description || "");
                      setIsEditingMetadata(true);
                    }}
                    className="p-2 hover:bg-stone-800 text-stone-400 hover:text-stone-200 rounded-lg transition-colors shrink-0"
                    title="ဇာတ်လမ်းအကျဉ်း ပြင်ဆင်ရန်"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-stone-800/60 text-xs text-stone-500">
                  <span>ဇာတ်ကောင်: <strong className="text-stone-400">{editedStory.fruit}</strong></span>
                  <span>•</span>
                  <span>စုစုပေါင်း: <strong className="text-stone-400">{parts.length} ပိုင်း</strong></span>
                  <span>•</span>
                  <span>ဘာသာစကား: <strong className="text-amber-400 font-semibold">{SUPPORTED_LANGUAGES.find(l => l.id === selectedLanguage)?.flag} {SUPPORTED_LANGUAGES.find(l => l.id === selectedLanguage)?.nativeLabel}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Active Chapter Preview */}
          {activePart && (
            <div className="bg-stone-900 border-2 border-amber-500/25 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-200">
                    အပိုင်းတစ်ပိုင်းချင်းစီ အသေးစိတ်ကြည့်ရှုရန် (Active Chapter Preview)
                  </h4>
                </div>
                <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-mono font-bold text-amber-400">
                  Part {activePartIndex + 1} / {parts.length}
                </span>
              </div>

              {/* Narrations/Dialogue section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{getLanguageHeading()}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button type="button"
                      onClick={() => toggleAudioPlayback(activePartIndex, activePart)}
                      className={`flex items-center gap-1.5 px-3 py-1 border rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        playingAudioPartIndex === activePartIndex
                          ? "bg-amber-500 text-stone-950 border-amber-400 font-bold"
                          : "bg-stone-850 hover:bg-stone-800 border-stone-700 text-amber-400"
                      }`}
                    >
                      {playingAudioPartIndex === activePartIndex ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{playingAudioPartIndex === activePartIndex ? "ရပ်မည်" : "အသံ/SFX နားဆင်မည်"}</span>
                    </button>
                    <button type="button"
                      onClick={() => handleCopyScript(activePart, activePartIndex)}
                      className="text-emerald-500 hover:text-emerald-400 flex items-center gap-1 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-2.5 py-1 rounded-lg"
                    >
                      {copiedScriptIndex === activePartIndex ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedScriptIndex === activePartIndex ? "ကူးယူပြီး" : "စာသားကူးယူရန်"}</span>
                    </button>
                  </div>
                </div>

                {(() => {
                  const currentNarration = getDisplayNarration(activePart);
                  const parsed = parseNarration(currentNarration);
                  return (
                    <div className="bg-stone-950/60 p-4 rounded-xl border border-stone-800/80 space-y-3">
                      {parsed.lines && parsed.lines.length > 0 ? (
                        <div className="space-y-3">
                          {parsed.lines.map((line, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex flex-wrap gap-1.5 items-center">
                                {line.speaker && (
                                  <span className="px-2 py-0.5 bg-stone-800 border border-stone-700 text-stone-300 rounded-md text-[10px] font-bold">
                                    👤 {line.speaker}
                                  </span>
                                )}
                                {line.emotion && (
                                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md text-[10px] font-mono">
                                    🎭 {line.emotion}
                                  </span>
                                )}
                                {line.soundFx && (
                                  <span className="px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded-md text-[10px] font-mono flex items-center gap-1">
                                    <Volume2 className="w-3 h-3 text-amber-400" />
                                    <span>{line.soundFx}</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-stone-100 font-sans text-sm md:text-base leading-relaxed pl-2.5 border-l-2 border-amber-500/50">
                                {line.dialogue}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-stone-100 font-sans text-sm md:text-base leading-relaxed">
                          {parsed.cleanDialogue}
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Image Prompts Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-400 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-500/80" />
                      Image Prompt 1
                    </span>
                    <button type="button"
                      onClick={() => handleCopyPrompt(activePart.imagePrompt, activePartIndex)}
                      className="text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPromptIndex === activePartIndex ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPromptIndex === activePartIndex ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="bg-stone-950/40 p-3 border border-stone-800/50 rounded-xl max-h-24 overflow-y-auto custom-scrollbar">
                    <p className="font-mono text-[11px] text-stone-300 leading-relaxed select-all">
                      {activePart.imagePrompt}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-400 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-500/80" />
                      Image Prompt 2
                    </span>
                    <button type="button"
                      onClick={() => handleCopyPrompt2(activePart.imagePrompt2 || activePart.imagePrompt, activePartIndex)}
                      className="text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPrompt2Index === activePartIndex ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPrompt2Index === activePartIndex ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="bg-stone-950/40 p-3 border border-stone-800/50 rounded-xl max-h-24 overflow-y-auto custom-scrollbar">
                    <p className="font-mono text-[11px] text-stone-300 leading-relaxed select-all">
                      {activePart.imagePrompt2 || activePart.imagePrompt}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-850">
                <button type="button"
                  disabled={activePartIndex === 0}
                  onClick={() => setActivePartIndex((prev) => Math.max(0, prev - 1))}
                  className="flex items-center gap-1.5 px-3 py-2 bg-stone-950 border border-stone-800 text-stone-300 disabled:opacity-30 rounded-xl text-xs sm:text-sm font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>ယခင်အပိုင်း (Prev)</span>
                </button>

                <div className="text-center">
                  <span className="text-xs text-stone-400 font-semibold block">လက်ရှိအပိုင်း</span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-amber-400">
                    Part {activePartIndex + 1} of {parts.length}
                  </span>
                </div>

                <button type="button"
                  disabled={activePartIndex === parts.length - 1}
                  onClick={() => setActivePartIndex((prev) => Math.min(parts.length - 1, prev + 1))}
                  className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-stone-950 disabled:opacity-30 rounded-xl text-xs sm:text-sm font-bold shadow-md"
                >
                  <span>နောက်တစ်ပိုင်း (Next)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Parts List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-stone-200 flex items-center justify-between">
              <span>အပိုင်းများစာရင်း (Story Chapters)</span>
              <span className="text-xs text-stone-500">တည်းဖြတ်ရန် ခဲတံအိုင်ကွန်ကို နှိပ်ပါ</span>
            </h3>

            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
              {parts.map((part, index) => {
                const isActive = index === activePartIndex;
                const isEditing = index === editingPartIndex;
                const currentNarration = getDisplayNarration(part);

                return (
                  <div
                    key={part.partNumber || index}
                    className={`p-4 rounded-xl border transition-all ${
                      isActive
                        ? "bg-stone-900 border-amber-500/50 shadow-md"
                        : "bg-stone-900/50 border-stone-800/80 hover:bg-stone-900/80"
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-amber-500">အပိုင်း ({part.partNumber}) ကို ပြင်ဆင်နေသည်</span>
                        </div>
                        <div>
                          <label className="block text-xs text-stone-400 mb-1">Image Prompt 1</label>
                          <textarea
                            value={editPrompt}
                            onChange={(e) => setEditPrompt(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-stone-400 mb-1">Dialogue</label>
                          <textarea
                            value={editNarration}
                            onChange={(e) => setEditNarration(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 text-sm"
                          />
                        </div>
                        <div className="flex justify-end gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => setEditingPartIndex(null)}
                            className="px-3 py-1.5 bg-stone-950 border border-stone-800 text-stone-400 rounded-md"
                          >
                            မလုပ်တော့ပါ
                          </button>
                          <button
                            type="button"
                            onClick={() => savePartEdit(index)}
                            className="px-3 py-1.5 bg-amber-500 text-stone-950 font-medium rounded-md"
                          >
                            ပြင်ဆင်ချက်သိမ်းမည်
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <button type="button"
                            onClick={() => setActivePartIndex(index)}
                            className="flex items-center gap-2.5 text-left font-semibold text-stone-200 text-sm hover:text-amber-400 transition-colors cursor-pointer"
                          >
                            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-mono font-bold ${
                              isActive ? "bg-amber-500 text-stone-950" : "bg-stone-800 text-stone-400"
                            }`}>
                              {part.partNumber}
                            </span>
                            <span>အပိုင်း ({part.partNumber}) ဇာတ်ညွှန်း</span>
                          </button>

                          <button type="button"
                            onClick={() => startEditPart(index)}
                            className="p-1.5 hover:bg-stone-800 text-stone-400 hover:text-amber-500 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="pl-8.5 space-y-2 text-xs">
                          <div className="bg-stone-950/40 p-2.5 border border-stone-800/50 rounded-lg">
                            <p className="font-mono text-stone-300 text-[11px] leading-relaxed select-all">
                              {part.imagePrompt}
                            </p>
                          </div>
                          <div className="bg-stone-950/20 p-2.5 border border-stone-800/30 rounded-lg">
                            <p className="text-stone-200 font-sans text-sm leading-relaxed">
                              {currentNarration}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Virtual 9:16 Preview Mockup (lg:col-span-5) */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="max-w-xs mx-auto">
            <h3 className="text-sm font-semibold text-stone-400 mb-3 text-center">
              📱 Virtual Video Mobile Mockup
            </h3>

            <div className="relative border-8 border-stone-800 bg-stone-950 w-full aspect-[9/16] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col justify-between p-6">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-stone-800 rounded-full z-20 flex items-center justify-center">
                <div className="w-12 h-1 bg-stone-900 rounded-full"></div>
              </div>

              <div className={`absolute inset-0 bg-gradient-to-b ${getFruitColorGradient(editedStory.fruit || "")} z-0`}></div>

              <div className="relative z-10 flex justify-between items-center text-[10px] text-stone-400 font-mono mt-2">
                <span>00:10 s</span>
                <span className="px-2 py-0.5 bg-red-600 text-stone-100 font-semibold rounded-full uppercase tracking-wider text-[8px] animate-pulse">
                  NARRATION
                </span>
                <span>Part {activePart?.partNumber || 1}/{parts.length}</span>
              </div>

              <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 mt-8">
                <div className="w-24 h-24 rounded-full bg-stone-900/60 border border-stone-700/50 flex items-center justify-center text-5xl shadow-2xl">
                  {activeFruitIcon}
                </div>
                <div className="mt-4 bg-stone-950/80 border border-stone-800/80 px-3 py-1.5 rounded-full text-[10px] text-stone-300 font-mono">
                  {editedStory.fruit}
                </div>
              </div>

              <div className="relative z-10 space-y-3 mb-4">
                <div className="bg-stone-950/80 border border-stone-800/50 backdrop-blur-md p-4 rounded-2xl shadow-xl">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block mb-1">
                    {selectedLanguage === "japanese" ? "Japanese (日本語)" : selectedLanguage === "english" ? "English" : "Burmese (မြန်မာ)"}
                  </span>
                  <p className="text-stone-100 text-sm font-sans font-medium text-center leading-relaxed">
                    {getDisplayNarration(activePart) || "ဇာတ်ကြောင်းမရှိပါ။"}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <button type="button"
                    disabled={activePartIndex === 0}
                    onClick={() => setActivePartIndex((prev) => Math.max(0, prev - 1))}
                    className="p-2.5 bg-stone-900/90 border border-stone-800 hover:bg-stone-800 text-stone-300 disabled:opacity-30 rounded-xl"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <span className="text-xs text-stone-400 font-mono">
                    Part {activePartIndex + 1} of {parts.length}
                  </span>

                  <button type="button"
                    disabled={activePartIndex === parts.length - 1}
                    onClick={() => setActivePartIndex((prev) => Math.min(parts.length - 1, prev + 1))}
                    className="p-2.5 bg-stone-900/90 border border-stone-800 hover:bg-stone-800 text-stone-300 disabled:opacity-30 rounded-xl"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SoundEffectBoard
        isOpen={isSoundBoardOpen}
        onClose={() => setIsSoundBoardOpen(false)}
      />
    </div>
  );
}

export { StoryViewer };
