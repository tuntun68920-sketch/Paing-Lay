import React, { useState } from "react";
import { SOUND_PRESETS, SoundPreset, SoundEffectType, playSound } from "../utils/soundEffects";
import { Volume2, Play, Check, Copy, Sparkles, X, Music } from "lucide-react";
import { SoundEffect, AudioDeviceProfile } from "../types";

export interface SoundEffectBoardProps {
  isOpen?: boolean;
  onClose?: () => void;
  soundEffects?: SoundEffect[];
  deviceProfiles?: AudioDeviceProfile[];
  activeDeviceId?: string;
  onSelectDevice?: (deviceId: string) => void;
  language?: 'both' | 'my' | 'en';
  compactMode?: boolean;
  onInsertCue?: (soundTag: string) => void;
}

export default function SoundEffectBoard({
  isOpen = true,
  onClose,
  onInsertCue,
}: SoundEffectBoardProps) {
  if (!isOpen) return null;

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.6);

  const handlePlaySound = (preset: SoundPreset) => {
    setPlayingId(preset.id);
    playSound(preset.id, volume);
    setTimeout(() => {
      setPlayingId((prev) => (prev === preset.id ? null : prev));
    }, 1800);
  };

  const handleCopyTag = async (preset: SoundPreset) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(preset.samplePromptTag);
      }
      if (onInsertCue) {
        onInsertCue(preset.samplePromptTag);
      }
      setCopiedId(preset.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-2xl space-y-5" id="sound-effect-board">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <span>ဇာတ်လမ်း အသံစနစ်များ (Story Sound FX & Atmosphere)</span>
              <span className="px-2 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full text-[10px] font-bold">
                Sound System
              </span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              ကြောက်လန့်သံ၊ အလန့်တကြားသံ၊ Surprise သံ၊ ဝမ်းနည်းသံ၊ ပျော်ရွှင်သံစသော အသံများကို နားဆင်စမ်းသပ်ပြီး Prompt Tags များ ရယူနိုင်ပါသည်
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-stone-800 text-stone-400 hover:text-stone-100 rounded-xl transition-colors cursor-pointer"
            title="ပိတ်မည်"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Sound Volume Slider */}
      <div className="flex items-center justify-between bg-stone-950/60 p-3 rounded-xl border border-stone-800/80 text-xs">
        <div className="flex items-center gap-2 text-stone-300">
          <Music className="w-4 h-4 text-amber-400" />
          <span>အသံပမာဏ (Sound FX Volume):</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-28 sm:w-40 accent-amber-500 cursor-pointer"
          />
          <span className="font-mono text-amber-400 text-xs font-bold w-10 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Sound Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
        {SOUND_PRESETS.map((preset) => {
          const isPlaying = playingId === preset.id;
          const isCopied = copiedId === preset.id;

          return (
            <div
              key={preset.id}
              className={`p-3.5 rounded-xl border transition-all relative overflow-hidden bg-gradient-to-br ${preset.color} ${
                isPlaying ? "border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40" : "border-stone-800/80 hover:border-stone-700"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-stone-950/70 border border-stone-700/50 flex items-center justify-center text-lg shrink-0">
                    {preset.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-100">{preset.labelBurmese}</h4>
                    <span className="text-[10px] text-stone-400 font-mono">{preset.labelEnglish}</span>
                  </div>
                </div>

                {/* Play Button */}
                <button
                  type="button"
                  onClick={() => handlePlaySound(preset)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-md ${
                    isPlaying
                      ? "bg-amber-500 text-stone-950 font-bold animate-pulse"
                      : "bg-stone-950/80 hover:bg-amber-500 hover:text-stone-950 text-amber-400 border border-amber-500/30"
                  }`}
                  title="အသံစမ်းသပ်ဖွင့်မည်"
                >
                  <Play className={`w-3.5 h-3.5 ${isPlaying ? "fill-stone-950" : "fill-amber-400"}`} />
                  <span>{isPlaying ? "ဖွင့်နေသည်..." : "စမ်းဖွင့်ရန်"}</span>
                </button>
              </div>

              <p className="text-[11px] text-stone-300 mt-2 font-sans leading-relaxed">
                {preset.descriptionBurmese}
              </p>

              {/* Sample Prompt Tag */}
              <div className="mt-2.5 pt-2 border-t border-stone-800/60 flex items-center justify-between gap-2">
                <code className="text-[10px] font-mono text-amber-300/90 truncate max-w-[200px] sm:max-w-[240px] bg-stone-950/60 px-2 py-0.5 rounded border border-stone-800/40">
                  {preset.samplePromptTag}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopyTag(preset)}
                  className="px-2 py-1 bg-stone-950 hover:bg-stone-800 border border-stone-700/60 text-stone-300 hover:text-amber-400 rounded-md text-[10px] font-medium transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                  title="Tag ကူးယူရန်"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">ကူးပြီး</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Tag ကူးမည်</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { SoundEffectBoard };
