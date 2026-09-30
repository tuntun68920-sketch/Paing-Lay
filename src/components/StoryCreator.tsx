import React, { useState } from "react";
import {
  Sparkles,
  HelpCircle,
  AlertCircle,
  RefreshCw,
  PenTool,
  Flame,
  ArrowRight,
  CornerDownRight,
  Video,
  Film,
  Upload,
  Search,
  BookOpen,
  Heart,
  Smile,
  Music,
  Mic,
  Wine,
  Image as ImageIcon,
  Camera,
  Trash2,
  Plus,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import {
  PREDEFINED_GENRES,
  FRUIT_SUGGESTIONS,
  PARTS_OPTIONS,
  Story,
  StoryPart,
  Settings,
  SoundEffect,
  ModelConfig,
} from "../types";
import ModelSelector from "./ModelSelector";

export interface StoryCreatorProps {
  onStoryGenerated?: (story: Story) => void;
  onSaveStory?: (story: Story) => void;
  onPlayStory?: (story: Story) => void;
  isLoading?: boolean;
  setIsGenerating?: (loading: boolean) => void;
  apiKeySettings?: Settings;
  onUpdateSettings?: (settings: Settings) => void;
  onStartGenerating?: (metadata: {
    title: string;
    fruit: string;
    partsCount: number;
    isManual: boolean;
  }) => void;
  soundEffects?: SoundEffect[];
  modelConfig?: ModelConfig;
  onChangeModelConfig?: (cfg: ModelConfig) => void;
  language?: "both" | "my" | "en";
  activeCategory?: string;
}

const getApiKeyEstimate = (parts: number) => {
  const batches = Math.ceil(parts / 20);
  const totalCalls = 1 + batches;

  let minKeys = 1;
  let recommendedKeys = 1;
  let keyRecommendation = "";
  let warningMessage = "";

  if (parts <= 10) {
    minKeys = 1;
    recommendedKeys = 1;
    keyRecommendation = "API Key ၁ ခု";
    warningMessage = "Free API Key ၁ ခုတည်းဖြင့် လုံလောက်စွာနှင့် အဆင်ပြေစွာ ဖန်တီးနိုင်ပါသည်။";
  } else if (parts <= 30) {
    minKeys = 1;
    recommendedKeys = 2;
    keyRecommendation = "API Key ၁ ခု သို့မဟုတ် ၂ ခု (အလှည့်ကျ)";
    warningMessage =
      "အပိုင်း ၃၀ အထိ ဖန်တီးရာတွင် API Key ၂ ခု ထည့်သွင်းထားပေးပါက API Rate Limit မမိဘဲ ပိုမိုမြန်ဆန် ချောမွေ့ပါမည်။";
  } else if (parts <= 50) {
    minKeys = 2;
    recommendedKeys = 3;
    keyRecommendation = "API Key ၂ ခု သို့မဟုတ် ၃ ခု (အလှည့်ကျ)";
    warningMessage =
      "Rate Limit (429 Error) ကျော်လွန်ခြင်းမှ ရှောင်ရှားရန် Settings တွင် API Key အနည်းဆုံး ၂ ခုခန့် ထည့်သွင်းအသုံးပြုရန် အကြံပြုပါသည်။";
  } else {
    minKeys = 3;
    recommendedKeys = 4;
    keyRecommendation = "API Key ၃ ခု မှ ၄ ခု (အလှည့်ကျ)";
    warningMessage =
      "အပိုင်း ၁၀၀ အထိ ဖန်တီးရာတွင် မိနစ်အနည်းငယ်ကြာမြင့်နိုင်ပြီး API Key ၃ ခုထက်မနည်း ထည့်သွင်းထားမှသာ Auto Key Rotation ဖြင့် အဆက်မပြတ် ဖန်တီးနိုင်ပါမည်။";
  }

  return { totalCalls, minKeys, recommendedKeys, keyRecommendation, warningMessage };
};

export default function StoryCreator({
  onStoryGenerated,
  onSaveStory,
  onPlayStory,
  isLoading: propIsLoading,
  setIsGenerating: propSetIsGenerating,
  apiKeySettings: propApiKeySettings,
  onUpdateSettings,
  onStartGenerating,
  modelConfig,
  onChangeModelConfig,
}: StoryCreatorProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = propIsLoading !== undefined ? propIsLoading : internalLoading;
  const setIsGenerating = (loading: boolean) => {
    if (propSetIsGenerating) propSetIsGenerating(loading);
    setInternalLoading(loading);
  };

  const apiKeySettings: Settings = propApiKeySettings || {
    geminiApiKey: "",
    isCustomKeyEnabled: false,
    selectedModel: modelConfig?.model || "gemini-3.8-flash",
  };

  const handleCompleteStory = (story: Story) => {
    if (onStoryGenerated) onStoryGenerated(story);
    if (onSaveStory) onSaveStory(story);
    if (onPlayStory) onPlayStory(story);
  };

  const [selectedGenre, setSelectedGenre] = useState(PREDEFINED_GENRES[0].id);
  const [customGenre, setCustomGenre] = useState("");
  const [selectedFruit, setSelectedFruit] = useState(FRUIT_SUGGESTIONS[0].value);
  const [customFruit, setCustomFruit] = useState("");
  const [selectedParts, setSelectedParts] = useState<number>(10);
  const [customIdea, setCustomIdea] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "ai" | "photo_character" | "video" | "bar_restaurant" | "cooking" | "society" | "tea_youtiao"
  >("ai");

  // For Photo Character Story creation
  const [photoFiles, setPhotoFiles] = useState<
    { id: string; name: string; dataUrl: string; size: number; charName?: string }[]
  >([]);
  const [photoStoryTitle, setPhotoStoryTitle] = useState("");
  const [photoStorySynopsis, setPhotoStorySynopsis] = useState("");
  const [photoGenre, setPhotoGenre] = useState(PREDEFINED_GENRES[0].id);
  const [photoCustomGenre, setPhotoCustomGenre] = useState("");
  const [photoPartsCount, setPhotoPartsCount] = useState<number>(10);
  const [photoCharacterNotes, setPhotoCharacterNotes] = useState("");
  const [photoStylePreference, setPhotoStylePreference] = useState("match_uploaded_image");
  const [isDraggingPhotos, setIsDraggingPhotos] = useState(false);
  const MAX_CHARACTERS_LIMIT = 8;

  // For Bar & Restaurant Live Singing Stories
  const [barSongTitle, setBarSongTitle] = useState("Bar & Restaurant လမိုက်ညရဲ့ သီချင်းသံ");
  const [barTheme, setBarTheme] = useState(
    "စုံတန်း အချစ်နှင့် ဟာသသီချင်းဆိုပွဲ (Romantic & Comedy Live Song)"
  );
  const [barCharStyle, setBarCharStyle] = useState<
    "fruit_hybrid" | "human_3d" | "cute_fruit" | "live_action"
  >("fruit_hybrid");
  const [barFruit, setBarFruit] = useState<string>(FRUIT_SUGGESTIONS[0].value);
  const [barCustomFruit, setBarCustomFruit] = useState<string>("");
  const [barPartsCount, setBarPartsCount] = useState<number>(10);
  const [barCustomIdea, setBarCustomIdea] = useState<string>("");

  // Character Style option
  const [fruitMode, setFruitMode] = useState<"with_fruit" | "no_fruit">("with_fruit");
  const [characterStyle, setCharacterStyle] = useState<
    "fruit_hybrid" | "human_3d" | "cute_fruit" | "live_action"
  >("fruit_hybrid");

  // For fruit-human society creation
  const [societyFruit, setSocietyFruit] = useState(FRUIT_SUGGESTIONS[0].value);
  const [societyCustomFruit, setSocietyCustomFruit] = useState("");
  const [societyHumanChar, setSocietyHumanChar] = useState(
    "ရုံးဝန်ထမ်း သာမန်လူသားတစ်ဦး (An ordinary office worker)"
  );
  const [societyParts, setSocietyParts] = useState<number>(10);
  const [societyCustomIdea, setSocietyCustomIdea] = useState("");

  // For realistic human true stories
  const [trueStorySearchQuery, setTrueStorySearchQuery] = useState("");
  const [trueStoryPartsCount, setTrueStoryPartsCount] = useState<number>(10);
  const [trueStoryStyle, setTrueStoryStyle] = useState<
    "human" | "fruit" | "live_action" | "tea_youtiao"
  >("human");

  // For Tea & YouTiao romantic couple stories
  const [teaYoutiaoCharacters, setTeaYoutiaoCharacters] = useState(
    "လက်ဖက်ရည် ကိုကို နှင့် အီကြာကွေး ကွေးကွေးလေး"
  );
  const [teaYoutiaoScenario, setTeaYoutiaoScenario] = useState("");
  const [teaYoutiaoPartsCount, setTeaYoutiaoPartsCount] = useState<number>(10);

  // For video story creation
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoBase64, setVideoBase64] = useState<string | null>(null);
  const [videoCustomFruit, setVideoCustomFruit] = useState("mango");
  const [videoCustomIdea, setVideoCustomIdea] = useState("");
  const [videoPartsCount, setVideoPartsCount] = useState<number>(10);
  const [isDragging, setIsDragging] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>("");

  // For Comedy / Funny Stories
  const [comedyCategory, setComedyCategory] = useState<"prank" | "laugh_out_loud">("prank");
  const [comedyCharStyle, setComedyCharStyle] = useState<"fruit" | "human_3d" | "hybrid">(
    "fruit"
  );
  const [comedyFruit, setComedyFruit] = useState<string>(FRUIT_SUGGESTIONS[0].value);
  const [comedyCustomFruit, setComedyCustomFruit] = useState<string>("");
  const [comedyScenario, setComedyScenario] = useState<string>("");
  const [comedyPartsCount, setComedyPartsCount] = useState<number>(10);

  // For cooking recipe creation
  const [cookingDishName, setCookingDishName] = useState("");
  const [cookingIngredients, setCookingIngredients] = useState("");
  const [cookingStepsCount, setCookingStepsCount] = useState<number>(8);
  const [cookingTone, setCookingTone] = useState(
    "ရိုးရာကျေးလက် ဆူညံသံမပါ ASMR စတိုင် (Rural Traditional ASMR Style)"
  );
  const [isSearchingIngredients, setIsSearchingIngredients] = useState(false);
  const [hasSearchedIngredients, setHasSearchedIngredients] = useState(false);

  const activeGenreObj = PREDEFINED_GENRES.find((g) => g.id === selectedGenre);
  const finalGenreLabel = customGenre.trim()
    ? customGenre.trim()
    : selectedGenre === "custom"
    ? "စိတ်ကြိုက်ဖန်တီးသော ဇာတ်လမ်း"
    : activeGenreObj?.label || selectedGenre;
  const isHumanCharStyle = characterStyle === "human_3d" || characterStyle === "live_action";
  const finalFruit = isHumanCharStyle
    ? "No Fruit (3D Human Story)"
    : fruitMode === "with_fruit"
    ? customFruit.trim()
      ? customFruit.trim()
      : selectedFruit
    : "No Fruit (အသီးမပါဝင်သော သာမန်ဇာတ်လမ်း)";

  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let currentSettings = apiKeySettings;
    if (
      apiKeySettings.isCustomKeyEnabled &&
      apiKeySettings.apiKeysList &&
      apiKeySettings.apiKeysList.length > 1
    ) {
      const list = apiKeySettings.apiKeysList;
      const currentIndex = list.findIndex((item) => item.id === apiKeySettings.activeKeyId);
      const nextIndex = (currentIndex + 1) % list.length;
      const nextItem = list[nextIndex];
      currentSettings = {
        ...apiKeySettings,
        activeKeyId: nextItem.id,
        geminiApiKey: nextItem.key,
      };
      if (onUpdateSettings) {
        onUpdateSettings(currentSettings);
      }
    }

    if (onStartGenerating) {
      onStartGenerating({
        title: customIdea.trim()
          ? customIdea.trim()
          : isHumanCharStyle || fruitMode !== "with_fruit"
          ? `${finalGenreLabel} ဇာတ်လမ်း (3D လူသား)`
          : `${finalFruit} ၏ ${finalGenreLabel} ဇာတ်လမ်း`,
        fruit: isHumanCharStyle
          ? "3D Human (No Fruit) 🚫"
          : fruitMode === "with_fruit"
          ? finalFruit
          : "No Fruit 🚫",
        partsCount: selectedParts,
        isManual: false,
      });
    }

    setIsGenerating(true);

    try {
      const activeModel =
        currentSettings.selectedModel || apiKeySettings.selectedModel || "gemini-3.8-flash";
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "x-gemini-model": activeModel,
      };

      if (currentSettings.isCustomKeyEnabled && currentSettings.geminiApiKey) {
        headers["x-gemini-api-key"] = currentSettings.geminiApiKey;
      }

      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          fruit: finalFruit,
          genre: customGenre.trim() ? "custom" : selectedGenre,
          genreLabel: finalGenreLabel,
          partsCount: selectedParts,
          customIdea: customIdea,
          characterStyle: characterStyle,
          selectedModel: activeModel,
          apiKey: currentSettings.geminiApiKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "ဇာတ်လမ်းဖန်တီးမှု မအောင်မြင်ပါ။";
        throw new Error(errorMsg);
      }

      let processedParts: StoryPart[] = (data.parts || []).map((part: any, idx: number) => ({
        partNumber: part.partNumber || idx + 1,
        imagePrompt: part.imagePrompt || "",
        imagePrompt2: part.imagePrompt2 || part.imagePrompt || "",
        narrationBurmese: part.narrationBurmese || part.contentBurmese || "",
        narrationEnglish: part.narrationEnglish || part.content || "",
        narrationJapanese: part.narrationJapanese || "",
        cameraRotation: part.cameraRotation || "Slow camera pan",
        cameraSettings: part.cameraSettings || "Camera: 50mm lens, f/1.8, cinematic lighting",
      }));

      const generatedStory: Story = {
        id: "story_" + Date.now(),
        title: data.title || `${finalFruit} ၏ ${finalGenreLabel}`,
        genre: customGenre.trim() ? "custom" : selectedGenre,
        fruit: finalFruit,
        partsCount: processedParts.length,
        createdAt: new Date().toISOString(),
        description: data.description || "",
        parts: processedParts,
      };

      handleCompleteStory(generatedStory);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "ဇာတ်လမ်းဖန်တီးစဉ် အမှားအယွင်းတစ်ခု ဖြစ်ပွားခဲ့ပါသည်။");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTrueStoryGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!trueStorySearchQuery.trim()) {
      setError("ကျေးဇူးပြု၍ ဖြစ်ရပ်မှန် ဇာတ်လမ်း သို့မဟုတ် ဇာတ်ကောင်အမည်တစ်ခုခု ထည့်သွင်းရှာဖွေပေးပါ။");
      return;
    }

    setIsGenerating(true);
    setGenerationStatus("AI သည် ဖြစ်ရပ်မှန် အချက်အလက်များကို စိစစ်ပြီး ဇာတ်လမ်းဖန်တီးနေပါသည်...");

    try {
      const activeModel = apiKeySettings.selectedModel || "gemini-3.8-flash";
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "x-gemini-model": activeModel,
      };
      if (apiKeySettings.isCustomKeyEnabled && apiKeySettings.geminiApiKey) {
        headers["x-gemini-api-key"] = apiKeySettings.geminiApiKey;
      }

      const response = await fetch("/api/generate-true-story", {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: trueStorySearchQuery.trim(),
          partsCount: trueStoryPartsCount,
          style: trueStoryStyle,
          selectedModel: activeModel,
          apiKey: apiKeySettings.geminiApiKey,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ဖြစ်ရပ်မှန် ဇာတ်လမ်းဖန်တီးမှု မအောင်မြင်ပါ။");

      const processedParts: StoryPart[] = (data.parts || []).map((part: any, idx: number) => ({
        partNumber: part.partNumber || idx + 1,
        imagePrompt: part.imagePrompt || "",
        imagePrompt2: part.imagePrompt2 || part.imagePrompt || "",
        narrationBurmese: part.narrationBurmese || "",
        cameraRotation: part.cameraRotation || "Slow camera pan",
        cameraSettings: part.cameraSettings || "Camera: 50mm lens, f/1.8, cinematic lighting",
      }));

      const generatedStory: Story = {
        id: "truestory_" + Date.now(),
        title: data.title || `${trueStorySearchQuery.trim()} ၏ ဖြစ်ရပ်မှန်ဇာတ်လမ်း`,
        genre: "true_stories",
        fruit:
          trueStoryStyle === "fruit"
            ? "Fruit Heads (Dramatic)"
            : trueStoryStyle === "tea_youtiao"
            ? "Laphatyay & E-Kyarr-Kway"
            : "Realistic Human (CGI)",
        partsCount: processedParts.length,
        createdAt: new Date().toISOString(),
        description: data.description || "",
        parts: processedParts,
        isRealStory: true,
        realStoryBackground: data.realStoryBackground || "",
      };

      handleCompleteStory(generatedStory);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "ဇာတ်လမ်းရှာဖွေဖန်တီးစဉ် အမှားအယွင်းတစ်ခု ဖြစ်ပွားခဲ့ပါသည်။");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTeaYoutiaoGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsGenerating(true);
    setGenerationStatus("AI သည် စုံတွဲဇာတ်ကောင်များနှင့် ရိုမန်းတစ်ဇာတ်ကွက်ကို ပုံဖော်နေပါသည်...");

    try {
      const activeModel = apiKeySettings.selectedModel || "gemini-3.8-flash";
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "x-gemini-model": activeModel,
      };
      if (apiKeySettings.isCustomKeyEnabled && apiKeySettings.geminiApiKey) {
        headers["x-gemini-api-key"] = apiKeySettings.geminiApiKey;
      }

      const response = await fetch("/api/generate-true-story", {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: `${teaYoutiaoCharacters}\n${teaYoutiaoScenario}`,
          partsCount: teaYoutiaoPartsCount,
          style: "tea_youtiao",
          selectedModel: activeModel,
          apiKey: apiKeySettings.geminiApiKey,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ဇာတ်လမ်းဖန်တီးမှု မအောင်မြင်ပါ။");

      const processedParts: StoryPart[] = (data.parts || []).map((part: any, idx: number) => ({
        partNumber: part.partNumber || idx + 1,
        imagePrompt: part.imagePrompt || "",
        imagePrompt2: part.imagePrompt2 || part.imagePrompt || "",
        narrationBurmese: part.narrationBurmese || "",
        cameraRotation: part.cameraRotation || "Slow camera pan",
        cameraSettings: part.cameraSettings || "Camera: 50mm lens, f/1.8, cinematic lighting",
      }));

      const finalStory: Story = {
        id: "story-" + Date.now(),
        title: data.title || `${teaYoutiaoCharacters} - ရိုမန်းတစ်စုံတွဲ`,
        description: data.description || "လက်ဖက်ရည် ကိုကို နှင့် အီကြာကွေး ကွေးကွေးလေး တို့၏ အချစ်ဇာတ်လမ်း။",
        genre: "romantic_couple",
        fruit: "Tea & YouTiao Romantic Couple ☕🥖",
        partsCount: processedParts.length,
        parts: processedParts,
        createdAt: new Date().toISOString(),
      };

      handleCompleteStory(finalStory);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "ဇာတ်လမ်းဖန်တီးရာတွင် အမှားတစ်ခု ရှိခဲ့ပါသည်။");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComedyGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsGenerating(true);

    try {
      const activeModel = apiKeySettings.selectedModel || "gemini-3.8-flash";
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "x-gemini-model": activeModel,
      };
      if (apiKeySettings.isCustomKeyEnabled && apiKeySettings.geminiApiKey) {
        headers["x-gemini-api-key"] = apiKeySettings.geminiApiKey;
      }

      const categoryTitle =
        comedyCategory === "prank" ? "နောက်ပြောင်သော ဟာသဇာတ်လမ်းများ" : "ပရိသတ် ရယ်မောဖွယ်ရာ ဟာသဇာတ်လမ်းများ";

      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers,
        body: JSON.stringify({
          fruit: comedyCharStyle === "human_3d" ? "No Fruit" : comedyCustomFruit || comedyFruit,
          genre: "comedy_funny",
          genreLabel: categoryTitle,
          partsCount: comedyPartsCount,
          customIdea: comedyScenario,
          characterStyle: comedyCharStyle === "human_3d" ? "human_3d" : "cute_fruit",
          selectedModel: activeModel,
          apiKey: apiKeySettings.geminiApiKey,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ဟာသဇာတ်လမ်း ဖန်တီးမှု မအောင်မြင်ပါ။");

      const processedParts: StoryPart[] = (data.parts || []).map((part: any, idx: number) => ({
        partNumber: part.partNumber || idx + 1,
        imagePrompt: part.imagePrompt || "",
        imagePrompt2: part.imagePrompt2 || part.imagePrompt || "",
        narrationBurmese: part.narrationBurmese || "",
        cameraRotation: part.cameraRotation || "Slow camera pan",
        cameraSettings: part.cameraSettings || "Camera: 50mm lens, f/1.8, cinematic lighting",
      }));

      const generatedStory: Story = {
        id: "comedy_" + Date.now(),
        title: data.title || `${categoryTitle} (${comedyFruit})`,
        genre: "comedy_funny",
        fruit: comedyCharStyle === "human_3d" ? "3D Human" : comedyFruit,
        partsCount: processedParts.length,
        createdAt: new Date().toISOString(),
        description: data.description || categoryTitle,
        parts: processedParts,
      };

      handleCompleteStory(generatedStory);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "ဟာသဇာတ်လမ်း ဖန်တီးစဉ် အမှားအယွင်းတစ်ခု ဖြစ်ပွားခဲ့ပါသည်။");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBarRestaurantGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsGenerating(true);

    try {
      const activeModel = apiKeySettings.selectedModel || "gemini-3.8-flash";
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "x-gemini-model": activeModel,
      };
      if (apiKeySettings.isCustomKeyEnabled && apiKeySettings.geminiApiKey) {
        headers["x-gemini-api-key"] = apiKeySettings.geminiApiKey;
      }

      const response = await fetch("/api/generate-bar-restaurant-story", {
        method: "POST",
        headers,
        body: JSON.stringify({
          fruit: barCustomFruit || barFruit,
          characterStyle: barCharStyle,
          barTheme,
          partsCount: barPartsCount,
          songTitle: barSongTitle,
          customIdea: barCustomIdea,
          selectedModel: activeModel,
          apiKey: apiKeySettings.geminiApiKey,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Bar သီချင်းဆိုပွဲ ဖန်တီးမှု မအောင်မြင်ပါ။");

      const processedParts: StoryPart[] = (data.parts || []).map((part: any, idx: number) => ({
        partNumber: part.partNumber || idx + 1,
        imagePrompt: part.imagePrompt || "",
        imagePrompt2: part.imagePrompt2 || part.imagePrompt || "",
        narrationBurmese: part.narrationBurmese || "",
        cameraRotation: part.cameraRotation || "Slow camera pan",
        cameraSettings: part.cameraSettings || "Camera: 50mm lens, f/1.8, cinematic lighting",
      }));

      const generatedStory: Story = {
        id: "bar_" + Date.now(),
        title: data.title || barSongTitle,
        genre: "bar_restaurant",
        fruit: barFruit,
        partsCount: barPartsCount,
        createdAt: new Date().toISOString(),
        description: data.description || "Bar & Restaurant သီချင်းဆိုပွဲ",
        parts: processedParts,
      };

      handleCompleteStory(generatedStory);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Bar & Restaurant ဇာတ်လမ်း ဖန်တီးစဉ် အမှားအယွင်းတစ်ခု ဖြစ်ပွားခဲ့ပါသည်။");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSearchIngredients = async () => {
    if (!cookingDishName.trim()) return;
    setError(null);
    setIsSearchingIngredients(true);
    try {
      const activeModel = apiKeySettings.selectedModel || "gemini-3.8-flash";
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (apiKeySettings.isCustomKeyEnabled && apiKeySettings.geminiApiKey) {
        headers["x-gemini-api-key"] = apiKeySettings.geminiApiKey;
      }
      const response = await fetch("/api/suggest-ingredients", {
        method: "POST",
        headers,
        body: JSON.stringify({
          dishName: cookingDishName.trim(),
          selectedModel: activeModel,
          apiKey: apiKeySettings.geminiApiKey,
        }),
      });
      const data = await response.json();
      if (data.ingredients) {
        setCookingIngredients(data.ingredients);
        setHasSearchedIngredients(true);
      }
    } catch {
      setHasSearchedIngredients(true);
    } finally {
      setIsSearchingIngredients(false);
    }
  };

  const handleCookingGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cookingDishName.trim()) return;
    setError(null);
    setIsGenerating(true);

    try {
      const activeModel = apiKeySettings.selectedModel || "gemini-3.8-flash";
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (apiKeySettings.isCustomKeyEnabled && apiKeySettings.geminiApiKey) {
        headers["x-gemini-api-key"] = apiKeySettings.geminiApiKey;
      }

      const response = await fetch("/api/generate-cooking-recipe", {
        method: "POST",
        headers,
        body: JSON.stringify({
          dishName: cookingDishName.trim(),
          ingredients: cookingIngredients.trim(),
          stepsCount: cookingStepsCount,
          presentationTone: cookingTone,
          selectedModel: activeModel,
          apiKey: apiKeySettings.geminiApiKey,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ဟင်းချက်နည်း ဖန်တီးမှု မအောင်မြင်ပါ။");

      const processedParts: StoryPart[] = (data.parts || []).map((part: any, idx: number) => ({
        partNumber: part.partNumber || idx + 1,
        imagePrompt: part.imagePrompt || "",
        imagePrompt2: part.imagePrompt2 || part.imagePrompt || "",
        narrationBurmese: part.narrationBurmese || "",
        cameraRotation: part.cameraRotation || "Slow camera pan",
        cameraSettings: part.cameraSettings || "Camera: 50mm lens, f/1.8, cinematic lighting",
      }));

      const generatedStory: Story = {
        id: "recipe_" + Date.now(),
        title: data.title || cookingDishName,
        genre: "cooking_guide",
        fruit: "Chef Kitchen",
        partsCount: cookingStepsCount,
        createdAt: new Date().toISOString(),
        description: data.description || `ဟင်းချက်နည်းလမ်းညွှန် - ${cookingDishName}`,
        parts: processedParts,
      };

      handleCompleteStory(generatedStory);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "ဟင်းချက်နည်းလမ်းညွှန် ဖန်တီးစဉ် အမှားအယွင်းတစ်ခု ဖြစ်ပွားခဲ့ပါသည်။");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePhotoStoryGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (photoFiles.length === 0) {
      setError("ကျေးဇူးပြု၍ အနည်းဆုံး ဇာတ်ကောင်နမူနာပုံ (၁) ပုံ Upload တင်ပေးပါ။");
      return;
    }
    setError(null);
    setIsGenerating(true);

    try {
      const activeModel = apiKeySettings.selectedModel || "gemini-3.8-flash";
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (apiKeySettings.isCustomKeyEnabled && apiKeySettings.geminiApiKey) {
        headers["x-gemini-api-key"] = apiKeySettings.geminiApiKey;
      }

      const response = await fetch("/api/generate-photo-character-story", {
        method: "POST",
        headers,
        body: JSON.stringify({
          images: photoFiles.map((p) => ({ dataUrl: p.dataUrl, name: p.name })),
          storyTitle: photoStoryTitle.trim() || "ဇာတ်ကောင်ပုံစတိုင် အခြေပြု စွန့်စားခန်း",
          synopsis: photoStorySynopsis.trim(),
          genre: photoGenre,
          stylePreference: photoStylePreference,
          characterNotes: photoCharacterNotes.trim(),
          partsCount: photoPartsCount,
          selectedModel: activeModel,
          apiKey: apiKeySettings.geminiApiKey,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ဇာတ်ကောင်ပုံမှ ဇာတ်လမ်းဖန်တီးမှု မအောင်မြင်ပါ။");

      const processedParts: StoryPart[] = (data.parts || []).map((part: any, idx: number) => ({
        partNumber: part.partNumber || idx + 1,
        imagePrompt: part.imagePrompt || "",
        imagePrompt2: part.imagePrompt2 || part.imagePrompt || "",
        narrationBurmese: part.narrationBurmese || "",
        cameraRotation: part.cameraRotation || "Slow cinematic pan with steady focus",
        cameraSettings: part.cameraSettings || "Camera: 50mm lens, f/1.8, cinematic lighting",
      }));

      const generatedStory: Story = {
        id: "photo_" + Date.now(),
        title: data.title || photoStoryTitle || "ဇာတ်ကောင်ပုံစတိုင် အခြေပြု စွန့်စားခန်း",
        genre: photoGenre,
        fruit: "character_photo",
        partsCount: processedParts.length,
        createdAt: new Date().toISOString(),
        description: data.description || photoStorySynopsis,
        parts: processedParts,
      };

      handleCompleteStory(generatedStory);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "ဇာတ်ကောင်ပုံမှ ဇာတ်လမ်း ဖန်တီးစဉ် အမှားအယွင်းတစ်ခု ဖြစ်ပွားခဲ့ပါသည်။");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>, replaceIndex?: number) => {
    if (e.target.files && e.target.files.length > 0) {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          const newItem = {
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            dataUrl,
            size: file.size,
            charName: "",
          };
          setPhotoFiles((prev) => {
            if (replaceIndex !== undefined && replaceIndex < prev.length) {
              const copy = [...prev];
              copy[replaceIndex] = newItem;
              return copy;
            }
            return [...prev, newItem].slice(0, MAX_CHARACTERS_LIMIT);
          });
        };
        reader.readAsDataURL(file);
      }
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-8" id="story-creator">
      {/* Tab Selector */}
      <div className="w-full max-w-5xl mx-auto px-2">
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar scrollbar-none p-1.5 bg-stone-900/90 border border-stone-800 rounded-2xl gap-1.5 shadow-xl">
          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`whitespace-nowrap shrink-0 px-3.5 py-2 text-xs md:text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "ai"
                ? "bg-amber-500 text-stone-950 shadow-md font-bold"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>AI အကူအညီဖြင့်</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("photo_character")}
            className={`whitespace-nowrap shrink-0 px-3.5 py-2 text-xs md:text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "photo_character"
                ? "bg-amber-500 text-stone-950 shadow-md font-bold"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
            }`}
          >
            <Camera className="w-4 h-4 shrink-0" />
            <span>ဇာတ်ကောင်ပုံဖြင့်</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("society")}
            className={`whitespace-nowrap shrink-0 px-3.5 py-2 text-xs md:text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "society"
                ? "bg-amber-500 text-stone-950 shadow-md font-bold"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>ဖြစ်ရပ်မှန် ဇာတ်လမ်း</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tea_youtiao")}
            className={`whitespace-nowrap shrink-0 px-3.5 py-2 text-xs md:text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "tea_youtiao"
                ? "bg-amber-500 text-stone-950 shadow-md font-bold"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
            }`}
          >
            <Heart className="w-4 h-4 shrink-0 text-pink-500 fill-pink-500/20" />
            <span>ရိုမန်းတစ်</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("video")}
            className={`whitespace-nowrap shrink-0 px-3.5 py-2 text-xs md:text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "video"
                ? "bg-amber-500 text-stone-950 shadow-md font-bold"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
            }`}
          >
            <Smile className="w-4 h-4 shrink-0" />
            <span>ဟာသ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cooking")}
            className={`whitespace-nowrap shrink-0 px-3.5 py-2 text-xs md:text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "cooking"
                ? "bg-amber-500 text-stone-950 shadow-md font-bold"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
            }`}
          >
            <Flame className="w-4 h-4 shrink-0" />
            <span>ဟင်းချက်</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("bar_restaurant")}
            className={`whitespace-nowrap shrink-0 px-3.5 py-2 text-xs md:text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "bar_restaurant"
                ? "bg-amber-500 text-stone-950 shadow-md font-bold"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
            }`}
          >
            <Music className="w-4 h-4 shrink-0" />
            <span>Bar & Restaurant</span>
          </button>
        </div>
      </div>

      {/* Manual Gemini Model Selector Bar */}
      <div className="w-full max-w-5xl mx-auto px-2">
        <ModelSelector
          compact
          selectedModel={apiKeySettings.selectedModel || "gemini-3.8-flash"}
          onSelectModel={(newModelId) => {
            if (onUpdateSettings) {
              onUpdateSettings({
                ...apiKeySettings,
                selectedModel: newModelId,
              });
            }
            if (onChangeModelConfig && modelConfig) {
              onChangeModelConfig({ ...modelConfig, model: newModelId });
            }
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Parameters Form */}
        <div className="lg:col-span-2 bg-stone-900 border border-stone-800 p-6 md:p-8 rounded-2xl shadow-xl space-y-6">
          <h2 className="text-xl font-semibold text-stone-100 flex items-center gap-2">
            {activeTab === "ai" ? (
              <>
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>AI Story Generator (အသီးဇာတ်လမ်း ဆန်းသစ်ဖန်တီးသူ)</span>
              </>
            ) : activeTab === "photo_character" ? (
              <>
                <Camera className="w-5 h-5 text-amber-400" />
                <span>📸 ဇာတ်ကောင်ပုံစတိုင် အခြေပြု ဇာတ်လမ်းဖန်တီးသူ</span>
              </>
            ) : activeTab === "society" ? (
              <>
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>လူနှင့်အသီးဖြစ်ရပ်မှန် ဇာတ်လမ်းဖန်တီးသူ</span>
              </>
            ) : activeTab === "tea_youtiao" ? (
              <>
                <Heart className="w-5 h-5 text-pink-400 fill-pink-400/20" />
                <span>💖 ရိုမန်းတစ် စုံတွဲနှင့် စိတ်ကြိုက်ဇာတ်ကောင်များ</span>
              </>
            ) : activeTab === "video" ? (
              <>
                <Smile className="w-5 h-5 text-amber-400" />
                <span>😂 ဟာသဆန်သော ဇာတ်လမ်းများ ဖန်တီးသူ</span>
              </>
            ) : activeTab === "cooking" ? (
              <>
                <Flame className="w-5 h-5 text-amber-400" />
                <span>Cooking Guide Generator (ဟင်းချက်နည်းလမ်းညွှန်)</span>
              </>
            ) : (
              <>
                <Music className="w-5 h-5 text-amber-400" />
                <span>🍸 Bar & Restaurant (သီချင်းဆိုဖျော်ဖြေပွဲ ဇာတ်လမ်းများ)</span>
              </>
            )}
          </h2>

          {error && (
            <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl text-red-400 text-sm flex items-start gap-2.5 shadow-inner">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1">
                <p className="font-bold text-red-400">လုပ်ဆောင်ချက် မအောင်မြင်ပါ</p>
                <div className="mt-2 text-xs text-stone-300 whitespace-pre-line bg-stone-950/80 p-3.5 rounded-lg border border-red-950/40 leading-relaxed font-sans font-medium">
                  {error}
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai" ? (
            <form onSubmit={handleAiGenerate} className="space-y-6">
              {/* 2-Option Fruit Inclusion Selection */}
              <div className="p-4 bg-stone-900/90 border border-amber-500/30 rounded-2xl space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    ဇာတ်လမ်းမဖန်တီးမီ ရွေးချယ်ရန်
                  </label>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                    Mandatory Option
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFruitMode("with_fruit")}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      fruitMode === "with_fruit"
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/40 shadow-md"
                        : "bg-stone-950/80 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200"
                    }`}
                  >
                    <div className="text-2xl p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
                      🍎
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-stone-100">
                        ၁ - အသီးပါဝင် (အသီးများဆက်လက်ရွေးချယ်ရမည်)
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5 leading-normal">
                        အသီးဇာတ်ကောင်၊ အသီးခေါင်း၊ သို့မဟုတ် အသီးလူသား ရွေးချယ်နိုင်ပါသည်
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFruitMode("no_fruit");
                      setCharacterStyle("human_3d");
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      fruitMode === "no_fruit"
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/40 shadow-md"
                        : "bg-stone-950/80 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200"
                    }`}
                  >
                    <div className="text-2xl p-2 rounded-lg bg-stone-800/60 border border-stone-700/50 shrink-0">
                      🚫
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-stone-100">
                        ၂ - အသီးမပါဝင် (အသီးရွှေးချယ်စရာမလိုပါ)
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5 leading-normal">
                        သာမန်လူသား သန့်သန့်၊ သရဲ/ဝိညာဉ် သို့မဟုတ် ဖြစ်ရပ်ဆန်း ဇာတ်လမ်းများ ဖန်တီးမည်
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Character Visual Style Selection */}
              <div className="space-y-2.5">
                <label className="block text-sm font-medium text-stone-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                    <Sparkles className="w-4 h-4" />
                    ပုံထွက်စတိုင် ရွေးချယ်ရန် (Character Visual Style)
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setFruitMode("with_fruit");
                      setCharacterStyle("fruit_hybrid");
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      characterStyle === "fruit_hybrid" && fruitMode === "with_fruit"
                        ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-2 ring-amber-500/30"
                        : "bg-stone-950/80 border-stone-800 text-stone-400 hover:border-stone-700"
                    }`}
                  >
                    <div className="text-xl">🍓</div>
                    <div>
                      <div className="text-xs font-bold leading-tight">လူကိုယ် အသီးခေါင်း 3D</div>
                      <div className="text-[10px] opacity-75 mt-0.5">Human Body + Fruit Head</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCharacterStyle("human_3d")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      characterStyle === "human_3d"
                        ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-2 ring-amber-500/30"
                        : "bg-stone-950/80 border-stone-800 text-stone-400 hover:border-stone-700"
                    }`}
                  >
                    <div className="text-xl">🧍‍♂️</div>
                    <div>
                      <div className="text-xs font-bold leading-tight">3D လူသား ဇာတ်ကောင်</div>
                      <div className="text-[10px] opacity-75 mt-0.5">3D CGI Animated Human</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFruitMode("with_fruit");
                      setCharacterStyle("cute_fruit");
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      characterStyle === "cute_fruit" && fruitMode === "with_fruit"
                        ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-2 ring-amber-500/30"
                        : "bg-stone-950/80 border-stone-800 text-stone-400 hover:border-stone-700"
                    }`}
                  >
                    <div className="text-xl">🍍</div>
                    <div>
                      <div className="text-xs font-bold leading-tight">3D အသီးသန့် (Cute)</div>
                      <div className="text-[10px] opacity-75 mt-0.5">Cute 3D Animated Fruit</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCharacterStyle("live_action")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      characterStyle === "live_action"
                        ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-2 ring-amber-500/30"
                        : "bg-stone-950/80 border-stone-800 text-stone-400 hover:border-stone-700"
                    }`}
                  >
                    <div className="text-xl">🎬</div>
                    <div>
                      <div className="text-xs font-bold leading-tight">Cinematic ရုပ်ရှင်</div>
                      <div className="text-[10px] opacity-75 mt-0.5">Photorealistic Human</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Genre Selector */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-300">
                  ဇာတ်လမ်းအမျိုးအစား ရွေးချယ်ရန်
                </label>
                <select
                  value={selectedGenre}
                  onChange={(e) => {
                    setSelectedGenre(e.target.value);
                    if (e.target.value !== "custom") setCustomGenre("");
                  }}
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
                >
                  {PREDEFINED_GENRES.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                  placeholder="သို့မဟုတ် ဇာတ်လမ်းအမျိုးအစား ကိုယ်တိုင်ရေးရန်..."
                  className="w-full mt-2 px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 placeholder-stone-600 focus:outline-none text-sm"
                />
              </div>

              {/* Fruit and Parts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fruitMode === "with_fruit" ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-stone-300">
                      ရွေးချယ်ရန် အသီးနမူနာများ
                    </label>
                    <select
                      value={selectedFruit}
                      onChange={(e) => {
                        setSelectedFruit(e.target.value);
                        setCustomFruit("");
                      }}
                      className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
                    >
                      {FRUIT_SUGGESTIONS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.icon} {f.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={customFruit}
                      onChange={(e) => setCustomFruit(e.target.value)}
                      placeholder="ဇာတ်ကောင်အသီးများ ချရေးပါ..."
                      className="w-full mt-2 px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 placeholder-stone-600 focus:outline-none text-sm"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-stone-400">
                      အသီးရွေးချယ်မှု
                    </label>
                    <div className="p-3.5 bg-stone-950/80 border border-stone-800 rounded-xl text-stone-300 text-xs flex items-center gap-3 h-[106px]">
                      <span className="text-2xl shrink-0">🚫</span>
                      <div>
                        <p className="font-bold text-amber-400/90 text-xs">အသီးမပါဝင်သော ဇာတ်လမ်း</p>
                        <p className="text-stone-400 text-[11px] mt-0.5">
                          အသီးရွေးချယ်ရန် မလိုပါ။ သာမန်လူသား သန့်သန့်အဖြစ် တိုက်ရိုက်ဖန်တီးပေးပါမည်။
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-stone-300">
                    ဇာတ်လမ်းအပိုင်း အရေအတွက်
                  </label>
                  <div className="grid grid-cols-5 gap-1.5 md:gap-2">
                    {PARTS_OPTIONS.map((parts) => (
                      <button
                        key={parts}
                        type="button"
                        onClick={() => setSelectedParts(parts)}
                        className={`py-2 px-1 text-xs md:text-sm font-semibold rounded-xl border transition-all cursor-pointer ${
                          selectedParts === parts
                            ? "bg-amber-500/10 border-amber-500 text-amber-400 shadow-md"
                            : "bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200"
                        }`}
                      >
                        {parts} ပိုင်း
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Custom Ideas */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-300">
                  ထပ်လောင်းဇာတ်ကွက် သို့မဟုတ် စိတ်ကူးများ
                </label>
                <textarea
                  value={customIdea}
                  onChange={(e) => setCustomIdea(e.target.value)}
                  placeholder="ဥပမာ- ရွာမှ ထွက်လာသော မာလကာသီးမလေး မြို့ကြီးတွင် လှည့်စားခံရပြီးနောက် သာယာလှပသော ပန်းခြံလေးတစ်ခု၌ ပြန်လည်အသက်ဆက်ပုံ..."
                  rows={3}
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] disabled:opacity-50 text-stone-950 font-semibold rounded-xl transition-all shadow-lg cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>ဇာတ်လမ်းဖန်တီးနေဆဲ ဖြစ်ပါသည်...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-stone-950" />
                      <span>AI ဖြင့် ဇာတ်လမ်းအစအဆုံး ထုတ်လုပ်မည်</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : activeTab === "photo_character" ? (
            <form onSubmit={handlePhotoStoryGenerate} className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-stone-200">
                  ၁။ နမူနာ ဇာတ်ကောင်ဓာတ်ပုံများ ထည့်သွင်းရန် ({photoFiles.length} / {MAX_CHARACTERS_LIMIT})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {photoFiles.map((photo, idx) => (
                    <div key={photo.id} className="relative bg-stone-950 border border-stone-800 rounded-xl p-2">
                      <img src={photo.dataUrl} alt={photo.name} className="w-full aspect-square object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => setPhotoFiles((prev) => prev.filter((p) => p.id !== photo.id))}
                        className="absolute top-3 right-3 p-1 bg-red-600/80 rounded-md text-white hover:bg-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {photoFiles.length < MAX_CHARACTERS_LIMIT && (
                    <label className="border-2 border-dashed border-stone-800 hover:border-amber-500 rounded-xl flex flex-col items-center justify-center aspect-square cursor-pointer p-4 text-center">
                      <Plus className="w-6 h-6 text-amber-500 mb-1" />
                      <span className="text-xs text-stone-300">ပုံထည့်ရန်</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoFileChange} />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-300">၂။ ဇာတ်လမ်းခေါင်းစဉ်</label>
                <input
                  type="text"
                  value={photoStoryTitle}
                  onChange={(e) => setPhotoStoryTitle(e.target.value)}
                  placeholder="ဇာတ်လမ်းခေါင်းစဉ် ရေးပါ..."
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-300">၃။ ဇာတ်လမ်းအကျဉ်း</label>
                <textarea
                  value={photoStorySynopsis}
                  onChange={(e) => setPhotoStorySynopsis(e.target.value)}
                  placeholder="ဇာတ်လမ်းအကျဉ်း ရေးပါ..."
                  rows={3}
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 text-sm"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isLoading || photoFiles.length === 0}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-stone-950 font-semibold rounded-xl"
                >
                  {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                  <span>📸 ဇာတ်ကောင်ပုံဖြင့် ဇာတ်လမ်းထုတ်လုပ်မည်</span>
                </button>
              </div>
            </form>
          ) : activeTab === "tea_youtiao" ? (
            <form onSubmit={handleTeaYoutiaoGenerate} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-300">
                  ဇာတ်ကောင် အမည်များ / စုံတွဲ
                </label>
                <input
                  type="text"
                  value={teaYoutiaoCharacters}
                  onChange={(e) => setTeaYoutiaoCharacters(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-stone-100 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-300">
                  ဇာတ်လမ်းစိတ်ကူး / အကြောင်းအရာ
                </label>
                <textarea
                  value={teaYoutiaoScenario}
                  onChange={(e) => setTeaYoutiaoScenario(e.target.value)}
                  placeholder="မိုးရေထဲ အတူတူထီးဆောင်းခြင်း..."
                  rows={3}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-stone-100 text-sm"
                />
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-stone-950 font-semibold rounded-xl"
                >
                  {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5" />}
                  <span>ရိုမန်းတစ် ဇာတ်လမ်း စတင်ထုတ်လုပ်မည်</span>
                </button>
              </div>
            </form>
          ) : activeTab === "society" ? (
            <form onSubmit={handleTrueStoryGenerate} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-300">
                  ဖြစ်ရပ်မှန်ဇာတ်လမ်း သို့မဟုတ် ဇာတ်ကောင်အမည်
                </label>
                <input
                  type="text"
                  value={trueStorySearchQuery}
                  onChange={(e) => setTrueStorySearchQuery(e.target.value)}
                  placeholder="ဥပမာ- နှင်းမြ သို့မဟုတ် မောင်အေး..."
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 text-sm"
                />
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-stone-950 font-semibold rounded-xl"
                >
                  {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  <span>ဖြစ်ရပ်မှန်ဇာတ်လမ်း ရှာဖွေပြီး ဖန်တီးမည်</span>
                </button>
              </div>
            </form>
          ) : activeTab === "video" ? (
            <form onSubmit={handleComedyGenerate} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-300">
                  ဟာသ ဇာတ်ကွက်
                </label>
                <textarea
                  value={comedyScenario}
                  onChange={(e) => setComedyScenario(e.target.value)}
                  placeholder="သူငယ်ချင်းနှစ်ယောက် ရွှတ်နောက်နောက် နောက်ပြောင်ကျီစယ်ကြပုံ..."
                  rows={3}
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 text-sm"
                />
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-stone-950 font-semibold rounded-xl"
                >
                  {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Smile className="w-5 h-5" />}
                  <span>😂 ဟာသဆန်သော ဇာတ်လမ်း စတင်ထုတ်လုပ်မည်</span>
                </button>
              </div>
            </form>
          ) : activeTab === "cooking" ? (
            <form onSubmit={handleCookingGenerate} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-300">
                  ဟင်းလျာအမည် (Dish Name)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cookingDishName}
                    onChange={(e) => setCookingDishName(e.target.value)}
                    placeholder="ဥပမာ- ရွှေဖရုံသီး အမဲသားချက်နည်း..."
                    className="flex-1 px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleSearchIngredients}
                    disabled={isSearchingIngredients}
                    className="px-4 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold"
                  >
                    Search
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-300">
                  ပါဝင်ပစ္စည်းများ
                </label>
                <textarea
                  value={cookingIngredients}
                  onChange={(e) => setCookingIngredients(e.target.value)}
                  placeholder="ပါဝင်ပစ္စည်းများ..."
                  rows={2}
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 text-sm"
                />
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !cookingDishName.trim()}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-stone-950 font-semibold rounded-xl"
                >
                  {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Flame className="w-5 h-5" />}
                  <span>ဟင်းချက်နည်းလမ်းညွှန် ဖန်တီးမည်</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleBarRestaurantGenerate} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-300">သီချင်းခေါင်းစဉ်</label>
                <input
                  type="text"
                  value={barSongTitle}
                  onChange={(e) => setBarSongTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-300">သီချင်းအကြောင်းအရာ</label>
                <textarea
                  value={barCustomIdea}
                  onChange={(e) => setBarCustomIdea(e.target.value)}
                  placeholder="Bar စင်မြင့်ပေါ်တွင် သီချင်းဆိုဖျော်ဖြေပွဲ..."
                  rows={3}
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 text-sm"
                />
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-stone-950 font-semibold rounded-xl"
                >
                  {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Music className="w-5 h-5" />}
                  <span>🍸 Bar & Restaurant သီချင်းဆိုပွဲ စတင်ထုတ်လုပ်မည်</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Side: Information Panel */}
        <div className="space-y-6">
          <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-lg font-semibold text-stone-100 flex items-center gap-2 border-b border-stone-800 pb-3">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>သတ်မှတ်ချက်နှင့် လမ်းညွှန်ချက်</span>
            </h3>
            <ul className="space-y-3 text-sm text-stone-300">
              <li className="flex gap-2">
                <span className="text-amber-500 shrink-0">✔</span>
                <span><strong>3D ကာတွန်းပုံစံ (Pixar Style):</strong> လှပသော 3D Animation ရုပ်ရှင်ပုံစံဖြင့် ဖန်တီးပေးမည်။</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500 shrink-0">✔</span>
                <span><strong>Ratio 9:16 Vertical:</strong> TikTok, Reels နှင့် Shorts ဗီဒီယို format အတိုင်း သတ်မှတ်ပေးထားသည်။</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500 shrink-0">✔</span>
                <span><strong>Direct Speech စကားပြောသံ:</strong> အပိုင်းတိုင်းအတွက် သဘာဝကျသော စကားပြောသံများ ပါဝင်သည်။</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export { StoryCreator };
