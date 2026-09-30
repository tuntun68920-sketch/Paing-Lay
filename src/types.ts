export type StoryGenre =
  | 'Fantasy & Myth'
  | 'Mystery & Supernatural'
  | 'Sci-Fi & Cyberpunk'
  | 'Horror & Thriller'
  | 'Action & Adventure'
  | 'Folklore & Legend'
  | 'Historical Drama';

export interface SoundCue {
  soundId: string;
  label: string;
  delayMs?: number;
  volume?: number;
}

export interface StoryChoice {
  id: string;
  text: string;
  textBurmese?: string;
  targetSceneId: string;
  requirement?: string;
}

export interface DialogueLine {
  speaker: string;
  speakerBurmese?: string;
  text: string;
  textBurmese?: string;
  fruitIcon?: string;
}

export interface Scene {
  id: string;
  title: string;
  titleBurmese?: string;
  content: string;
  contentBurmese?: string;
  dialogues?: DialogueLine[];
  imagePrompt?: string;
  aspectRatio?: '9:16' | '16:9' | '1:1';
  soundCues?: SoundCue[];
  choices: StoryChoice[];
  backgroundMood?: string;
  bgmTrack?: string;
  characterName?: string;
}

export interface StoryCharacter {
  id: string;
  name: string;
  nameBurmese?: string;
  role: string;
  description?: string;
  voice?: string;
}

export interface VideoSegment {
  segmentIndex: number;
  timecode: string;
  durationSeconds: number;
  title: string;
  titleBurmese?: string;
  dialogueBurmese: string;
  dialogueEnglish?: string;
  speaker: string;
  speakerBurmese?: string;
  actionDescription: string;
  actionDescriptionBurmese?: string;
  imagePrompt: string;
  soundEffectsCue?: string;
  cameraAngle?: string;
}

export type DialogueLanguage = "burmese" | "english" | "japanese";

export interface LanguageOption {
  id: DialogueLanguage;
  label: string;
  myanmarLabel: string;
  nativeLabel: string;
  flag: string;
}

export type SupportedLanguage = LanguageOption;

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    id: "burmese",
    label: "Burmese",
    myanmarLabel: "မြန်မာဘာသာ",
    nativeLabel: "မြန်မာ",
    flag: "🇲🇲"
  },
  {
    id: "english",
    label: "English",
    myanmarLabel: "အင်္ဂလိပ်ဘာသာ",
    nativeLabel: "English",
    flag: "🇬🇧"
  },
  {
    id: "japanese",
    label: "Japanese",
    myanmarLabel: "ဂျပန်ဘာသာ",
    nativeLabel: "日本語",
    flag: "🇯🇵"
  }
];

export interface StoryPart {
  partNumber: number;
  imagePrompt: string;
  imagePrompt2?: string;
  narrationBurmese: string;
  narrationEnglish?: string;
  narrationJapanese?: string;
  cameraRotation?: string;
  cameraSettings?: string;
}

export interface Story {
  id: string;
  title: string;
  titleBurmese?: string;
  genre: string;
  fruit: string;
  partsCount: number;
  createdAt: string;
  updatedAt?: string;
  description: string;
  synopsis?: string;
  synopsisBurmese?: string;
  author?: string;
  coverImage?: string;
  tags?: string[];
  initialSceneId?: string;
  scenes?: Record<string, Scene>;
  characters?: StoryCharacter[];
  segments?: VideoSegment[];
  parts: StoryPart[];
  totalDurationSeconds?: number;
  totalSegmentsCount?: number;
  characterVisualDescription?: string;
  isRealStory?: boolean;
  realStoryBackground?: string;
  dialogueLanguage?: DialogueLanguage;
}

export interface Genre {
  id: string;
  label: string;
  englishLabel: string;
  description: string;
}

export interface ApiKeyItem {
  id: string;
  label: string;
  key: string;
  createdAt: string;
}

export interface GeminiModelOption {
  id: string;
  name: string;
  badge: string;
  tag: string;
  description: string;
  speed: string;
  isPro?: boolean;
}

