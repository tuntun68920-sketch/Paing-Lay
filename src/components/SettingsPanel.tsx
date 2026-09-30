import React, { useState } from "react";
import { Settings, Eye, EyeOff, Plus, Trash2, Key, Check, AlertCircle, Save, Cpu } from "lucide-react";
import { Settings as SettingsType, ApiKeyItem } from "../types";
import ModelSelector from "./ModelSelector";

interface SettingsPanelProps {
  settings: SettingsType;
  onSaveSettings: (settings: SettingsType) => void;
  onUpdateSettings?: (settings: SettingsType) => void;
  onClose?: () => void;
}

export default function SettingsPanel({
  settings,
  onSaveSettings,
  onUpdateSettings,
  onClose,
}: SettingsPanelProps) {
  const saveCallback = onSaveSettings || onUpdateSettings || (() => {});

  const [isCustomKey, setIsCustomKey] = useState(settings.isCustomKeyEnabled || false);
  const [keysList, setKeysList] = useState<ApiKeyItem[]>(settings.apiKeysList || []);
  const [activeId, setActiveId] = useState<string>(settings.activeKeyId || "");
  const [selectedModel, setSelectedModel] = useState<string>(settings.selectedModel || "gemini-3.8-flash");

  // Form states for adding a new key
  const [newKey, setNewKey] = useState("");
  const [showNewKey, setShowNewKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success indicator
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Show/Hide toggle state for existing keys
  const [visibleKeys, setVisibleKeys] = useState<{ [id: string]: boolean }>({});

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const rawInput = newKey.trim();
    if (!rawInput) {
      setError("ကျေးဇူးပြု၍ API Key(s) ထည့်သွင်းပေးပါ။");
      return;
    }

    // Split by comma (,) or Myanmar comma (၊)
    const keysArray = rawInput
      .split(/[,၊]/)
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (keysArray.length === 0) {
      setError("ကျေးဇူးပြု၍ API Key(s) ထည့်သွင်းပေးပါ။");
      return;
    }

    // Validate that each starts with AIzaSy or AQ
    const invalidKeys = keysArray.filter((k) => !k.startsWith("AIzaSy") && !k.startsWith("AQ"));
    if (invalidKeys.length > 0) {
      setError("အချို့သော Key များသည် မှန်ကန်သော Gemini API Key ပုံစံမဟုတ်ပါ။ (ဥပမာ- 'AIzaSy' သို့မဟုတ် 'AQ.' ဖြင့် စတင်ရပါမည်)");
      return;
    }

    let updatedList = [...keysList];
    const baseIndex = updatedList.length;

    keysArray.forEach((keyVal, idx) => {
      const autoLabel = `Gemini Key #${baseIndex + idx + 1}`;
      const newItem: ApiKeyItem = {
        id: "key_" + Date.now() + "_" + idx,
        label: autoLabel,
        key: keyVal,
        createdAt: new Date().toISOString(),
      };
      updatedList.push(newItem);
    });

    setKeysList(updatedList);

    // If there is no active key, set the first newly added one as active
    let newActiveId = activeId;
    if (!activeId || keysList.length === 0) {
      newActiveId = updatedList[baseIndex].id;
      setActiveId(newActiveId);
    }

    // Reset fields
    setNewKey("");
    setShowNewKey(false);

    // Automatically save immediately
    saveAllSettings(isCustomKey, updatedList, newActiveId, selectedModel);
  };

  const handleDeleteKey = (id: string) => {
    const updatedList = keysList.filter((k) => k.id !== id);
    setKeysList(updatedList);

    let newActiveId = activeId;
    if (activeId === id) {
      newActiveId = updatedList.length > 0 ? updatedList[0].id : "";
      setActiveId(newActiveId);
    }

    saveAllSettings(isCustomKey, updatedList, newActiveId, selectedModel);
  };

  const handleClearAllKeys = () => {
    if (window.confirm("API Key များအားလုံးကို ဖျက်ပြီး အသစ်ပြန်ထည့်ရန် သေချာပါသလား။ (Clear and reset all keys?)")) {
      setKeysList([]);
      setActiveId("");
      saveAllSettings(isCustomKey, [], "", selectedModel);
    }
  };

  const handleSelectActive = (id: string) => {
    setActiveId(id);
    saveAllSettings(isCustomKey, keysList, id, selectedModel);
  };

  const handleToggleCustom = (checked: boolean) => {
    setIsCustomKey(checked);
    saveAllSettings(checked, keysList, activeId, selectedModel);
  };

  const handleModelChange = (newModel: string) => {
    setSelectedModel(newModel);
    saveAllSettings(isCustomKey, keysList, activeId, newModel);
  };

  const saveAllSettings = (customEnabled: boolean, list: ApiKeyItem[], activeKeyId: string, modelId: string) => {
    const activeItem = list.find((k) => k.id === activeKeyId);
    saveCallback({
      ...settings,
      isCustomKeyEnabled: customEnabled,
      apiKeysList: list,
      activeKeyId: activeKeyId,
      geminiApiKey: activeItem ? activeItem.key : "",
      selectedModel: modelId,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6" id="settings-panel">
      {/* Settings Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-stone-100 font-sans tracking-tight">
                API Settings & Keys (လုံခြုံရေး ဆက်တင်များနှင့် API Key အများအပြား သိမ်းဆည်းရန်)
              </h2>
              <p className="text-sm text-stone-400 mt-1">
                စနစ်တစ်ခုလုံးရှိ AI ဝန်ဆောင်မှုများတွင် အလှည့်ကျ အသုံးပြုနိုင်ရန် Gemini API Key အများအပြားကို စိတ်ကြိုက်သိမ်းဆည်းပါ
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
            >
              ပိတ်မည်
            </button>
          )}
        </div>

        {/* Model Selection in Settings */}
        <div className="mt-6">
          <ModelSelector
            selectedModel={selectedModel}
            onSelectModel={handleModelChange}
            compact={false}
          />
        </div>

        {/* Custom Key Toggle */}
        <div className="mt-8 bg-stone-950/50 p-4 rounded-xl border border-stone-800/80">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isCustomKey}
              onChange={(e) => handleToggleCustom(e.target.checked)}
              className="mt-1 w-4.5 h-4.5 rounded border-stone-700 text-amber-500 focus:ring-amber-500/20 bg-stone-900 cursor-pointer"
            />
            <div>
              <span className="block text-sm font-semibold text-stone-200">
                ကိုယ်ပိုင် Gemini API Key အသုံးပြုမည် (Use Custom API Key)
              </span>
              <span className="block text-xs text-stone-400 mt-0.5">
                ဖွင့်ထားပါက အောက်တွင် ထည့်သွင်းသိမ်းဆည်းထားသော API Key များထဲမှ active ဖြစ်နေသည့် Key ကို အသုံးပြု၍ ဇာတ်လမ်းများကို စတင်ဖန်တီးပေးပါမည်။
              </span>
            </div>
          </label>
        </div>
      </div>

      {isCustomKey && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Add Key Form (col-span-5) */}
          <div className="md:col-span-5 bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-stone-200 flex items-center gap-1.5 uppercase tracking-wider border-b border-stone-800 pb-2.5">
              <Plus className="w-4 h-4 text-amber-500" />
              <span>API Key အသစ်ထည့်မည်</span>
            </h3>

            {error && (
              <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg text-red-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAddKey} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-400">
                  Gemini API Key (သို့မဟုတ်) API Keys အများအပြား
                </label>
                <div className="relative">
                  <input
                    type={showNewKey ? "text" : "password"}
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="AIzaSy..., AIzaSy... (ကော်မာ ခံပြီး အများကြီး ထည့်နိုင်သည်)"
                    className="w-full pl-3 pr-10 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 text-xs font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewKey(!showNewKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-500 hover:text-stone-300 transition-colors"
                  >
                    {showNewKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-stone-500 leading-normal">
                  💡 API Key တစ်ခုထက်မက ထည့်လိုပါက ကော်မာ ( , ) ခံပြီး keys များအားလုံးကို တစ်ပြိုင်နက် ကူးယူထည့်သွင်းနိုင်ပါသည်။
                </p>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl transition-all shadow-md text-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Key အသစ် သိမ်းဆည်းမည်</span>
              </button>
            </form>
          </div>

          {/* Keys List (col-span-7) */}
          <div className="md:col-span-7 bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
              <h3 className="text-sm font-bold text-stone-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Key className="w-4 h-4 text-amber-500" />
                <span>သိမ်းဆည်းထားသော API Keys ({keysList.length})</span>
              </h3>
              <div className="flex items-center gap-2">
                {savedSuccess && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-medium animate-pulse">
                    ✓ သိမ်းပြီးပါပြီ
                  </span>
                )}
                {keysList.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllKeys}
                    className="text-[11px] px-2.5 py-1 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    title="Key အားလုံးဖျက်ပြီး အသစ်ထည့်မည်"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>အားလုံးဖျက်မည်</span>
                  </button>
                )}
              </div>
            </div>

            {keysList.length > 0 ? (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                {keysList.map((item) => {
                  const isActive = item.id === activeId;
                  const isVisible = !!visibleKeys[item.id];

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                        isActive
                          ? "bg-stone-950 border-amber-500/50 shadow-md shadow-amber-500/2"
                          : "bg-stone-950/40 border-stone-800/80 hover:bg-stone-950/80"
                      }`}
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleSelectActive(item.id)}
                            className="text-left font-bold text-stone-200 text-sm hover:text-amber-400 transition-colors truncate block max-w-full cursor-pointer"
                          >
                            {item.label}
                          </button>
                          {isActive && (
                            <span className="px-1.5 py-0.5 bg-amber-500 text-stone-950 text-[9px] font-extrabold rounded-md uppercase tracking-wider">
                              ACTIVE
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-stone-500 select-all truncate block">
                            {isVisible ? item.key : "••••••••••••••••••••••••••••••••"}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleKeyVisibility(item.id)}
                            className="p-0.5 text-stone-600 hover:text-stone-400"
                            title={isVisible ? "ဝှက်မည်" : "ပြသမည်"}
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => handleSelectActive(item.id)}
                            className="px-2.5 py-1.5 bg-stone-900 border border-stone-800 hover:border-stone-700 hover:bg-stone-800 text-stone-400 hover:text-stone-200 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            အသုံးပြုမည်
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteKey(item.id)}
                          className="p-2 hover:bg-red-500/10 text-stone-500 hover:text-red-500 rounded-lg transition-all cursor-pointer"
                          title="ဖျက်မည်"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-stone-950/20 border border-stone-800/40 rounded-xl">
                <Key className="w-8 h-8 text-stone-700 mx-auto mb-2" />
                <p className="text-xs text-stone-500">သိမ်းဆည်းထားသော API Key မရှိသေးပါ။ ဘယ်ဘက်မှ စတင်ထည့်သွင်းပါ။</p>
              </div>
            )}

            <div className="p-3 bg-stone-950/50 rounded-xl border border-stone-800/40 flex gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500/80 shrink-0 mt-0.5" />
              <p className="text-[10.5px] text-stone-500 leading-relaxed">
                သင်၏ Keys များအားလုံးကို သင်၏ browser LocalStorage တွင်သာ စိတ်ချရစွာ သိမ်းဆည်းပေးထားပါသည်။ မည်သည့်အပြင်ပဆာဗာ သို့မဟုတ် Cloud သို့မျှ ပေးပို့သိမ်းဆည်းခြင်း မပြုလုပ်ပါ။
              </p>
            </div>
          </div>
        </div>
      )}

      {!isCustomKey && (
        <div className="max-w-2xl mx-auto p-5 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl flex items-start gap-3">
          <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-emerald-400">
              စနစ်အတွင်းပါဝင်ပြီးသား Developer API Key ကို အသုံးပြုနေပါသည်
            </p>
            <p className="text-xs text-stone-400 leading-relaxed">
              စနစ်တွင် သတ်မှတ်ပေးထားသော Fallback Server-side Key ကို အလိုအလျောက် သုံးစွဲနေသဖြင့် ကိုယ်ပိုင် API Key ထည့်ရန်မလိုဘဲ ဇာတ်လမ်းများကို ချက်ချင်း စတင်ဖန်တီးနိုင်ပါသည်။
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export { SettingsPanel };
