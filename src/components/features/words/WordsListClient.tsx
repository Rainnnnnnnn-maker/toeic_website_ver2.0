 "use client";
import { useMemo, useState, useRef } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import Link from "next/link";
import type { Word } from "@/data/words";
import { X } from "lucide-react";
import TabNavigation, { TabId } from "@/components/common/TabNavigation";

type Props = {
  importantWords: Word[];
  mediumWords: Word[];
  highWords: Word[];
};

export default function WordsListClient({ importantWords, mediumWords, highWords }: Props) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TabId>('important');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pageSize = 20;

  const { importantWithCategory, mediumWithCategory, highWithCategory, allWithCategory } = useMemo(() => {
    const imp = importantWords.map(w => ({ ...w, category: 'important' as const }));
    const med = mediumWords.map(w => ({ ...w, category: 'medium' as const }));
    const high = highWords.map(w => ({ ...w, category: 'high' as const }));
    return {
      importantWithCategory: imp,
      mediumWithCategory: med,
      highWithCategory: high,
      allWithCategory: [...imp, ...med, ...high]
    };
  }, [importantWords, mediumWords, highWords]);

  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextQuery = e.target.value;
    setQuery(nextQuery);
    setPage(1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  const handleClear = () => {
    setQuery("");
    setPage(1);
    inputRef.current?.focus();
  };

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setQuery(""); // タブ切り替え時に検索をクリア
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      if (activeTab === 'important') return importantWithCategory;
      if (activeTab === 'medium') return mediumWithCategory;
      return highWithCategory;
    }

    // ワイルドカード検索 (*) のサポート
    if (q.includes('*')) {
      try {
        // 特殊文字をエスケープし、* を .* に置換
        // 注意: エスケープ対象に * も含めることで、後続の replace で確実に .* に変換できるようにする
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = escaped.replace(/\\\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`, 'i');
        return allWithCategory.filter((w) => regex.test(w.term));
      } catch {
        return [];
      }
    }

    return allWithCategory.filter((w) => w.term.toLowerCase().startsWith(q));
  }, [query, activeTab, importantWithCategory, mediumWithCategory, highWithCategory, allWithCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const current = filtered.slice(start, start + pageSize);

  return (
    <section className="flex flex-col gap-3">
      <div className="mb-0">
        {query ? (
          <div>
             <h2 className="text-lg font-bold text-slate-800 mb-1">検索結果: {filtered.length}件</h2>
          </div>
        ) : activeTab === 'important' ? (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">最重要単語（TOEIC 600点レベル）</h2>
            <p className="text-xs leading-relaxed text-slate-600">
              TOEICスコアアップのために最初に覚えるべき基礎単語です。
              まずはこのリストを完璧にすることで、スコアアップを目指しましょう。
            </p>
          </div>
        ) : activeTab === 'medium' ? (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">中級単語（TOEIC 730〜800点レベル）</h2>
            <p className="text-xs leading-relaxed text-slate-600">
              さらなるスコアアップを目指すための応用単語です。
              やや難易度の高い単語ですが、Part 5、Part 6、Part 7の問題対策としても有効です。
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">高難易度単語（TOEIC 800点以上レベル）</h2>
            <p className="text-xs leading-relaxed text-slate-600">
              800点以上の高スコアを目指すための上級単語です。
              Part 7の長文読解や、より高度なビジネス表現に対応するための語彙力を強化します。
            </p>
          </div>
        )}
      </div>

      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full flex-1 sm:mr-2">
          <div className={`absolute bottom-full left-0 mb-1 bg-slate-400/30 text-slate-800 px-2 py-1.5 rounded-lg text-[10px] font-medium pointer-events-none opacity-0 translate-y-1 transition-all duration-200 whitespace-nowrap z-10 backdrop-blur-md shadow-sm border border-white/20 after:content-[''] after:absolute after:-bottom-1 after:left-6 after:w-2 after:h-2 after:bg-slate-400/30 after:rotate-45 after:backdrop-blur-md after:border-b after:border-r after:border-white/20 ${isFocused && !query ? 'opacity-100 translate-y-0' : ''}`}>
            💡 ワイルドカード（*）検索が利用可能です
          </div>
          <input
            ref={inputRef}
            value={query}
            onChange={handleQueryChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            className="w-full flex-1 border border-gray-300 rounded-lg px-3 py-2 pr-9 text-xs bg-white/90 transition-all duration-180 focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-300/35"
            placeholder="全単語から検索..."
            aria-label="単語検索"
            style={{ fontSize: '13px' }} 
          />
          {query && (
            <button
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center bg-transparent border-none p-0.5 cursor-pointer text-gray-400 rounded-full transition-all duration-200 hover:bg-gray-100 hover:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              onClick={handleClear}
              aria-label="検索条件をクリア"
              type="button"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <button
            className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-xs transition-all duration-180 hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setPage(1)}
            disabled={currentPage === 1}
            aria-label="最初のページ"
          >
            最初
          </button>
          <button
            className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-xs transition-all duration-180 hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="前のページ"
          >
            前へ
          </button>
          <span className="text-xs text-gray-500 min-w-[3rem] text-center">
            {currentPage} / {totalPages}
          </span>
          <button
            className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-xs transition-all duration-180 hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            aria-label="次のページ"
          >
            次へ
          </button>
          <button
            className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-xs transition-all duration-180 hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setPage(totalPages)}
            disabled={currentPage >= totalPages}
            aria-label="最後のページ"
          >
            最後
          </button>
        </div>
      </div>

      

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {current.map((word) => (
          <Link
            key={word.slug}
            href={`/words/${word.slug}`}
            className="flex flex-col gap-1 p-3 bg-white rounded-lg border border-slate-200 no-underline transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-base font-semibold text-gray-900">{word.term}</span>
              {query && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap ${
                  word.category === 'important' ? 'bg-blue-100 text-blue-800' : 
                  word.category === 'medium' ? 'bg-purple-100 text-purple-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {word.category === 'important' ? '重要' : 
                   word.category === 'medium' ? '中級' : '上級'}
                </span>
              )}
            </div>
            <span className="mt-1 text-[10px] text-gray-400">クリックしてAIによる解説を見る</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