export const GEMINI_MODEL_OPTIONS: GeminiModelOption[] = [
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    badge: "3.8 Flash",
    tag: "မျိုးဆက်သစ် ဗားရှင်းသစ် (New 3.8)",
    description: "Gemini 3.8 မျိုးဆက်သစ် မော်ဒယ်၊ အလွန်မြန်ဆန်ပြီး ဉာဏ်ရည်မြင့်မားစွာ ဇာတ်လမ်းနှင့် prompt များကို ထုတ်ပေးနိုင်သည်",
    speed: "အလွန်မြန်ဆန် (Ultra Fast)",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    badge: "2.5 Flash",
    tag: "အမြန်ဆုံး & အတည်ငြိမ်ဆုံး (Recommended)",
    description: "စက္ကန့်ပိုင်းအတွင်း အလွန်မြန်ဆန်စွာ ဇာတ်လမ်းထွက်ပြီး High Demand / 503 error ကင်းစင်သော အကောင်းဆုံး မော်ဒယ်",
    speed: "အလွန်မြန်ဆန် (Ultra Fast)",
  },
  {
    id: "gemini-3.7-flash",
    name: "Gemini 3.7 Flash",
    badge: "3.7 Flash",
    tag: "မျိုးဆက်သစ် (3.7 Flash)",
    description: "စွမ်းရည်အမြင့်ဆုံး multimodal reasoning နှင့် အနုစိတ် ဇာတ်လမ်းဖန်တီးမှု စနစ်",
    speed: "မြန်ဆန် (Fast)",
  },
  {
    id: "gemini-3.8-pro",
    name: "Gemini 3.8 Pro",
    badge: "3.8 Pro",
    tag: "အဆင့်မြင့် 3.8 (Pro)",
    description: "Gemini 3.8 အနုစိတ် ဇာတ်အိမ်တွေးခေါ်မှုနှင့် အဆင့်မြင့် ဇာတ်လမ်းဖန်တီးမှု စနစ် (အရန် failover စနစ် ပါဝင်သည်)",
    speed: "အနုစိတ် စဉ်းစား (Thoughtful)",
    isPro: true,
  },
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash Lite",
    badge: "3.1 Lite",
    tag: "ပေါ့ပါးမြန်ဆန် (Lite)",
    description: "တုံ့ပြန်မှုအလွန်မြန်ဆန်ပြီး Token/Quota အထူးသက်သာစေသော မျိုးဆက်သစ် ဗားရှင်း",
    speed: "အမြန်ဆုံး (Super Fast)",
  },
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    badge: "2.5 Lite",
    tag: "အမြန်စား ဗားရှင်း (Lite)",
    description: "ပေါ့ပါးသွက်လက်ပြီး စာသားထွက်နှုန်းမြန်ဆန်သော Flash Lite မော်ဒယ်",
    speed: "အမြန်ဆုံး (Super Fast)",
  },
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    badge: "3.6 Flash",
    tag: "ဗားရှင်း 3.6 (Flash)",
    description: "Gemini 3.6 မျိုးဆက်သစ် Flash မော်ဒယ်၊ မြန်ဆန်တိကျပြီး prompt generation ကောင်းမွန်သည်",
    speed: "အလွန်မြန်ဆန် (Ultra Fast)",
  },
  {
    id: "gemini-3.6-pro",
    name: "Gemini 3.6 Pro",
    badge: "3.6 Pro",
    tag: "အဆင့်မြင့် 3.6 (Pro)",
    description: "Gemini 3.6 အနုစိတ် ဇာတ်အိမ်တွေးခေါ်မှုနှင့် ဇာတ်လမ်းဖန်တီးမှု စနစ်",
    speed: "အနုစိတ် စဉ်းစား (Thoughtful)",
    isPro: true,
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro Preview",
    badge: "3.1 Pro",
    tag: "အနုစိတ် အတွေးအခေါ် (Deep Reasoning)",
    description: "ဇာတ်အိမ်အနုစိတ်၊ ရှုပ်ထွေးသော ဇာတ်ကွက်များနှင့် အဆင့်မြင့်ဖန်တီးမှုအတွက် အထူးသင့်လျော်သည်",
    speed: "အနုစိတ် စဉ်းစား (Thoughtful)",
    isPro: true,
  },
  {
    id: "gemini-flash-latest",
    name: "Gemini Flash Latest",
    badge: "Flash Latest",
    tag: "နောက်ဆုံးထွက် (Latest Alias)",
    description: "Google Gemini ၏ နောက်ဆုံးထွက် Flash မော်ဒယ် အလိုအလျောက် ဗားရှင်း",
    speed: "မြန်ဆန် (Fast)",
  },
];

