pnpm: 10.18.0
node: 22

환경 설정

```bash
pnpm dev

```

팀원에게 .env.local 요청

로컬 도메인 설정

```bash
# hosts 파일 수정
sudo vi /etc/hosts

# 추가할 내용
127.0.0.1   local.loopin.co.kr
```

개발 서버 실행

```bash
pnpm dev
```

주요 파일

- `src/app/login/page.tsx` - 로그인 페이지
- `src/app/auth/nickname/page.tsx` - 닉네임 설정
- `src/store/slices/authSlice.ts` - Redux 인증 상태
- `next.config.ts` - API 프록시 설정

기술 스택

- Next.js 15 (App Router)
- Redux Toolkit
- TailwindCSS
- pnpm

환경 변수

프로젝트 구조

```bash
my-app/
├── app/
│   ├── layout.tsx        # 전역 레이아웃 (Providers 포함)
│   ├── globals.css       # Tailwind 기본 스타일
│   ├── page.tsx          # 기본 페이지
│   └── providers.tsx     # Redux Provider 설정
├── components/
│   └── ui/               # shadcn/ui 컴포넌트
├── store/
│   ├── store.ts          # Redux 스토어
│   └── slices/
│       └── counterSlice.ts
├── public/
├── .eslintrc.json
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```
