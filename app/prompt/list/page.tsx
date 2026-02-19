'use client';
import { useEffect, useState, useCallback } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import PromptCard from '@/components/PromptCard';
import FilterSidebar from '@/components/FilterSidebar';
import { getPrompts, getMeta } from '@/lib/api';
import { FilterState, Meta, Prompt } from '@/types';

const DEFAULT_FILTERS: FilterState = {
  sort: 'latest',
  platform_type: 'all',
  platform: 'all',
  category: 'all',
  search: '',
};

export default function PromptListPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const PAGE_SIZE = 12;

  useEffect(() => {
    getMeta().then(setMeta).catch(console.error);
  }, []);

  const fetchPrompts = useCallback(
    async (f: FilterState, p: number, replace: boolean) => {
      if (p === 1) setLoading(true);
      else setLoadingMore(true);
      try {
        const res = await getPrompts(f, p, PAGE_SIZE);
        setTotal(res.total);
        setPrompts((prev) => (replace ? res.items : [...prev, ...res.items]));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    setPage(1);
    fetchPrompts(filters, 1, true);
  }, [filters, fetchPrompts]);

  const handleFilterChange = (partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput }));
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPrompts(filters, nextPage, false);
  };

  const hasMore = prompts.length < total;

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-[#1E1E2E]">
        <div className="absolute inset-0 bg-gradient-radial from-[rgba(124,92,252,0.12)] via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-[#7C5CFC]/50 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center relative">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#7C5CFC]/15 text-[#9B7DFF] border border-[#7C5CFC]/20 mb-5">
            ✨ 총 {meta?.total_prompts?.toLocaleString() ?? '...'} 개의 프롬프트
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            모든 AI 프롬프트의 <br />
            <span className="bg-gradient-to-r from-[#7C5CFC] to-[#C084FC] bg-clip-text text-transparent">
              허브
            </span>
          </h1>
          <p className="text-[#8B8BA8] text-base max-w-xl mx-auto mb-8 leading-relaxed">
            ChatGPT, Claude, Gemini, Midjourney, DALL-E까지.<br />
            검증된 최고의 프롬프트를 발견하고 나눠보세요.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-4 text-[#4A4A6A]" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="프롬프트 검색..."
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#12121A] border border-[#1E1E2E] text-[#F0EEFF] placeholder:text-[#4A4A6A] text-sm focus:outline-none focus:border-[#7C5CFC]/60 focus:bg-[#14141E] transition-all"
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={() => { setSearchInput(''); setFilters((p) => ({ ...p, search: '' })); }}
                  className="absolute right-14 text-[#4A4A6A] hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 rounded-lg bg-[#7C5CFC] text-white text-sm font-medium hover:bg-[#9B7DFF] transition-colors"
              >
                검색
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Desktop */}
          <div className="hidden lg:block">
            <FilterSidebar
              filters={filters}
              meta={meta}
              onChange={handleFilterChange}
              onReset={handleReset}
            />
          </div>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-[#8B8BA8]">
                총 <span className="text-[#F0EEFF] font-semibold">{total.toLocaleString()}</span>건의 프롬프트
              </p>
              <button
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12121A] border border-[#1E1E2E] text-[#8B8BA8] text-sm"
                onClick={() => setShowMobileFilter(true)}
              >
                <SlidersHorizontal size={14} />
                필터
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : prompts.length === 0 ? (
              <EmptyState onReset={handleReset} />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {prompts.map((p, i) => (
                    <div
                      key={p.id}
                      className="opacity-0 animate-fade-up"
                      style={{ animationDelay: `${(i % 12) * 50}ms`, animationFillMode: 'forwards' }}
                    >
                      <PromptCard prompt={p} />
                    </div>
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-8 py-3 rounded-xl border border-[#1E1E2E] bg-[#12121A] text-[#8B8BA8] hover:text-white hover:border-[#7C5CFC]/50 transition-all text-sm font-medium disabled:opacity-50"
                    >
                      {loadingMore ? '불러오는 중...' : '더보기'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowMobileFilter(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-[#0A0A0F] border-l border-[#1E1E2E] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-white">필터</span>
              <button onClick={() => setShowMobileFilter(false)}>
                <X size={20} className="text-[#8B8BA8]" />
              </button>
            </div>
            <FilterSidebar
              filters={filters}
              meta={meta}
              onChange={(f) => { handleFilterChange(f); }}
              onReset={() => { handleReset(); setShowMobileFilter(false); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl overflow-hidden animate-pulse">
      <div className="h-44 bg-[#1A1A28]" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 bg-[#1E1E2E] rounded" />
        <div className="h-4 bg-[#1E1E2E] rounded" />
        <div className="h-4 w-3/4 bg-[#1E1E2E] rounded" />
        <div className="h-3 bg-[#1E1E2E] rounded" />
        <div className="h-3 w-5/6 bg-[#1E1E2E] rounded" />
      </div>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <h3 className="text-lg font-semibold text-[#F0EEFF] mb-2">결과가 없습니다</h3>
      <p className="text-sm text-[#8B8BA8] mb-6">다른 검색어나 필터를 사용해 보세요.</p>
      <button
        onClick={onReset}
        className="px-5 py-2.5 rounded-lg bg-[#7C5CFC] text-white text-sm font-medium hover:bg-[#9B7DFF] transition-colors"
      >
        필터 초기화
      </button>
    </div>
  );
}