export interface Settings {
  geminiApiKey: string;
  isCustomKeyEnabled: boolean;
  apiKeysList?: ApiKeyItem[];
  activeKeyId?: string;
  selectedModel?: string;
  language?: 'both' | 'my' | 'en';
  activeDeviceId?: string;
  voiceName?: string;
  speechRate?: number;
  speechPitch?: number;
  masterVolume?: number;
  sfxVolume?: number;
  ambienceVolume?: number;
  autoPlaySfx?: boolean;
  autoNarration?: boolean;
  theme?: 'midnight' | 'dark' | 'fantasy' | 'cyber';
  fontSize?: 'sm' | 'md' | 'lg' | 'xl';
}

export type SettingsType = Settings;
export type AppSettings = Settings;

export const PREDEFINED_GENRES: Genre[] = [
  {
    id: "custom",
    label: "✨ Customize / ကိုယ်တိုင်စိတ်ကြိုက် ဇာတ်လမ်းနာမည်နှင့် အမျိုးအစား သတ်မှတ်မည်",
    englishLabel: "Customize Story Title & Genre",
    description: "မိမိစိတ်ကြိုက် ဇာတ်လမ်းခေါင်းစဉ်အမည် (Title) သို့မဟုတ် ဇာတ်လမ်းအမျိုးအစား (Genre) ကို ကိုယ်တိုင်စိတ်ကြိုက် ရေးသားဖန်တီးမည့် စနစ်"
  },
  {
    id: "ghost_horror_stories",
    label: "👻 သရဲနှင့် ဝိညာဉ် ထိတ်လန့်ဖွယ် ဇာတ်လမ်းများ",
    englishLabel: "Ghost & Supernatural Horror",
    description: "ကြောက်မက်ဖွယ်ရာ သရဲတစ္ဆေများ၊ ဝိညာဉ်ဆိုးများ၊ ထိတ်လန့်တုန်လှုပ်ဖွယ်ရာ ကျိန်စာသင့်နေရာများနှင့် ညဉ့်နက်သန်းခေါင် အောက်လမ်းပညာ သရဲဇာတ်လမ်းများ"
  },
  {
    id: "burmese_ghost_folklore",
    label: "🧟♂️ မြန်မာ့ရိုးရာ သရဲတစ္ဆေနှင့် နာနာဘာဝများ",
    englishLabel: "Burmese Traditional Ghost Folklore",
    description: "မြန်မာ့ရိုးရာ နာနာဘာဝများ၊ သရဲခြောက်သော တောရွာများနှင့် ရှေးရိုးရာ ထိတ်လန့်ဖွယ်ရာ သရဲခြောက်ခြင်း ပုံပြင်များ"
  },
  {
    id: "haunted_house_mystery",
    label: "🏚️ သရဲခြောက်သော အိမ်အိုကြီးနှင့် လျှို့ဝှက်ဆန်းကြယ်",
    englishLabel: "Haunted House & Dark Mystery",
    description: "စွန့်ပစ်ထားသော သရဲခြောက်သည့် အဆောက်အဦအိုကြီးများ၊ သန်းခေါင်ယံ အမှောင်ထုအတွင်းမှ ကြောက်မက်ဖွယ်ရာ ဖြစ်ရပ်ဆန်းများ"
  },
  {
    id: "cursed_artifact_horror",
    label: "🔮 ကျိန်စာသင့် ပစ္စည်းဆန်းနှင့် ညဉ့်နက်သန်းခေါင်",
    englishLabel: "Cursed Objects & Midnight Horror",
    description: "ရှေးဟောင်း ကျိန်စာသင့် ပစ္စည်းဆန်းများ၊ သန်းခေါင်ယံအချိန်မှ ထွက်ပေါ်လာသော ကျိန်စာသံများနှင့် ကြောက်မက်ဖွယ် သရဲဇာတ်အိမ်များ"
  },
  {
    id: "fruit_human_society",
    label: "အသီးနှင့်လူသား ဖြစ်ရပ်မှန်လောက",
    englishLabel: "Fruit & Human Real World",
    description: "သာမန်လူသားများနှင့် အသီးခေါင်းရှိသော ဇာတ်ကောင်များ အတူယှဉ်တွဲနေထိုင်ရာ လောကကြီးအတွင်း ဖြစ်ပျက်တတ်သော စိတ်လှုပ်ရှားဖွယ်ရာ ဖြစ်ရပ်မှန် ဒရာမာနှင့် သင်ခန်းစာရစရာ ဇာတ်လမ်းဆန်းများ"
  },
  {
    id: "revenge_romance",
    label: "အချစ်အတွက် လက်စားချေခြင်း",
    englishLabel: "Revenge Romance",
    description: "အချစ်ဦး သစ္စာဖောက်ခံရပြီးနောက် သိမ်မွေ့သော်လည်း ပြင်းထန်သော လက်စားချေမှုနှင့်အတူ ပေါ်ပေါက်လာမည့် ဇာတ်လမ်းဆန်းများ"
  },
  {
    id: "social_satire",
    label: "ရိုးသားသူနှိမ်ချခံရပြီး မရိုးသားသူစင်တင်ခံရခြင်း",
    englishLabel: "Dishonest vs Honest Satire",
    description: "ဆင်းရဲပြီး ရိုးသားလွန်းသူများ နှိမ့်ချစော်ကားခံရကာ မရိုးသားသည့် လျှပ်ပေါ်လော်လီသူများ အောင်မြင်နေသည့် လူမှုပတ်ဝန်းကျင်ကို သရော်ထားသည့် ဇာတ်လမ်းများ"
  },
  {
    id: "psychological_thriller",
    label: "စိတ္တဇပုံစံ",
    englishLabel: "Psychological Thriller",
    description: "စိတ်ကူးစိတ်သန်းထူးဆန်းပြီး စိတ်လှုပ်ရှားဖွယ်ရာ စိတ်ပိုင်းဆိုင်ရာ လျှို့ဝှက်ချက်များနှင့် စိတ္တဇဆန်ဆန် ဇာတ်အိမ်များ"
  },
  {
    id: "true_stories",
    label: "ဖြစ်ရပ်မှန် ဇာတ်လမ်းများ",
    englishLabel: "True/Realistic Stories",
    description: "လူ့လောကတွင် အမှန်တကယ် ဖြစ်ပွားလေ့ရှိသည့် အဖြစ်အပျက်များကို အခြေခံထားသော သင်ခန်းစာရရှိစေမည့် ဇာတ်လမ်းများ"
  },
  {
    id: "adventure_fantasy",
    label: "စိတ်ကူးယဉ် စွန့်စားခန်း",
    englishLabel: "Adventure Fantasy",
    description: "အသီးနိုင်ငံတော်အတွင်းမှ ထူးဆန်းအံ့ဩဖွယ်ရာ စွန့်စားခန်းများနှင့် ရဲရင့်သော စွမ်းအားရှင်များ၏ ဇာတ်လမ်းများ"
  },
  {
    id: "superhero_powers",
    label: "အသီးစွမ်းအားရှင်များနှင့် ဗီလိန်များ (Superhero)",
    englishLabel: "Fruit Superheroes and Villains",
    description: "ထူးခြားဆန်းပြားသော စူပါပါဝါကိုယ်စီရှိကြသည့် အသီးစွမ်းအားရှင်များက ကမ္ဘာကြီးကို ဗီလိန်များရန်မှ ကာကွယ်မည့် စိတ်လှုပ်ရှားဖွယ် 3D ဇာတ်လမ်းများ"
  },
  {
    id: "scifi_space",
    label: "ဂလက်ဆီအသီးအာကာသယာဉ်မှူးများ (Sci-Fi)",
    englishLabel: "Sci-Fi Fruit Space Odyssey",
    description: "အာကာသပြင်ပနှင့် အနာဂတ်ခေတ်ကြီးထဲတွင် အဆင့်မြင့်နည်းပညာမြင့် အသီးစက်ရုပ်များ၊ ယာဉ်မှူးများ၏ စွန့်စားခန်းများ"
  },
  {
    id: "detective_mystery",
    label: "အသီးမြို့တော်မှ လျှို့ဝှက်စုံထောက် (Detective)",
    englishLabel: "Fruit City Detective Noir",
    description: "နက်နဲဆန်းကြယ်လှသော အမှုအခင်းများကို ဖြေရှင်းရန် ကြိုးစားနေသည့် ဆွဲဆောင်မှုရှိသော အသီးစုံထောက်ကြီး၏ စုံထောက်ဇာတ်လမ်းဆန်း"
  },
  {
    id: "comedy_slapstick",
    label: "လူရွှင်တော်အသီးများ၏ အလွဲဇာတ်လမ်း (Comedy)",
    englishLabel: "Hilarious Fruit Comedy & Slapstick",
    description: "တစ်နေ့တစ်မျိုး မရိုးရအောင် အလွဲလွဲအချော်ချော်နှင့် ပရိသတ်ကို တဝါးဝါးရယ်မောစေမည့် အသီးလေးများ၏ နေ့စဉ်ဘဝဟာသများ"
  },
  {
    id: "historical_royal",
    label: "နန်းတွင်းအရှုပ်တော်ပုံနှင့် ရှေးဟောင်းဇာတ်လမ်း (Historical)",
    englishLabel: "Royal Fruit Dynasty & Drama",
    description: "နန်းပလ္လင်လုပွဲများ၊ ဘုရင်မင်းမြတ်နှင့် မိဖုရားများ၊ သစ္စာစောင့်သိသော စစ်သူကြီးအသီးများ၏ ရှေးခေတ်နန်းတွင်းဇာတ်လမ်းဆန်း"
  },
  {
    id: "school_romance",
    label: "အသီးကောလိပ်မှ နုပျိုသော အချစ်ဇာတ်လမ်း (Youth)",
    englishLabel: "Fruit High School Romance",
    description: "ကျောင်းတော်ကြီးအတွင်းမှ သူငယ်ချင်းသံယောဇဉ်၊ လှပနုပျိုသော ဆယ်ကျော်သက် အသီးကျောင်းသားကျောင်းသူများ၏ အချစ်ဇာတ်လမ်း"
  },
  {
    id: "horror_supernatural",
    label: "သန်းခေါင်ယံ အသီးသရဲခြောက်ခြင်း (Horror)",
    englishLabel: "Midnight Haunted Fruits",
    description: "ထူးဆန်းသော ကျိန်စာများ၊ သရဲခြောက်သော အိမ်အိုကြီးနှင့် သန်းခေါင်ယံအချိန် ထိတ်လန့်တုန်လှုပ်ဖွယ်ရာ အသီးများ၏ ကြောက်မက်ဖွယ်ဇာတ်လမ်း"
  },
  {
    id: "martial_arts",
    label: "အသီးသိုင်းလောကနှင့် သိုင်းသမားကြီးများ (Wuxia)",
    englishLabel: "Fruit Wuxia & Martial Arts",
    description: "ဓားစာအုပ်များ၊ သိုင်းပညာထူးများနှင့် တရားမျှတမှုအတွက် အသက်စွန့်တိုက်ခိုက်ကြသော အသီးသိုင်းဆရာကြီးများ၏ ဇာတ်လမ်း"
  },
  {
    id: "music_stars",
    label: "အသီးပေါ့ပ်စတားနှင့် ဂီတအိပ်မက် (Musical)",
    englishLabel: "Fruit Pop Stars & Musical Dream",
    description: "စင်မြင့်ထက်တွင် တောက်ပချင်သော အဆိုတော်အသီးလေးများနှင့် ဂီတပြိုင်ပွဲကြီးများအကြားမှ စိတ်ဓာတ်ခွန်အားဖြစ်စေမည့် ဇာတ်လမ်း"
  },
  {
    id: "survival_wild",
    label: "ကျွန်းပျက်ပေါ်မှ ရှင်သန်ခြင်းစွန့်စားခန်း (Survival)",
    englishLabel: "Fruit Survival Island Adventure",
    description: "လူသူမရှိသော တောရိုင်းကျွန်းပျက်ကြီးပေါ်သို့ ရောက်ရှိသွားသော အသီးများ၏ အသက်ဘေးမှလွတ်မြောက်အောင် ကြိုးစားရသည့် စိတ်လှုပ်ရှားဖွယ်ဇာတ်လမ်း"
  }
];

