import React, { useState } from "react";
import { Story, PREDEFINED_GENRES, FRUIT_SUGGESTIONS } from "../types";
import { Search, Trash2, BookOpen, Clock, FolderHeart, Calendar, Compass, ArrowRight, ArrowUpDown } from "lucide-react";

interface LibraryProps {
  stories: Story[];
  onSelectStory: (story: Story) => void;
  onDeleteStory: (id: string) => void;
  onNavigateToCreate?: () => void;
  onCreateNew?: () => void;
  onImportStory?: (story: Story) => void;
  language?: 'both' | 'my' | 'en';
}

export default function Library({
  stories,
  onSelectStory,
  onDeleteStory,
  onNavigateToCreate,
  onCreateNew,
}: LibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenreFilter, setSelectedGenreFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title_asc" | "title_desc">("newest");

  const navigateToCreate = onNavigateToCreate || onCreateNew || (() => {});

  const filteredStories = stories.filter((story) => {
    const title = story.title || "";
    const description = story.description || story.synopsis || "";
    const fruit = story.fruit || "";
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      title.toLowerCase().includes(query) ||
      description.toLowerCase().includes(query) ||
      fruit.toLowerCase().includes(query);

    const matchesGenre = selectedGenreFilter === "all" || story.genre === selectedGenreFilter;

    return matchesSearch && matchesGenre;
  });

  const sortedStories = [...filteredStories].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === "title_asc") {
      return a.title.localeCompare(b.title, "my");
    }
    if (sortBy === "title_desc") {
      return b.title.localeCompare(a.title, "my");
    }
    return 0;
  });

  const getGenreLabel = (genreId: string) => {
    if (genreId === "cooking_guide") {
      return "🍳 ဟင်းချက်နည်းလမ်းညွှန်";
    }
    if (genreId === "video-inspired") {
      return "🎬 ဗီဒီယိုလှုံ့ဆော်မှု";
    }
    return PREDEFINED_GENRES.find((g) => g.id === genreId)?.label || genreId || "အခြားအမျိုးအစား";
  };

  const getFruitIcon = (fruitName?: string, story?: Story) => {
    if (fruitName === "Chef Kitchen") return "🍳";
    if (fruitName) {
      const match = FRUIT_SUGGESTIONS.find(
        (f) =>
          f.value.toLowerCase() === fruitName.toLowerCase() ||
          f.label.toLowerCase().includes(fruitName.toLowerCase())
      );
      if (match) return match.icon;
    }
    const combined = `${story?.title || ''} ${story?.description || ''} ${story?.synopsis || ''} ${(story?.tags || []).join(' ')}`.toLowerCase();
    if (combined.includes('apple') || combined.includes('ပန်းသီး')) return '🍎';
    if (combined.includes('durian') || combined.includes('ဒူးရင်း')) return '🍈';
    if (combined.includes('mango') || combined.includes('သရက်')) return '🥭';
    if (combined.includes('strawberr') || combined.includes('စတော်ဘယ်ရီ')) return '🍓';
    if (combined.includes('watermelon') || combined.includes('ဖရဲ')) return '🍉';
    if (combined.includes('banana') || combined.includes('ငှက်ပျော')) return '🍌';
    if (combined.includes('orange') || combined.includes('လိမ္မော်')) return '🍊';
    if (combined.includes('cook') || combined.includes('မီးဖို') || combined.includes('ဟင်းချက်')) return '🍳';
    if (combined.includes('cyber') || combined.includes('မန္တလေး ၂၀၈၈')) return '⚡';
    if (combined.includes('bagan') || combined.includes('ပုဂံ')) return '🏛️';
    return "🍎";
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("my-MM", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "မသိရှိပါ";
    }
  };

  return (
    <div className="space-y-6" id="story-library">
      {/* Filters and Search controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-stone-900 border border-stone-800 p-4 rounded-2xl shadow-lg">
        {/* Search */}
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-500" />
          <input
            type="text"
            placeholder="ဇာတ်လမ်းခေါင်းစဉ် သို့မဟုတ် အသီးအမည်ဖြင့် ရှာဖွေရန်..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
          />
        </div>

        {/* Filters and Sorting Container */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {/* Category/Genre filter dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-stone-500 whitespace-nowrap hidden sm:inline">စစ်ထုတ်မည်:</span>
            <select
              value={selectedGenreFilter}
              onChange={(e) => setSelectedGenreFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-300 focus:outline-none text-sm cursor-pointer"
            >
              <option value="all">ဇာတ်လမ်းအမျိုးအစား အားလုံး</option>
              {PREDEFINED_GENRES.filter((g) => g.id !== "all").map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-stone-500 whitespace-nowrap hidden sm:inline">စီစဉ်မည်:</span>
            <div className="relative w-full sm:w-auto flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-auto pl-4 pr-8 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-300 focus:outline-none text-sm cursor-pointer appearance-none"
              >
                <option value="newest">နောက်ဆုံးရ (Newest)</option>
                <option value="oldest">အစောဆုံးရ (Oldest)</option>
                <option value="title_asc">ခေါင်းစဉ် (က - အ)</option>
                <option value="title_desc">ခေါင်းစဉ် (အ - က)</option>
              </select>
              <ArrowUpDown className="absolute right-3 w-3.5 h-3.5 text-stone-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Stories Grid */}
      {sortedStories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedStories.map((story) => {
            const fruitIcon = getFruitIcon(story.fruit, story);
            const partsCount =
              (story.parts && story.parts.length) ||
              (story.segments && story.segments.length) ||
              (story.scenes && Object.keys(story.scenes).length) ||
              1;

            return (
              <div
                key={story.id}
                className="bg-stone-900 border border-stone-800/80 rounded-2xl p-5 hover:border-stone-700 hover:bg-stone-900/80 transition-all shadow-md hover:shadow-xl flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Badge Row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/10 rounded-lg text-xs font-medium">
                      {getGenreLabel(story.genre)}
                    </span>
                    {story.segments && story.segments.length > 0 ? (
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold">
                        ⏱️ {story.segments.length} ပိုင်း ({story.segments.length * 10}s)
                      </span>
                    ) : (
                      <span className="text-xs text-stone-500 font-mono font-bold">
                        {partsCount} ပိုင်း
                      </span>
                    )}
                  </div>

                  {/* Title and Icon */}
                  <div className="flex items-start gap-2.5">
                    <span className="text-3xl shrink-0 select-none mt-1">{fruitIcon}</span>
                    <h3 className="text-lg font-bold text-stone-100 group-hover:text-amber-400 transition-colors line-clamp-1 font-sans">
                      {story.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-stone-400 line-clamp-3 leading-relaxed">
                    {story.description || story.synopsis || "ဇာတ်လမ်းအကျဉ်း မရှိပါ။"}
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between border-t border-stone-800/60 mt-5 pt-4 text-xs">
                  <span className="text-stone-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(story.createdAt)}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onDeleteStory(story.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 font-semibold rounded-xl transition-all cursor-pointer"
                      title="ဇာတ်လမ်းကို ဖျက်မည်"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ဖျက်မည်</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectStory(story)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-stone-950 border border-stone-800 hover:border-amber-500/50 hover:bg-stone-900 text-stone-300 hover:text-stone-100 font-semibold rounded-xl transition-all cursor-pointer"
                    >
                      <span>ကြည့်ရှုမည်</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-stone-900/40 border border-stone-800 rounded-2xl max-w-xl mx-auto space-y-4 px-6">
          <div className="w-16 h-16 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-center mx-auto text-stone-500">
            <Compass className="w-8 h-8 text-amber-500/50" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-stone-200">ဇာတ်လမ်းများ မရှိသေးပါ</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
              သင်သည် မည်သည့်အသီးဇာတ်လမ်းတိုကိုမျှ မဖန်တီးရသေးပါ။ AI စနစ်ဖြင့် ဖြစ်စေ၊ ကိုယ်တိုင်ဖြစ်စေ စတင်ဖန်တီးနိုင်ပါသည်။
            </p>
          </div>
          <button
            type="button"
            onClick={navigateToCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-stone-950 font-semibold rounded-xl transition-all cursor-pointer"
          >
            <span>ဇာတ်လမ်းသစ် စတင်ဖန်တီးမည်</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export { Library };
