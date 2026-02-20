import { FilterState, Meta, Prompt } from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export async function getPrompts(
  filters: FilterState,
  page: number,
  pageSize: number
): Promise<{ total: number; page: number; page_size: number; items: Prompt[] }> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    sort: filters.sort,
  });
  if (filters.platform_type !== 'all') params.set('platform_type', filters.platform_type);
  if (filters.platform !== 'all') params.set('platform', filters.platform);
  if (filters.category !== 'all') params.set('category', filters.category);
  if (filters.search) params.set('search', filters.search);

  return apiFetch(`/api/prompts?${params}`);
}

export async function getPrompt(id: number): Promise<Prompt> {
  return apiFetch(`/api/prompts/${id}`);
}

export async function createPrompt(data: {
  title: string;
  description: string;
  content: string;
  platform: string;
  platform_type: string;
  category: string;
  tags: string[];
}): Promise<Prompt> {
  return apiFetch('/api/prompts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updatePrompt(id: number, data: {
  title: string;
  description: string;
  content: string;
  platform: string;
  platform_type: string;
  category: string;
  tags: string[];
}): Promise<Prompt> {
  return apiFetch(`/api/prompts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deletePrompt(id: number): Promise<void> {
  return apiFetch(`/api/prompts/${id}`, { method: 'DELETE' });
}

export async function likePrompt(id: number): Promise<{ likes: number }> {
  return apiFetch(`/api/prompts/${id}/like`, { method: 'POST' });
}

export async function getMeta(): Promise<Meta> {
  return apiFetch('/api/meta');
}