export const FRUIT_SUGGESTIONS = [
  { name: "မာလကာသီး (Guava)", value: "Guava", icon: "🍏", label: "မာလကာသီး (Guava)" },
  { name: "ဒူးရင်းသီး (Durian)", value: "Durian", icon: "🍈", label: "ဒူးရင်းသီး (Durian)" },
  { name: "ဖရဲသီး (Watermelon)", value: "Watermelon", icon: "🍉", label: "ဖရဲသီး (Watermelon)" },
  { name: "စတော်ဘယ်ရီ (Strawberry)", value: "Strawberry", icon: "🍓", label: "စတော်ဘယ်ရီ (Strawberry)" },
  { name: "ပန်းသီး (Apple)", value: "Apple", icon: "🍎", label: "ပန်းသီး (Apple)" },
  { name: "သရက်သီး (Mango)", value: "Mango", icon: "🥭", label: "သရက်သီး (Mango)" },
  { name: "ငှက်ပျောသီး (Banana)", value: "Banana", icon: "🍌", label: "ငှက်ပျောသီး (Banana)" },
  { name: "လိမ္မော်သီး (Orange)", value: "Orange", icon: "🍊", label: "လိမ္မော်သီး (Orange)" },
  { name: "နာနတ်သီး (Pineapple)", value: "Pineapple", icon: "🍍", label: "နာနတ်သီး (Pineapple)" },
  { name: "ပိန္နဲသီး (Jackfruit)", value: "Jackfruit", icon: "🍈", label: "ပိန္နဲသီး (Jackfruit)" },
  { name: "သင်္ဘောသီး (Papaya)", value: "Papaya", icon: "🥭", label: "သင်္ဘောသီး (Papaya)" },
  { name: "စပျစ်သီး (Grape)", value: "Grape", icon: "🍇", label: "စပျစ်သီး (Grape)" },
  { name: "အုန်းသီး (Coconut)", value: "Coconut", icon: "🥥", label: "အုန်းသီး (Coconut)" },
  { name: "ထောပတ်သီး (Avocado)", value: "Avocado", icon: "🥑", label: "ထောပတ်သီး (Avocado)" },
  { name: "နဂါးမောက်သီး (Dragon Fruit)", value: "Dragon Fruit", icon: "🐉", label: "နဂါးမောက်သီး (Dragon Fruit)" },
  { name: "ကြက်မောက်သီး (Rambutan)", value: "Rambutan", icon: "🔴", label: "ကြက်မောက်သီး (Rambutan)" },
  { name: "မင်းကွတ်သီး (Mangosteen)", value: "Mangosteen", icon: "🟣", label: "မင်းကွတ်သီး (Mangosteen)" },
  { name: "သလဲသီး (Pomegranate)", value: "Pomegranate", icon: "🍎", label: "သလဲသီး (Pomegranate)" },
  { name: "သစ်တော်သီး (Pear)", value: "Pear", icon: "🍐", label: "သစ်တော်သီး (Pear)" },
  { name: "မက်မွန်သီး (Peach)", value: "Peach", icon: "🍑", label: "မက်မွန်သီး (Peach)" },
  { name: "သံပရာသီး (Lemon)", value: "Lemon", icon: "🍋", label: "သံပရာသီး (Lemon)" },
  { name: "ချယ်ရီသီး (Cherry)", value: "Cherry", icon: "🍒", label: "ချယ်ရီသီး (Cherry)" },
  { name: "ဘလူးဘယ်ရီသီး (Blueberry)", value: "Blueberry", icon: "🫐", label: "ဘလူးဘယ်ရီသီး (Blueberry)" },
  { name: "ကီဝီသီး (Kiwi)", value: "Kiwi", icon: "🥝", label: "ကီဝီသီး (Kiwi)" },
  { name: "လိုင်ချီးသီး (Lychee)", value: "Lychee", icon: "🍒", label: "လိုင်ချီးသီး (Lychee)" },
  { name: "ဇီးသီး (Plum)", value: "Plum", icon: "🟣", label: "ဇီးသီး (Plum)" },
  { name: "ပြောင်းဖူး (Corn)", value: "Corn", icon: "🌽", label: "ပြောင်းဖူး (Corn)" },
  { name: "ကြက်ဟင်းခါးသီး (Bitter Gourd)", value: "Bitter Gourd", icon: "🥒", label: "ကြက်ဟင်းခါးသီး (Bitter Gourd)" },
  { name: "ဂွေးသီး (Hog Plum)", value: "Hog Plum", icon: "🟢", label: "ဂွေးသီး (Hog Plum)" },
  { name: "မုန်လာဥနီ (Carrot)", value: "Carrot", icon: "🥕", label: "မုန်လာဥနီ (Carrot)" },
  { name: "ခရမ်းသီး (Eggplant)", value: "Eggplant", icon: "🍆", label: "ခရမ်းသီး (Eggplant)" },
  { name: "ခရမ်းချဉ်သီး (Tomato)", value: "Tomato", icon: "🍅", label: "ခရမ်းချဉ်သီး (Tomato)" },
  { name: "ငရုတ်သီး (Chili Pepper)", value: "Chili Pepper", icon: "🌶️", label: "ငရုတ်သီး (Chili Pepper)" },
  { name: "ရွှေဖရုံသီး (Pumpkin)", value: "Pumpkin", icon: "🎃", label: "ရွှေဖရုံသီး (Pumpkin)" },
  { name: "သခွားသီး (Cucumber)", value: "Cucumber", icon: "🥒", label: "သခွားသီး (Cucumber)" },
  { name: "အာလူး (Potato)", value: "Potato", icon: "🥔", label: "အာလူး (Potato)" },
  { name: "မှို (Mushroom)", value: "Mushroom", icon: "🍄", label: "မှို (Mushroom)" }
];

export const PARTS_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export type SoundCategory = 'ambient' | 'action' | 'horror' | 'fantasy' | 'tech';

export interface SoundEffect {
  id: string;
  name: string;
  nameBurmese: string;
  category: SoundCategory;
  icon: string;
  keyShortcut?: string;
  duration: number;
  isLoopable?: boolean;
  description: string;
}

export interface AudioDeviceProfile {
  id: string;
  name: string;
  nameBurmese: string;
  type: string;
  description: string;
  eqSettings: {
    bass: number;
    mid: number;
    treble: number;
    reverb: number;
    distortion: number;
  };
}

export interface ModelConfig {
  model: string;
  temperature: number;
  topP: number;
  maxTokens?: number;
  thinkingLevel?: 'LOW' | 'HIGH';
  systemInstruction?: string;
}
