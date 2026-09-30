// Web Audio API Synthesizer Engine for Story Sound Effects & Atmospheric Audio
// Generates rich, immersive audio effects natively in browser without requiring external audio files.

export type SoundEffectType =
  | "fear" // ကြောက်ရွံ့မှု / တစ္ဆေ / သည်းထိတ်ရင်ဖို
  | "startle" // လန့်ဖျပ်ခြင်း / ရုတ်တရက် အလန့်တကြား
  | "surprise" // အံ့အားသင့်ခြင်း / surprise ဖြစ်ခြင်း
  | "happy" // ပျော်ရွှင်ခြင်း / ရယ်မောရွှင်လန်းခြင်း
  | "sad" // ဝမ်းနည်းခြင်း / မျက်ရည်ကျခြင်း
  | "suspense" // လျှို့ဝှက်ဆန်းကြယ် / တင်းမာမှု
  | "romantic" // အချစ် / ရိုမန်းတစ် / နွေးထွေးမှု
  | "comedy" // ဟာသ / ရယ်စရာ / ကာတွန်းသံ
  | "action" // လှုပ်ရှားမှု / အက်ရှင် / ပြင်းထန်သော အသံ
  | "nature" // သဘာဝ / အေးချမ်းဆိတ်ငြိမ်မှု
  | "chime" // အသိပေးချက် / အောင်မြင်မှု
  | "magic"; // မှော်ဆန်သော / အံ့ဖွယ်သံ

export interface SoundPreset {
  id: SoundEffectType;
  labelBurmese: string;
  labelEnglish: string;
  icon: string;
  descriptionBurmese: string;
  samplePromptTag: string;
  color: string;
}

