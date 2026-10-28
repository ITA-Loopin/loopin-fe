import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { StoreButtons } from "@/components/introduce/StoreButtons";
import {
  APP_STORE_URL,
  PLAY_STORE_URL,
} from "@/components/introduce/storeLinks";

const PAGE_TITLE = "루핀 Loopin - AI 루틴 플래너 | 습관·루틴 관리 앱";
const PAGE_DESCRIPTION =
  "목표만 말하면 AI 플래너 루핑이가 나에게 맞는 루틴을 추천해요. 오늘의 루프로 달성률을 채우고, 팀과 함께 습관을 이어가는 루틴 관리 앱 루핀. iOS·Android 무료 다운로드.";

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  keywords: [
    "루핀",
    "Loopin",
    "루틴 앱",
    "습관 앱",
    "루틴 관리",
    "습관 만들기",
    "AI 플래너",
    "루틴 플래너",
    "스터디 플래너",
    "갓생",
    "팀 챌린지",
  ],
  alternates: { canonical: "/introduce" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/introduce",
    siteName: "루핀 Loopin",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "루핀 Loopin",
  alternateName: ["루핀", "Loopin"],
  description: PAGE_DESCRIPTION,
  url: "https://loopin.co.kr/introduce",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "iOS, Android",
  inLanguage: "ko",
  offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
  downloadUrl: [APP_STORE_URL, PLAY_STORE_URL],
  publisher: { "@type": "Organization", name: "루프원" },
};

const FEATURES = [
  {
    image: "/introduce/home.webp",
    eyebrow: "오늘의 루프",
    title: "루프를 채우는 만큼 쌓이는 성취감",
    description:
      "홈 화면의 도넛 차트가 오늘의 달성률을 보여줘요. 체크리스트를 하나씩 완료할 때마다 루프가 채워져서, 루틴을 이어가는 과정 자체가 보상이 돼요.",
  },
  {
    image: "/introduce/ai-planner.webp",
    eyebrow: "AI 플래너 루핑이",
    title: "목표만 말하면 루틴은 AI가 짜줘요",
    description:
      "“토익 3주 동안 주 3회 공부하고 싶어”처럼 말하면 루핑이가 주기·기간·체크리스트까지 담긴 맞춤 루틴 3개를 추천해요. 마음에 드는 걸 골라 바로 시작하세요.",
  },
  {
    image: "/introduce/report.webp",
    eyebrow: "루프 리포트",
    title: "잘 되는 루틴과 막힌 루틴을 한눈에",
    description:
      "주간·월간 리포트로 나의 루틴 패턴을 돌아봐요. 꾸준히 이어진 루프와 보완이 필요한 루프를 알려줘서 다음 계획을 쉽게 다듬을 수 있어요.",
  },
  {
    image: "/introduce/team.webp",
    eyebrow: "팀 루프",
    title: "혼자 어려운 습관은 팀과 함께",
    description:
      "스터디, 운동, 독서처럼 목표가 같은 팀에 참여하거나 직접 팀을 만들어 공통 루프를 채워요. 팀원의 진행 상황을 보고 채팅으로 서로 응원할 수 있어요.",
  },
] as const;

const FAQS = [
  {
    question: "루핀은 무료인가요?",
    answer: "네, 루핀의 모든 기능은 무료로 이용할 수 있어요.",
  },
  {
    question: "아이폰과 안드로이드 모두 쓸 수 있나요?",
    answer:
      "App Store와 Google Play에서 모두 다운로드할 수 있어요. 같은 계정으로 로그인하면 기기를 바꿔도 루틴이 그대로 이어져요.",
  },
  {
    question: "어떻게 가입하나요?",
    answer:
      "카카오·네이버·구글·Apple 계정으로 간편하게 로그인하고 닉네임만 정하면 바로 첫 루프를 만들 수 있어요.",
  },
  {
    question: "루틴은 어떻게 만드나요?",
    answer:
      "캘린더에서 이름·체크리스트·반복 주기·기간을 직접 설정하거나, AI 플래너 루핑이에게 목표를 말해 추천 루틴을 받아 시작할 수 있어요.",
  },
] as const;

function DesktopQr() {
  return (
    <div className="hidden items-center gap-4 lg:flex">
      <div className="rounded-xl bg-gray-white p-2 shadow-sm">
        <Image
          src="/introduce/qr.svg"
          alt="루핀 앱 다운로드 QR 코드"
          width={88}
          height={88}
          unoptimized
        />
      </div>
      <p className="text-body-2-m text-gray-700">
        휴대폰 카메라로 QR 코드를 스캔하면
        <br />
        바로 앱을 받을 수 있어요.
      </p>
    </div>
  );
}

