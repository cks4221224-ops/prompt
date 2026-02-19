from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import os
import uvicorn

app = FastAPI(title="PromptHub API", version="1.0.0")

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://*.vercel.app",  # Vercel 프리뷰 URL
    # 실제 도메인으로 교체: "https://your-app.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


# --- Data ---

PLATFORMS = ["ChatGPT", "Gemini", "Copilot", "Midjourney", "DALL-E", "Stable Diffusion", "CLOVA X", "Claude"]
IMAGE_CATEGORIES = ["3D", "일러스트", "사물", "동물", "인물", "캐릭터", "게임", "디자인", "예술", "공예", "패션", "건축", "음식", "사진", "배경", "로고", "기타"]
TEXT_CATEGORIES = ["글쓰기", "개발", "교육", "마케팅", "연구", "업무", "콘텐츠", "생산성", "여행", "SNS", "고민해결", "생활", "재미", "기타"]

prompts_db: list[dict] = []
next_id: int = 1


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
    filtered = list(prompts_db)

    if platform_type and platform_type != "all":
        filtered = [p for p in filtered if p["platform_type"] == platform_type]

    if platform and platform != "all":
        filtered = [p for p in filtered if p["platform"] == platform]

    if category and category != "all":
        filtered = [p for p in filtered if p["category"] == category]

    if search:
        kw = search.lower()
        filtered = [p for p in filtered if kw in p["title"].lower() or kw in p["description"].lower()]

    sort_key = {"latest": "created_at", "views": "views", "likes": "likes"}
    filtered.sort(key=lambda p: p[sort_key[sort]], reverse=True)

    total = len(filtered)
    start = (page - 1) * page_size
    items = filtered[start : start + page_size]

    return PaginatedPrompts(total=total, page=page, page_size=page_size, items=items)


@app.get("/api/prompts/{prompt_id}", response_model=Prompt)
def get_prompt(prompt_id: int):
    prompt = next((p for p in prompts_db if p["id"] == prompt_id), None)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    prompt["views"] += 1
    return prompt


@app.post("/api/prompts", response_model=Prompt)
def create_prompt(data: PromptCreate):
    global next_id
    new_prompt = {
        **data.model_dump(),
        "id": next_id,
        "author": "익명 사용자",
        "author_id": 999,
        "likes": 0,
        "views": 0,
        "created_at": datetime.now().isoformat(),
        "thumbnail": None,
    }
    prompts_db.append(new_prompt)
    next_id += 1
    return new_prompt


@app.post("/api/prompts/{prompt_id}/like")
def like_prompt(prompt_id: int):
    prompt = next((p for p in prompts_db if p["id"] == prompt_id), None)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    prompt["likes"] += 1
    return {"likes": prompt["likes"]}


@app.get("/api/meta")
def get_meta():
    return {
        "platforms": PLATFORMS,
        "image_categories": IMAGE_CATEGORIES,
        "text_categories": TEXT_CATEGORIES,
        "total_prompts": len(prompts_db),
    }


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