export const SOUND_PRESETS: SoundPreset[] = [
  {
    id: "fear",
    labelBurmese: "ကြောက်လန့်သံ (Fear / Horror)",
    labelEnglish: "Fear & Spooky Atmosphere",
    icon: "👻",
    descriptionBurmese: "ကြောက်စရာ၊ သရဲတစ္ဆေ၊ အမှောင်ထုနှင့် သည်းထိတ်ရင်ဖို အသံဝန်းကျင်",
    samplePromptTag: "[fear trembling voice by character | sound fx: eerie thunder, creepy whisper, dark rumble]",
    color: "from-purple-900/40 to-stone-900",
  },
  {
    id: "startle",
    labelBurmese: "လန့်ဖျပ်သံ (Startle / Jumpscare)",
    labelEnglish: "Sudden Startle & Shock Stinger",
    icon: "⚡",
    descriptionBurmese: "ရုတ်တရက် လန့်သွားခြင်း၊ အလန့်တကြား အော်သံနှင့် နှလုံးခုန်ရပ်မတတ် shock သံ",
    samplePromptTag: "[startled gasp voice by character | sound fx: sudden jumpscare hit, loud gasp, heart thump]",
    color: "from-amber-900/40 to-stone-900",
  },
  {
    id: "surprise",
    labelBurmese: "Surprise သံ (Surprise / Wonder)",
    labelEnglish: "Surprise & Magical Chime",
    icon: "✨",
    descriptionBurmese: "အံ့အားသင့်ဖွယ်ရာ၊ surprise ဖြစ်သွားသော အောင်မြင်ကြည်နူးသံနှင့် ကြယ်စင်လဲ့သံ",
    samplePromptTag: "[surprised cheerful voice by character | sound fx: sparkling magical chime, pleasant fanfare pop]",
    color: "from-yellow-900/40 to-stone-900",
  },
  {
    id: "happy",
    labelBurmese: "ရွှင်လန်းပျော်ရွှင်သံ (Happy / Joy)",
    labelEnglish: "Happy & Playful Melody",
    icon: "🎉",
    descriptionBurmese: "ပျော်ရွှင်ကြည်နူးဖွယ်ရာ၊ အောင်ပွဲခံရွှင်ပြသော အသံနေအထား",
    samplePromptTag: "[happy cheerful voice by character | sound fx: joyful chime chords, celebratory bells]",
    color: "from-emerald-900/40 to-stone-900",
  },
  {
    id: "sad",
    labelBurmese: "ဝမ်းနည်းကြေကွဲသံ (Sad / Crying)",
    labelEnglish: "Sadness & Melancholy Strings",
    icon: "😢",
    descriptionBurmese: "ဝမ်းနည်းမျက်ရည်ကျခြင်း၊ ကြေကွဲဆို့နင့်ဖွယ်ရာ အသံနှင့် မိုးစက်သံ",
    samplePromptTag: "[sad crying voice by character | sound fx: mournful violin swell, gentle raindrops]",
    color: "from-blue-900/40 to-stone-900",
  },
  {
    id: "suspense",
    labelBurmese: "တင်းမာလျှို့ဝှက်သံ (Suspense / Tension)",
    labelEnglish: "Mystery & Heartbeat Tension",
    icon: "🕵️",
    descriptionBurmese: "လျှို့ဝှက်ဆန်းကြယ်မှု၊ နာရီစက္ကန့်တံခုန်သံနှင့် ရင်ခုန်စရာ တင်းမာမှု",
    samplePromptTag: "[suspense whisper voice by character | sound fx: ticking clock, intense low cello drone]",
    color: "from-stone-800 to-stone-950",
  },
  {
    id: "romantic",
    labelBurmese: "အချစ်နွေးထွေးသံ (Romantic / Love)",
    labelEnglish: "Warm Romantic Harp & Glow",
    icon: "💖",
    descriptionBurmese: "ချစ်သူစုံတွဲ၊ ကြည်နူးဖွယ် အချစ်ကဗျာနှင့် စောင်းသံညင်းညင်းလေး",
    samplePromptTag: "[romantic soft loving voice by character | sound fx: gentle acoustic harp shimmer, warm breeze]",
    color: "from-pink-900/40 to-stone-900",
  },
  {
    id: "comedy",
    labelBurmese: "ဟာသရယ်စရာသံ (Comedy / Boing)",
    labelEnglish: "Funny Cartoon Boing & Wobble",
    icon: "🤪",
    descriptionBurmese: "ရယ်စရာ ဟာသအလွဲများ၊ ကာတွန်းဆန်ဆန် Boing နှင့် ချော်လဲသံ",
    samplePromptTag: "[funny comical voice by character | sound fx: cartoon boing spring, funny slide whistle]",
    color: "from-orange-900/40 to-stone-900",
  },
  {
    id: "action",
    labelBurmese: "အက်ရှင်ပြင်းထန်သံ (Action / Whoosh)",
    labelEnglish: "Cinematic Impact & Whoosh",
    icon: "🔥",
    descriptionBurmese: "တိုက်ခိုက်လှုပ်ရှားမှု၊ လေတိုးသံ dynamic whoosh နှင့် ပြင်းထန်သော impact သံ",
    samplePromptTag: "[determined action voice by character | sound fx: cinematic deep impact, energetic whoosh]",
    color: "from-red-900/40 to-stone-900",
  },
  {
    id: "nature",
    labelBurmese: "သဘာဝအေးချမ်းသံ (Peaceful Nature)",
    labelEnglish: "Calm Forest & Wind Chime",
    icon: "🍃",
    descriptionBurmese: "တောတောင်သဘာဝ၊ ငြိမ်သက်အေးချမ်းသော လေညှင်းသံနှင့် ခေါင်းလောင်းသံ",
    samplePromptTag: "[calm peaceful voice by character | sound fx: gentle singing bowl, rustling leaves]",
    color: "from-teal-900/40 to-stone-900",
  },
];

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx || audioCtx.state === "closed") {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Master synthesizer functions for each emotion
export function playSound(type: SoundEffectType | string, volume = 0.5): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Normalize or map alias/legacy sound keys
    let resolvedType: SoundEffectType | string = type;
    const t = String(type).toLowerCase();
    if (t === "suspense_sting" || t === "shock" || t === "jumpscare") resolvedType = "startle";
    else if (t === "magic_sparkle" || t === "sparkle") resolvedType = "magic";
    else if (t === "thunder" || t === "spooky" || t === "door_creak") resolvedType = "fear";
    else if (t === "rain" || t === "wind" || t === "campfire") resolvedType = "nature";
    else if (t === "heartbeat" || t === "clock_tick" || t === "footsteps") resolvedType = "suspense";
    else if (t === "explosion" || t === "sword_clash" || t === "laser") resolvedType = "action";
    else if (t === "victory_fanfare" || t === "celebrate") resolvedType = "happy";
    else if (t === "cyber_glitch") resolvedType = "surprise";

    switch (resolvedType) {
      case "fear": {
        // Low scary ominous drone + dissonant high ghostly harmonic
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.01, now);
        masterGain.gain.exponentialRampToValueAtTime(volume * 0.7, now + 0.3);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
        masterGain.connect(ctx.destination);

        // Sub bass rumble
        const osc1 = ctx.createOscillator();
        osc1.type = "sawtooth";
        osc1.frequency.setValueAtTime(55, now);
        osc1.frequency.linearRampToValueAtTime(45, now + 2.2);

        // Lowpass filter for deep rumbling sound
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(140, now);
        filter.frequency.linearRampToValueAtTime(90, now + 2.2);

        osc1.connect(filter);
        filter.connect(masterGain);

        // High dissonant eerie screech (spooky ghost overtone)
        const osc2 = ctx.createOscillator();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(840, now);
        osc2.frequency.linearRampToValueAtTime(875, now + 1.2);
        osc2.frequency.linearRampToValueAtTime(820, now + 2.2);

        const osc2Gain = ctx.createGain();
        osc2Gain.gain.setValueAtTime(0.001, now);
        osc2Gain.gain.linearRampToValueAtTime(volume * 0.15, now + 0.5);
        osc2Gain.gain.linearRampToValueAtTime(0.001, now + 2.2);

        osc2.connect(osc2Gain);
        osc2Gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 2.5);
        osc2.stop(now + 2.5);
        break;
      }

      case "startle": {
        // Sudden dramatic brass stinger & sharp shock hit
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(volume * 0.9, now);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        masterGain.connect(ctx.destination);

        // Sharp descending cluster
        const freqs = [320, 480, 520, 680];
        freqs.forEach((freq) => {
          const osc = ctx.createOscillator();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq * 1.5, now);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.3);
          osc.connect(masterGain);
          osc.start(now);
          osc.stop(now + 1.2);
        });

        // Fast low impact thud (heart skip)
        const subOsc = ctx.createOscillator();
        subOsc.type = "sine";
        subOsc.frequency.setValueAtTime(160, now);
        subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.4);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(volume * 0.8, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        subOsc.connect(subGain);
        subGain.connect(ctx.destination);

        subOsc.start(now);
        subOsc.stop(now + 0.6);
        break;
      }

      case "surprise":
      case "magic": {
        // Sparkling upward magical arpeggio (C5 -> E5 -> G5 -> B5 -> D6 -> G6)
        const notes = [523.25, 659.25, 783.99, 987.77, 1174.66, 1567.98];
        notes.forEach((freq, idx) => {
          const noteTime = now + idx * 0.07;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0.01, noteTime);
          gain.gain.linearRampToValueAtTime(volume * 0.4, noteTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.8);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(noteTime);
          osc.stop(noteTime + 0.85);
        });
        break;
      }

      case "happy":
      case "chime": {
        // Cheerful major chord bells (F4 -> A4 -> C5 -> F5)
        const chord = [349.23, 440.0, 523.25, 698.46];
        chord.forEach((freq, i) => {
          const noteTime = now + i * 0.09;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0.01, noteTime);
          gain.gain.linearRampToValueAtTime(volume * 0.35, noteTime + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 1.2);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(noteTime);
          osc.stop(noteTime + 1.3);
        });
        break;
      }

      case "sad": {
        // Sorrowful minor swell with deep melancholic harmonic
        const minorNotes = [220.0, 261.63, 329.63, 196.0]; // A3, C4, E4, G3
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.01, now);
        masterGain.gain.linearRampToValueAtTime(volume * 0.4, now + 0.6);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);
        masterGain.connect(ctx.destination);

        minorNotes.forEach((freq) => {
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.linearRampToValueAtTime(freq * 0.98, now + 2.5); // subtle sad detune
          osc.connect(masterGain);
          osc.start(now);
          osc.stop(now + 2.8);
        });
        break;
      }

      case "suspense": {
        // Pulsing ticking suspense pulse (clock tick + low tone)
        const ticks = [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5];
        ticks.forEach((offset, idx) => {
          const tickTime = now + offset;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "square";
          osc.frequency.setValueAtTime(900 + idx * 80, tickTime); // rising pitch tension

          gain.gain.setValueAtTime(volume * 0.2, tickTime);
          gain.gain.exponentialRampToValueAtTime(0.001, tickTime + 0.05);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(tickTime);
          osc.stop(tickTime + 0.06);
        });

        // Low suspense drone
        const droneOsc = ctx.createOscillator();
        const droneGain = ctx.createGain();
        droneOsc.type = "sawtooth";
        droneOsc.frequency.setValueAtTime(65, now);
        droneOsc.frequency.linearRampToValueAtTime(80, now + 1.8);

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(180, now);

        droneGain.gain.setValueAtTime(0.01, now);
        droneGain.gain.linearRampToValueAtTime(volume * 0.3, now + 0.4);
        droneGain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);

        droneOsc.connect(filter);
        filter.connect(droneGain);
        droneGain.connect(ctx.destination);

        droneOsc.start(now);
        droneOsc.stop(now + 2.0);
        break;
      }

      case "romantic": {
        // Soft romantic harp shimmer (E4, G#4, B4, E5, G#5)
        const harp = [329.63, 415.3, 493.88, 659.25, 830.61];
        harp.forEach((freq, idx) => {
          const noteTime = now + idx * 0.12;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0.01, noteTime);
          gain.gain.linearRampToValueAtTime(volume * 0.35, noteTime + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 1.4);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(noteTime);
          osc.stop(noteTime + 1.5);
        });
        break;
      }

      case "comedy": {
        // Classic cartoon spring boing (fast rising wobble)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.25);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.45);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.65);

        gain.gain.setValueAtTime(volume * 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.9);
        break;
      }

      case "action": {
        // Dynamic cinematic impact and whoosh
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.6);

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(80, now + 0.6);

        gain.gain.setValueAtTime(volume * 0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.85);
        break;
      }

      case "nature": {
        // Serene wind chime harmonic swell
        const chimeNotes = [440, 554.37, 659.25, 880];
        chimeNotes.forEach((freq, idx) => {
          const noteTime = now + idx * 0.15;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0.01, noteTime);
          gain.gain.linearRampToValueAtTime(volume * 0.25, noteTime + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 2.0);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(noteTime);
          osc.stop(noteTime + 2.1);
        });
        break;
      }

      default:
        // Default pleasant chime
        playSound("surprise", volume);
        break;
    }
  } catch (err) {
    console.warn("Web Audio playback note:", err);
  }
}

