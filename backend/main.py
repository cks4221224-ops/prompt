from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import os
import uvicorn

app = FastAPI(title="PromptHub API", version="1.0.0")

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://*.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Supabase setup ---

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY", "")

if SUPABASE_URL and SUPABASE_KEY:
    from supabase import create_client
    db = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    db = None  # 로컬 개발 시 인메모리 사용


# --- Models ---

class Prompt(BaseModel):
    id: int
    title: str
    description: str
    content: str
    platform: str
    platform_type: str
    category: str
    author: str
    author_id: int
    likes: int
    views: int
    tags: list[str]
    created_at: str
    thumbnail: str | None = None


class PromptCreate(BaseModel):
    title: str
    description: str
    content: str
    platform: str
    platform_type: str
    category: str
    tags: list[str]


class PaginatedPrompts(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[Prompt]


# --- Constants ---

PLATFORMS = ["ChatGPT", "Gemini", "Copilot", "Midjourney", "DALL-E", "Stable Diffusion", "CLOVA X", "Claude"]
IMAGE_CATEGORIES = ["3D", "일러스트", "사물", "동물", "인물", "캐릭터", "게임", "디자인", "예술", "공예", "패션", "건축", "음식", "사진", "배경", "로고", "기타"]
TEXT_CATEGORIES = ["글쓰기", "개발", "교육", "마케팅", "연구", "업무", "콘텐츠", "생산성", "여행", "SNS", "고민해결", "생활", "재미", "기타"]

# 인메모리 fallback (로컬 개발용)
_local_db: list[dict] = []
_next_id: int = 1


# --- Routes ---

@app.get("/")
def root():
    return {"message": "PromptHub API is running!"}


@app.get("/api/prompts", response_model=PaginatedPrompts)
def get_prompts(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    sort: str = Query("latest", enum=["latest", "views", "likes"]),
    platform_type: str | None = Query(None),
    platform: str | None = Query(None),
    category: str | None = Query(None),
    search: str | None = Query(None),
):
    sort_map = {"latest": "created_at", "views": "views", "likes": "likes"}

    if db:
        query = db.table("prompts").select("*", count="exact")
        if platform_type and platform_type != "all":
            query = query.eq("platform_type", platform_type)
        if platform and platform != "all":
            query = query.eq("platform", platform)
        if category and category != "all":
            query = query.eq("category", category)
        if search:
            query = query.or_(f"title.ilike.%{search}%,description.ilike.%{search}%")
        query = query.order(sort_map[sort], desc=True)
        start = (page - 1) * page_size
        result = query.range(start, start + page_size - 1).execute()
        return PaginatedPrompts(total=result.count or 0, page=page, page_size=page_size, items=result.data)

    # 인메모리 fallback
    filtered = list(_local_db)
    if platform_type and platform_type != "all":
        filtered = [p for p in filtered if p["platform_type"] == platform_type]
    if platform and platform != "all":
        filtered = [p for p in filtered if p["platform"] == platform]
    if category and category != "all":
        filtered = [p for p in filtered if p["category"] == category]
    if search:
        kw = search.lower()
        filtered = [p for p in filtered if kw in p["title"].lower() or kw in p["description"].lower()]
    filtered.sort(key=lambda p: p[sort_map[sort]], reverse=True)
    total = len(filtered)
    start = (page - 1) * page_size
    return PaginatedPrompts(total=total, page=page, page_size=page_size, items=filtered[start:start + page_size])


@app.get("/api/prompts/{prompt_id}", response_model=Prompt)
def get_prompt(prompt_id: int):
    if db:
        result = db.table("prompts").select("*").eq("id", prompt_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Prompt not found")
        prompt = result.data[0]
        db.table("prompts").update({"views": prompt["views"] + 1}).eq("id", prompt_id).execute()
        prompt["views"] += 1
        return prompt

    prompt = next((p for p in _local_db if p["id"] == prompt_id), None)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    prompt["views"] += 1
    return prompt


@app.post("/api/prompts", response_model=Prompt)
def create_prompt(data: PromptCreate):
    global _next_id
    new_prompt = {
        **data.model_dump(),
        "author": "익명 사용자",
        "author_id": 999,
        "likes": 0,
        "views": 0,
        "created_at": datetime.now().isoformat(),
        "thumbnail": None,
    }
    if db:
        result = db.table("prompts").insert(new_prompt).execute()
        return result.data[0]

    new_prompt["id"] = _next_id
    _local_db.append(new_prompt)
    _next_id += 1
    return new_prompt


@app.put("/api/prompts/{prompt_id}", response_model=Prompt)
def update_prompt(prompt_id: int, data: PromptCreate):
    if db:
        result = db.table("prompts").update(data.model_dump()).eq("id", prompt_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Prompt not found")
        return result.data[0]

    prompt = next((p for p in _local_db if p["id"] == prompt_id), None)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    prompt.update(data.model_dump())
    return prompt


@app.delete("/api/prompts/{prompt_id}")
def delete_prompt(prompt_id: int):
    global _local_db
    if db:
        result = db.table("prompts").delete().eq("id", prompt_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Prompt not found")
        return {"message": "deleted"}

    prompt = next((p for p in _local_db if p["id"] == prompt_id), None)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    _local_db = [p for p in _local_db if p["id"] != prompt_id]
    return {"message": "deleted"}


@app.post("/api/prompts/{prompt_id}/like")
def like_prompt(prompt_id: int):
    if db:
        result = db.table("prompts").select("likes").eq("id", prompt_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Prompt not found")
        new_likes = result.data[0]["likes"] + 1
        db.table("prompts").update({"likes": new_likes}).eq("id", prompt_id).execute()
        return {"likes": new_likes}

    prompt = next((p for p in _local_db if p["id"] == prompt_id), None)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    prompt["likes"] += 1
    return {"likes": prompt["likes"]}


@app.get("/api/meta")
def get_meta():
    if db:
        result = db.table("prompts").select("*", count="exact").execute()
        total = result.count or 0
    else:
        total = len(_local_db)
    return {
        "platforms": PLATFORMS,
        "image_categories": IMAGE_CATEGORIES,
        "text_categories": TEXT_CATEGORIES,
        "total_prompts": total,
    }


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
