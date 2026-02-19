'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPrompt, likePrompt } from '@/lib/api';
import { Prompt } from '@/types';
import { Heart, Eye, ArrowLeft, Copy, Check, Tag, User } from 'lucide-react';

const PLATFORM_COLORS: Record<string, string> = {
  ChatGPT: '#10A37F',
  Gemini: '#4285F4',
  Copilot: '#0078D4',
  Midjourney: '#9B7DFF',
  'DALL-E': '#FF6B35',
  'Stable Diffusion': '#FF4D6D',
  'CLOVA X': '#03C75A',
  Claude: '#D4A27F',
};

export default function PromptDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    if (!id) return;
    getPrompt(Number(id))
      .then((p) => {
        setPrompt(p);
        setLikes(p.likes);
      })
      .catch(() => router.push('/prompt/list'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleCopy = async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = async () => {
    if (!prompt || liked) return;
    const res = await likePrompt(prompt.id);
    setLikes(res.likes);
    setLiked(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7C5CFC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!prompt) return null;

  const platformColor = PLATFORM_COLORS[prompt.platform] || '#7C5CFC';

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#8B8BA8] hover:text-white text-sm mb-8 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          목록으로
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: platformColor + 'CC' }}
                >
                  {prompt.platform}
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs bg-[#1E1E2E] text-[#8B8BA8]">
                  {prompt.platform_type === 'image' ? '🖼 이미지형' : '📝 텍스트형'}
                </span>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-[#1E1E2E] text-[#7C5CFC]">
                  <Tag size={10} />
                  {prompt.category}
                </span>
              </div>

              <h1 className="text-2xl font-display font-bold text-white mb-3 leading-tight">
                {prompt.title}
              </h1>
              <p className="text-[#8B8BA8] leading-relaxed text-sm">{prompt.description}</p>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {prompt.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md text-xs bg-[#1A1A28] text-[#4A4A6A] border border-[#2A2A3E]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Prompt Content */}
            <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1E1E2E]">
                <span className="text-sm font-semibold text-[#F0EEFF]">프롬프트</span>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    copied
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-[#1E1E2E] text-[#8B8BA8] hover:text-white hover:bg-[#2A2A3E]'
                  }`}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? '복사됨!' : '복사하기'}
                </button>
              </div>
              <div className="p-5">
                <pre className="text-sm text-[#C0B8E8] whitespace-pre-wrap leading-relaxed font-mono bg-[#0E0E18] rounded-xl p-4 border border-[#1E1E2E]">
                  {prompt.content}
                </pre>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Actions */}
            <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-5 space-y-3">
              <button
                onClick={handleLike}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                  liked
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-[#1E1E2E] text-[#8B8BA8] hover:bg-rose-500/10 hover:text-rose-400 border border-transparent'
                }`}
              >
                <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
                {liked ? '좋아요 취소' : '좋아요'} · {likes.toLocaleString()}
              </button>
            </div>

            {/* Stats */}
            <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-5">
              <p className="text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider mb-4">통계</p>
              <div className="space-y-3">
                <StatRow icon={<Eye size={15} />} label="조회수" value={prompt.views.toLocaleString()} />
                <StatRow icon={<Heart size={15} />} label="좋아요" value={likes.toLocaleString()} />
              </div>
            </div>

            {/* Author */}
            <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-5">
              <p className="text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider mb-4">작성자</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#C084FC] flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#F0EEFF]">{prompt.author}</p>
                  <p className="text-xs text-[#4A4A6A]">
                    {new Date(prompt.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Platform info */}
            <div
              className="rounded-2xl p-5 border"
              style={{
                background: `linear-gradient(135deg, ${platformColor}12, transparent)`,
                borderColor: platformColor + '30',
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: platformColor }}>
                호환 플랫폼
              </p>
              <p className="text-sm font-semibold text-white">{prompt.platform}</p>
              <p className="text-xs text-[#8B8BA8] mt-1">
                {prompt.platform_type === 'image' ? '이미지 생성 AI' : '텍스트 생성 AI'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-[#4A4A6A]">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-sm font-semibold text-[#F0EEFF]">{value}</span>
    </div>
  );
}
