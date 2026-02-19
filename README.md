# PromptHub

prpt.ai를 벤치마킹한 AI 프롬프트 공유 커뮤니티

## 기술 스택

| 구분 | 기술 |
|------|------|
| 백엔드 | FastAPI, Pydantic, Uvicorn |
| 프론트엔드 | Next.js 14 (App Router), TypeScript, Tailwind CSS |

## 프로젝트 구조

```
prompt/
├── main.py                  # FastAPI 앱, 라우터, 목업 데이터
├── requirements.txt
├── README.md
└── mnt/user-data/outputs/prompt-hub/frontend/
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx               # / → /prompt/list 리다이렉트
    │   ├── globals.css
    │   └── prompt/
    │       ├── list/page.tsx      # 프롬프트 목록
    │       ├── [id]/page.tsx      # 프롬프트 상세
    │       └── new/page.tsx       # 프롬프트 등록
    ├── components/
    │   ├── Navbar.tsx
    │   ├── PromptCard.tsx
    │   └── FilterSidebar.tsx
    ├── lib/api.ts
    └── types/index.ts
```

## 실행 방법

**백엔드**
```bash
pip install -r requirements.txt
python main.py
```
→ http://localhost:8000/docs 에서 Swagger UI 확인

**프론트엔드**
```bash
cd mnt/user-data/outputs/prompt-hub/frontend
npm install
npm run dev
```
→ http://localhost:3000

## 주요 기능

- **프롬프트 목록** - 카드 그리드, 무한 스크롤(더보기)
- **검색 & 필터** - 키워드 검색, 플랫폼/카테고리/정렬 필터
- **프롬프트 상세** - 내용 보기, 원클릭 복사, 좋아요
- **프롬프트 등록** - 폼으로 새 프롬프트 추가
- **반응형** - 모바일 사이드 드로어 필터

## API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/prompts` | 목록 조회 (필터, 페이지네이션) |
| GET | `/api/prompts/{id}` | 상세 조회 |
| POST | `/api/prompts` | 새 프롬프트 등록 |
| POST | `/api/prompts/{id}/like` | 좋아요 |
| GET | `/api/meta` | 플랫폼/카테고리 메타 정보 |

### Query 파라미터 (GET /api/prompts)

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| page | int | 페이지 번호 (기본: 1) |
| page_size | int | 페이지 크기 (기본: 12) |
| sort | string | `latest` / `views` / `likes` |
| platform_type | string | `image` / `text` |
| platform | string | ChatGPT, Claude 등 |
| category | string | 카테고리명 |
| search | string | 검색 키워드 |
