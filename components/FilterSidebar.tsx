'use client';
import { FilterState, Meta } from '@/types';
import { RotateCcw } from 'lucide-react';

interface Props {
  filters: FilterState;
  meta: Meta | null;
  onChange: (f: Partial<FilterState>) => void;
  onReset: () => void;
}

const SORT_OPTIONS = [
  { value: 'latest', label: '최신' },
  { value: 'views', label: '조회수' },
  { value: 'likes', label: '좋아요' },
];

const TYPE_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'image', label: '이미지형' },
  { value: 'text', label: '텍스트형' },
];

export default function FilterSidebar({ filters, meta, onChange, onReset }: Props) {
  const categories =
    filters.platform_type === 'image'
      ? meta?.image_categories ?? []
      : filters.platform_type === 'text'
      ? meta?.text_categories ?? []
      : [...(meta?.image_categories ?? []), ...(meta?.text_categories ?? [])];

  return (
    <aside className="w-full lg:w-60 flex-shrink-0">
      <div className="sticky top-24 bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-5 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#F0EEFF]">필터</span>
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-[#4A4A6A] hover:text-[#7C5CFC] transition-colors"
          >
            <RotateCcw size={11} />
            초기화
          </button>
        </div>

        {/* Sort */}
        <FilterSection title="정렬">
          <div className="space-y-1">
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => onChange({ sort: o.value as FilterState['sort'] })}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  filters.sort === o.value
                    ? 'bg-[#7C5CFC]/20 text-[#9B7DFF] font-medium'
                    : 'text-[#8B8BA8] hover:bg-[#1E1E2E] hover:text-[#F0EEFF]'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Platform Type */}
        <FilterSection title="플랫폼 유형">
          <div className="flex flex-wrap gap-1.5">
            {TYPE_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => onChange({ platform_type: o.value, category: 'all' })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filters.platform_type === o.value
                    ? 'bg-[#7C5CFC] text-white shadow-lg shadow-purple-900/30'
                    : 'bg-[#1E1E2E] text-[#8B8BA8] hover:text-white'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Platform */}
        <FilterSection title="플랫폼">
          <div className="flex flex-wrap gap-1.5">
            <PillButton
              label="전체"
              active={filters.platform === 'all'}
              onClick={() => onChange({ platform: 'all' })}
            />
            {(meta?.platforms ?? []).map((p) => (
              <PillButton
                key={p}
                label={p}
                active={filters.platform === p}
                onClick={() => onChange({ platform: p })}
              />
            ))}
          </div>
        </FilterSection>

        {/* Category */}
        <FilterSection
          title={`카테고리${filters.platform_type === 'image' ? ' (이미지형)' : filters.platform_type === 'text' ? ' (텍스트형)' : ''}`}
        >
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
            <PillButton
              label="전체"
              active={filters.category === 'all'}
              onClick={() => onChange({ category: 'all' })}
            />
            {categories.map((c) => (
              <PillButton
                key={c}
                label={c}
                active={filters.category === c}
                onClick={() => onChange({ category: c })}
              />
            ))}
          </div>
        </FilterSection>
      </div>
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <p className="text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider">{title}</p>
      {children}
    </div>
  );
}

function PillButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-xs transition-all ${
        active
          ? 'bg-[#7C5CFC]/20 text-[#9B7DFF] border border-[#7C5CFC]/40'
          : 'bg-[#1A1A28] text-[#8B8BA8] border border-transparent hover:border-[#2A2A3E] hover:text-[#F0EEFF]'
      }`}
    >
      {label}
    </button>
  );
}
