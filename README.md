pnpm: 10.18.0
node: 22

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

# 🧩 Next.js 15 + TailwindCSS + Redux Toolkit + shadcn/ui 세팅 가이드

이 프로젝트는 **Next.js 15(App Router)** 를 기반으로 한 프론트엔드 기본 보일러플레이트입니다.  
최신 개발 흐름에 맞게 **pnpm**, **Turbopack**, **TailwindCSS**, **Redux Toolkit**, **shadcn/ui**를 사용했습니다.

---

## 기술 스택

| 항목                     | 기술                                                                                   | 설명                                           |
| ------------------------ | -------------------------------------------------------------------------------------- | ---------------------------------------------- |
| **Framework**            | [Next.js 15](https://nextjs.org/)                                                      | React 기반 풀스택 프레임워크 (App Router 사용) |
| **Language**             | [TypeScript](https://www.typescriptlang.org/)                                          | 정적 타입 지원                                 |
| **State Management**     | [Redux Toolkit](https://redux-toolkit.js.org/)                                         | 상태 관리 표준 솔루션                          |
| **UI Library**           | [shadcn/ui](https://ui.shadcn.com/)                                                    | Tailwind 기반 UI 컴포넌트                      |
| **CSS Framework**        | [TailwindCSS](https://tailwindcss.com/)                                                | Utility-first CSS 프레임워크                   |
| **Package Manager**      | [pnpm](https://pnpm.io/)                                                               | 빠르고 효율적인 패키지 매니저                  |
| **Bundler / Dev Server** | [Turbopack](https://nextjs.org/docs/app/building-your-application/deploying/turbopack) | Next.js 차세대 번들러 (Rust 기반)              |
| **Node Version**         | `22.x`                                                                                 | 최신 LTS 버전                                  |

---

## 📁 프로젝트 구조

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
│   └── favicon.ico
├── .eslintrc.json
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```
