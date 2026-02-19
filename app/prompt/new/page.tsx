'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPrompt } from '@/lib/api';
import { Sparkles, X } from 'lucide-react';

const PLATFORMS = ['ChatGPT', 'Gemini', 'Copilot', 'Midjourney', 'DALL-E', 'Stable Diffusion', 'CLOVA X', 'Claude'];
const IMAGE_CATEGORIES = ['3D', '일러스트', '사물', '동물', '인물', '캐릭터', '게임', '디자인', '예술', '공예', '패션', '건축', '음식', '사진', '배경', '로고', '기타'];
const TEXT_CATEGORIES = ['글쓰기', '개발', '교육', '마케팅', '연구', '업무', '콘텐츠', '생산성', '여행', 'SNS', '고민해결', '생활', '재미', '기타'];

type PlatformType = 'text' | 'image';

interface FormState {
  title: string;
  description: string;
  content: string;
  platform: string;
  platform_type: PlatformType;
  category: string;
  tagInput: string;
  tags: string[];
}

const INITIAL_FORM: FormState = {
  title: '',
  description: '',
  content: '',
  platform: 'ChatGPT',
  platform_type: 'text',
  category: '',
  tagInput: '',
  tags: [],
};

export default function NewPromptPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = form.platform_type === 'image' ? IMAGE_CATEGORIES : TEXT_CATEGORIES;

  const set = <K extends keyof FormState,>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const addTag = () => {
    const tag = form.tagInput.trim().replace(/^#/, '');
    if (tag && !form.tags.includes(tag) && form.tags.length < 8) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, tag], tagInput: '' }));
    }
  };

  const removeTag = (tag: string) =>
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));

  const handlePlatformTypeChange = (type: PlatformType) =>
    setForm((prev) => ({ ...prev, platform_type: type, category: '' }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content || !form.category) {
      setError('제목, 프롬프트 내용, 카테고리는 필수입니다.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const prompt = await createPrompt({
        title: form.title,
        description: form.description,
        content: form.content,
        platform: form.platform,
        platform_type: form.platform_type,
        category: form.category,
        tags: form.tags,
      });
      router.push(`/prompt/${prompt.id}`);
    } catch {
      setError('등록 중 오류가 발생했습니다.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Header />

        <form onSubmit={handleSubmit} className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-6 space-y-5">
          <Field label="제목 *">
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="프롬프트 제목을 입력하세요"
              className="input-base"
              maxLength={100}
            />
          </Field>

          <Field label="설명">
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="이 프롬프트가 무엇을 하는지 간단히 설명해주세요"
              className="input-base h-20 resize-none"
              maxLength={300}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="플랫폼">
              <select value={form.platform} onChange={(e) => set('platform', e.target.value)} className="input-base">
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="유형">
              <select
                value={form.platform_type}
                onChange={(e) => handlePlatformTypeChange(e.target.value as PlatformType)}
                className="input-base"
              >
                <option value="text">📝 텍스트형</option>
                <option value="image">🖼 이미지형</option>
              </select>
            </Field>
          </div>

          <Field label="카테고리 *">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => set('category', cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    form.category === cat
                      ? 'bg-[#7C5CFC] text-white'
                      : 'bg-[#1E1E2E] text-[#8B8BA8] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Field>

          <Field label="프롬프트 내용 *">
            <textarea
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
              placeholder="실제 프롬프트 내용을 입력하세요. [변수]는 대괄호로 표시해주세요."
              className="input-base h-40 resize-none font-mono text-xs"
            />
          </Field>

          <Field label="태그 (최대 8개)">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={form.tagInput}
                onChange={(e) => set('tagInput', e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="#태그 입력 후 Enter"
                className="input-base flex-1"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 rounded-xl bg-[#1E1E2E] text-[#8B8BA8] hover:text-white text-sm transition-colors"
              >
                추가
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-[#7C5CFC]/20 text-[#9B7DFF] border border-[#7C5CFC]/30">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Field>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 rounded-xl border border-[#1E1E2E] text-[#8B8BA8] hover:text-white text-sm font-medium transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-[#7C5CFC] hover:bg-[#9B7DFF] text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-lg shadow-purple-900/30"
            >
              {submitting ? '등록 중...' : '프롬프트 등록'}
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .input-base {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border-radius: 0.75rem;
          background: #0E0E18;
          border: 1px solid #1E1E2E;
          color: #F0EEFF;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .input-base:focus {
          border-color: rgba(124, 92, 252, 0.5);
        }
        .input-base::placeholder {
          color: #4A4A6A;
        }
        select.input-base option {
          background: #12121A;
        }
      `}</style>
    </div>
  );
}

function Header() {
  return (
    <div className="text-center mb-10">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C5CFC] to-[#C084FC] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-purple-900/30">
        <Sparkles size={22} className="text-white" />
      </div>
      <h1 className="text-3xl font-display font-bold text-white mb-2">프롬프트 등록</h1>
      <p className="text-[#8B8BA8] text-sm">나만의 프롬프트를 커뮤니티와 공유하세요</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-[#8B8BA8] uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
