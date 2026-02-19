'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Eye, Tag } from 'lucide-react';
import { Prompt } from '@/types';
import { useState } from 'react';
import { likePrompt } from '@/lib/api';

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

export default function PromptCard({ prompt }: { prompt: Prompt }) {
  const [likes, setLikes] = useState(prompt.likes);
  const [liked, setLiked] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (liked) return;
    try {
      const res = await likePrompt(prompt.id);
      setLikes(res.likes);
      setLiked(true);
    } catch {}
  };

  const platformColor = PLATFORM_COLORS[prompt.platform] || '#7C5CFC';

  return (
    <Link href={`/prompt/${prompt.id}`}>
      <article className="group relative flex flex-col bg-[#12121A] border border-[#1E1E2E] rounded-2xl overflow-hidden hover:border-[#7C5CFC]/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/20 cursor-pointer h-full">
        {/* Thumbnail or Gradient Placeholder */}
        <div className="relative h-44 overflow-hidden flex-shrink-0">
          {prompt.thumbnail ? (
            <Image
              src={prompt.thumbnail}
              alt={prompt.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: `radial-gradient(ellipse at 30% 30%, ${platformColor}22, transparent 70%),
                             linear-gradient(135deg, #12121A 0%, #1A1A2E 100%)`,
              }}
            >
              <div
                className="text-3xl font-bold opacity-20"
                style={{ color: platformColor }}
              >
                {prompt.platform.charAt(0)}
              </div>
            </div>
          )}

          {/* Platform Badge */}
          <span
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: platformColor + 'CC', backdropFilter: 'blur(4px)' }}
          >
            {prompt.platform}
          </span>

          {/* Type Badge */}
          <span className="absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium bg-black/40 text-[#8B8BA8] backdrop-blur-sm border border-white/5">
            {prompt.platform_type === 'image' ? '🖼 이미지' : '📝 텍스트'}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4 gap-2.5">
          {/* Category */}
          <div className="flex items-center gap-1.5">
            <Tag size={11} className="text-[#7C5CFC]" />
            <span className="text-xs text-[#7C5CFC] font-medium">{prompt.category}</span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-[#F0EEFF] leading-snug line-clamp-2 group-hover:text-[#9B7DFF] transition-colors">
            {prompt.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-[#8B8BA8] leading-relaxed line-clamp-2 flex-1">
            {prompt.description}
          </p>

          {/* Tags */}
          {prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {prompt.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md text-[10px] bg-[#1E1E2E] text-[#4A4A6A] border border-[#2A2A3E]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-[#1E1E2E]">
            <span className="text-xs text-[#4A4A6A]">@{prompt.author}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-[#4A4A6A]">
                <Eye size={12} />
                {prompt.views.toLocaleString()}
              </span>
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  liked ? 'text-rose-400' : 'text-[#4A4A6A] hover:text-rose-400'
                }`}
              >
                <Heart size={12} fill={liked ? 'currentColor' : 'none'} />
                {likes.toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