export default function IntroducePage() {
  const hero = (
    <section className="bg-primary-100">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 pb-14 pt-12 lg:flex-row lg:gap-16 lg:pb-20 lg:pt-20">
        <div className="flex flex-1 flex-col gap-6 text-center lg:text-left">
          <span className="text-body-1-b text-primary-main">
            AI 루틴 플래너 · 루핀 Loopin
          </span>
          <h1 className="text-[32px] font-extrabold leading-[1.3] tracking-[-0.02em] text-gray-black lg:text-[48px]">
            끊기지 않고 이어지는
            <br />
            루틴, <span className="text-primary-main">루핀</span>
          </h1>
          <p className="text-body-1-m text-gray-700 lg:text-[18px] lg:leading-[1.6]">
            목표만 말하면 AI가 루틴을 짜주고,
            <br className="hidden sm:block" /> 매일 채워가는 루프로 습관을
            이어가는 루틴 관리 앱이에요.
          </p>
          <StoreButtons className="justify-center lg:justify-start" />
          <DesktopQr />
        </div>
        <div className="w-full max-w-[320px] flex-shrink-0 lg:max-w-[380px]">
          <Image
            src="/introduce/hero.webp"
            alt="루핀 앱 홈 화면을 손에 든 모습"
            width={720}
            height={1558}
            sizes="(min-width: 1024px) 380px, 320px"
            className="h-auto w-full rounded-[28px] shadow-xl"
            priority
          />
        </div>
      </div>
    </section>
  );

  const features = FEATURES.map((feature, index) => (
    <article
      key={feature.eyebrow}
      className={`flex flex-col items-center gap-8 lg:gap-16 ${index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"}`}
    >
      <div className="w-full max-w-[280px] flex-shrink-0 lg:max-w-[320px]">
        <Image
          src={feature.image}
          alt={`루핀 ${feature.eyebrow} 화면`}
          width={720}
          height={1558}
          sizes="(min-width: 1024px) 320px, 280px"
          className="h-auto w-full rounded-[24px] border border-gray-200"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 text-center lg:text-left">
        <span className="text-body-2-sb text-primary-500">
          {feature.eyebrow}
        </span>
        <h3 className="text-title-1-b text-gray-black lg:text-[32px] lg:leading-[1.35]">
          {feature.title}
        </h3>
        <p className="text-body-1-m text-gray-700">{feature.description}</p>
      </div>
    </article>
  ));

  const faqs = FAQS.map((faq) => (
    <div key={faq.question} className="rounded-xl bg-gray-100 px-5 py-4">
      <h3 className="text-body-1-b text-gray-black">{faq.question}</h3>
      <p className="mt-1 text-body-2-m text-gray-700">{faq.answer}</p>
    </div>
  ));

  return (
    <div className="min-h-screen bg-gray-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      {hero}

      <section className="mx-auto max-w-5xl px-6 py-16 lg:py-24">
        <h2 className="mb-12 text-center text-title-1-eb text-gray-black lg:mb-20 lg:text-[36px] lg:leading-[1.3]">
          시작부터 지속까지,
          <br />
          루틴을 하나의 흐름으로
        </h2>
        <div className="flex flex-col gap-16 lg:gap-24">{features}</div>
      </section>

      <section className="bg-gray-100">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-16 text-center lg:py-20">
          <span className="text-body-2-sb text-primary-500">Brand Story</span>
          <h2 className="text-title-1-eb text-gray-black lg:text-[32px]">
            Loop + in, 루프 안으로
          </h2>
          <p className="text-body-1-m text-gray-700">
            루핀은 &lsquo;끊기지 않고 이어지는 루프 안으로 들어간다&rsquo;는
            뜻이에요. 루틴이라는 흐름 안으로 자연스럽게 빠져들어, 시각적으로
            채워가며 성장하는 경험을 전하고 싶어요.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
        <h2 className="mb-8 text-center text-title-1-eb text-gray-black lg:text-[32px]">
          자주 묻는 질문
        </h2>
        <div className="flex flex-col gap-3">{faqs}</div>
      </section>

      <section className="bg-primary-100">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-16 text-center lg:py-20">
          <h2 className="text-title-1-eb text-gray-black lg:text-[32px]">
            오늘부터 루프를 채워볼까요?
          </h2>
          <StoreButtons className="w-full justify-center sm:w-auto" />
          <DesktopQr />
        </div>
      </section>

      <footer className="border-t border-gray-200">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-8 text-caption-r text-gray-500 sm:flex-row sm:justify-between">
          <p>© 루프원 · 문의 loopin7963@gmail.com</p>
          <nav className="flex gap-4">
            <Link href="/privacy" className="hover:underline">
              개인정보처리방침
            </Link>
            <Link href="/account-deletion" className="hover:underline">
              계정 삭제 안내
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
