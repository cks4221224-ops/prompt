export interface Prompt {
  id: number;
  title: string;
  description: string;
  content: string;
  platform: string;
  platform_type: string;
  category: string;
  author: string;
  author_id: number;
  likes: number;
  views: number;
  tags: string[];
  created_at: string;
  thumbnail?: string | null;
}

export interface Meta {
  platforms: string[];
  image_categories: string[];
  text_categories: string[];
  total_prompts: number;
}

export interface FilterState {
  sort: 'latest' | 'views' | 'likes';
  platform_type: string;
  platform: string;
  category: string;
  search: string;
}
