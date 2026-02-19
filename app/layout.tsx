import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'PromptHub - AI 프롬프트 공유 커뮤니티',
  description: 'ChatGPT, Claude, Gemini, Midjourney 등 최고의 AI 프롬프트를 발견하고 공유하세요',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-[#0A0A0F] text-[#F0EEFF] antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