// Smart emotion sound classifier from text or tag
export function detectSoundEffectType(text: string): SoundEffectType {
  const t = (text || "").toLowerCase();

  if (
    t.includes("startle") ||
    t.includes("jumpscare") ||
    t.includes("shock") ||
    t.includes("gasp") ||
    t.includes("လန့်") ||
    t.includes("အလန့်") ||
    t.includes("ထိတ်လန့်") ||
    t.includes("ရုတ်တရက်")
  ) {
    return "startle";
  }

  if (
    t.includes("fear") ||
    t.includes("scare") ||
    t.includes("scary") ||
    t.includes("horror") ||
    t.includes("creepy") ||
    t.includes("eerie") ||
    t.includes("spooky") ||
    t.includes("ghost") ||
    t.includes("thunder") ||
    t.includes("dark") ||
    t.includes("ကြောက်") ||
    t.includes("သရဲ") ||
    t.includes("တစ္ဆေ") ||
    t.includes("သည်းထိတ်")
  ) {
    return "fear";
  }

  if (
    t.includes("surprise") ||
    t.includes("wonder") ||
    t.includes("amaze") ||
    t.includes("astonish") ||
    t.includes("sparkle") ||
    t.includes("magic") ||
    t.includes("အံ့အားသင့်") ||
    t.includes("အံ့သြ") ||
    t.includes("မျက်လုံးပြူး") ||
    t.includes("ထူးဆန်း")
  ) {
    return "surprise";
  }

  if (
    t.includes("sad") ||
    t.includes("cry") ||
    t.includes("crying") ||
    t.includes("tear") ||
    t.includes("weep") ||
    t.includes("grief") ||
    t.includes("mourn") ||
    t.includes("rain") ||
    t.includes("ဝမ်းနည်း") ||
    t.includes("မျက်ရည်") ||
    t.includes("ကြေကွဲ") ||
    t.includes("ဆို့နင့်")
  ) {
    return "sad";
  }

  if (
    t.includes("funny") ||
    t.includes("comedy") ||
    t.includes("laugh") ||
    t.includes("chuckle") ||
    t.includes("boing") ||
    t.includes("cartoon") ||
    t.includes("joke") ||
    t.includes("ဟာသ") ||
    t.includes("ရယ်စရာ") ||
    t.includes("ရယ်မော") ||
    t.includes("အလွဲ")
  ) {
    return "comedy";
  }

  if (
    t.includes("romantic") ||
    t.includes("love") ||
    t.includes("sweet") ||
    t.includes("couple") ||
    t.includes("hug") ||
    t.includes("kiss") ||
    t.includes("အချစ်") ||
    t.includes("ရိုမန်းတစ်") ||
    t.includes("ချစ်သူ") ||
    t.includes("နွေးထွေး")
  ) {
    return "romantic";
  }

  if (
    t.includes("suspense") ||
    t.includes("tension") ||
    t.includes("mystery") ||
    t.includes("secret") ||
    t.includes("whisper") ||
    t.includes("detective") ||
    t.includes("လျှို့ဝှက်") ||
    t.includes("တင်းမာ") ||
    t.includes("ရင်ခုန်") ||
    t.includes("စုံထောက်")
  ) {
    return "suspense";
  }

  if (
    t.includes("action") ||
    t.includes("fight") ||
    t.includes("run") ||
    t.includes("chase") ||
    t.includes("boom") ||
    t.includes("whoosh") ||
    t.includes("attack") ||
    t.includes("အက်ရှင်") ||
    t.includes("တိုက်ခိုက်") ||
    t.includes("ပြေး") ||
    t.includes("ပြင်းထန်")
  ) {
    return "action";
  }

  if (
    t.includes("nature") ||
    t.includes("calm") ||
    t.includes("peace") ||
    t.includes("forest") ||
    t.includes("wind") ||
    t.includes("river") ||
    t.includes("သဘာဝ") ||
    t.includes("အေးချမ်း") ||
    t.includes("တောတောင်")
  ) {
    return "nature";
  }

  if (
    t.includes("happy") ||
    t.includes("joy") ||
    t.includes("celebrate") ||
    t.includes("cheer") ||
    t.includes("smile") ||
    t.includes("ပျော်") ||
    t.includes("ရွှင်လန်း") ||
    t.includes("အောင်ပွဲ")
  ) {
    return "happy";
  }

  return "surprise";
}

// Compatibility wrapper for soundEngine
export const soundEngine = {
  playSound: (id: string, vol = 0.5) => playSound(id, vol),
  setSfxVolume: (_v: number) => {},
  setMasterVolume: (_v: number) => {},
  setAmbienceVolume: (_v: number) => {},
  applyDeviceProfile: (_p: any) => {},
};
