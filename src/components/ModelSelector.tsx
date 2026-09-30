import React from "react";
import { Cpu, CheckCircle2, Zap, Sparkles, Shield, Compass, Brain } from "lucide-react";
import { GEMINI_MODEL_OPTIONS, GeminiModelOption, ModelConfig } from "../types";

export interface ModelSelectorProps {
  selectedModel?: string;
  onSelectModel?: (modelId: string) => void;
  config?: ModelConfig;
  onChange?: (newConfig: ModelConfig) => void;
  compact?: boolean;
}

export default function ModelSelector({
  selectedModel,
  onSelectModel,
  config,
  onChange,
  compact = false,
}: ModelSelectorProps) {
  const currentModelId = selectedModel || config?.model || GEMINI_MODEL_OPTIONS[0].id;
  const currentModel =
    GEMINI_MODEL_OPTIONS.find((m) => m.id === currentModelId) ||
    GEMINI_MODEL_OPTIONS[0];

  const handleSelect = (modelId: string) => {
    if (onSelectModel) {
      onSelectModel(modelId);
    }
    if (onChange && config) {
      onChange({ ...config, model: modelId });
    }
  };

  if (compact) {
    return (
      <div
        id="model-selector-compact"
        className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-semibold text-stone-200">
                Gemini Model Version (AI ဗားရှင်း ရွေးချယ်ရန်)
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-amber-400 font-medium bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                Manual Lock 🔒
              </span>
            </div>
          </div>
          <div className="text-xs text-stone-400">
            လက်ရှိ: <span className="text-amber-400 font-semibold">{currentModel.name}</span>
          </div>
        </div>

        {/* Model button chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {GEMINI_MODEL_OPTIONS.map((model) => {
            const isSelected = currentModelId === model.id;
            return (
              <button
                type="button"
                key={model.id}
                id={`model-btn-${model.id}`}
                onClick={() => handleSelect(model.id)}
                className={`relative flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/15 border-amber-500 text-stone-100 shadow-md ring-1 ring-amber-500/30"
                    : "bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 hover:border-stone-700"
                }`}
              >
                <div className="flex items-center justify-between w-full gap-1">
                  <span
                    className={`text-xs font-bold truncate ${
                      isSelected ? "text-amber-400" : "text-stone-300"
                    }`}
                  >
                    {model.badge}
                  </span>
                  {isSelected ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : model.isPro ? (
                    <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-500/15 px-1 rounded shrink-0">
                      PRO
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-500 shrink-0">
                      {model.speed.split(" ")[0]}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-stone-400 mt-1 line-clamp-1">
                  {model.tag.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Full detailed card mode (e.g. For Settings page or detailed view)
  return (
    <div
      id="model-selector-full"
      className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-100">
              Gemini Model Version (AI ဗားရှင်း ရွေးချယ်မှု စနစ်)
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              အလိုအလျောက် မော်ဒယ်ချိန်းခြင်း မပြုလုပ်စေဘဲ သင်အသုံးပြုလိုသော Gemini Model ကို တိုက်ရိုက် ရွေးချယ်သတ်မှတ်ပါ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium rounded-lg shrink-0">
          <Shield className="w-3.5 h-3.5" />
          <span>Manual Control</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {GEMINI_MODEL_OPTIONS.map((model) => {
          const isSelected = currentModelId === model.id;
          return (
            <button
              type="button"
              key={model.id}
              id={`model-card-${model.id}`}
              onClick={() => handleSelect(model.id)}
              className={`flex flex-col text-left p-4 rounded-xl border transition-all cursor-pointer relative ${
                isSelected
                  ? "bg-amber-500/10 border-amber-500/80 shadow-lg ring-1 ring-amber-500/30"
                  : "bg-stone-950/50 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-850 hover:border-stone-700"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-semibold text-sm ${
                      isSelected ? "text-amber-400" : "text-stone-200"
                    }`}
                  >
                    {model.name}
                  </span>
                  {model.isPro && (
                    <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-500/20 border border-purple-500/30 px-1.5 py-0.5 rounded">
                      Pro
                    </span>
                  )}
                </div>
                {isSelected ? (
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-stone-700 shrink-0" />
                )}
              </div>

              <div className="text-xs text-amber-400/90 font-medium mb-1.5">
                {model.tag}
              </div>

              <p className="text-xs text-stone-400 line-clamp-2 mb-3 leading-relaxed">
                {model.description}
              </p>

              <div className="mt-auto pt-2 border-t border-stone-800/60 flex items-center justify-between text-[11px] text-stone-500">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-stone-400" />
                  {model.speed}
                </span>
                <span className="font-mono text-[10px] text-stone-400">
                  {model.id}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-3 bg-stone-950/60 border border-stone-800/60 rounded-xl text-xs text-stone-400 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          💡 <strong>အကြံပြုချက်:</strong> ဗားရှင်းသစ် <strong>Gemini 3.8 Flash</strong>၊ အတည်ငြိမ်ဆုံး <strong>Gemini 2.5 Flash</strong> နှင့် <strong>Gemini 3.7 Flash</strong> တို့ဖြင့် အသုံးပြုနိုင်ပါသည်။ မည်သည့် Model ရွေးချယ်ထားစေကာမူ Error မဖြစ်စေရန် အရန်စနစ်ဖြင့် အလိုအလျောက် ထိန်းညှိပေးထားပါသည်။
        </span>
      </div>
    </div>
  );
}

export { ModelSelector };
