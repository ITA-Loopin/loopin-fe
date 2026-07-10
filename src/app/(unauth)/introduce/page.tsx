export const metadata = {
  title: "Loopin 소개",
  description:
    "끊기지 않고 이어지는 루프 안으로. Loopin은 루틴을 시각적으로 채워가며 성장하는 경험을 전합니다.",
};

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 border-b border-gray-200 px-6 py-8 last:border-b-0">
      {eyebrow && (
        <span className="text-caption-m text-primary-500">{eyebrow}</span>
      )}
      <h2 className="text-title-2-b text-gray-black">{title}</h2>
      <div className="flex flex-col gap-2 text-body-2-m text-gray-700">
        {children}
      </div>
    </section>
  );
}

function FeatureItem({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[10px] bg-gray-100 px-4 py-4">
      <span className="text-body-2-b text-gray-black">{label}</span>
      <p className="text-body-2-m text-gray-700">{description}</p>
    </div>
  );
}

export default function IntroducePage() {
  return (
    <div className="h-full w-full overflow-y-auto bg-gray-white">
      {/* Hero */}
      <header className="flex flex-col gap-3 bg-primary-100 px-6 pb-10 pt-16">
        <span className="text-caption-m text-primary-500">About Loopin</span>
        <h1 className="text-title-1-eb text-gray-black">
          끊기지 않고 이어지는
          <br />
          루프 안으로.
        </h1>
        <p className="text-body-2-m text-gray-700">
          루틴이라는 흐름 안으로 자연스럽게 빠져들어,
          <br />
          시각적으로 채워가며 성장하는 경험.
          <br />
          그게 바로 루핀이 전하고 싶은 가치예요.
        </p>
      </header>

      {/* 브랜드 아이덴티티 */}
      <Section eyebrow="Brand Identity" title="Loopin이라는 이름">
        <p>
          <span className="text-body-2-b text-gray-black">Loop(루프) + in(들어가다)</span>.
          &lsquo;끊기지 않고 이어지는 루프 안으로 들어간다&rsquo;는 의미를 담았어요.
          루틴이라는 흐름 안으로 자연스럽게 빠져들어, 시각적으로 채워가며 성장하는 경험.
          그게 바로 루핀이 전하고 싶은 가치예요.
        </p>
      </Section>

      <Section title="로고 · 심볼 · 타이포그래피">
        <FeatureItem
          label="로고"
          description="‘loop’의 글자들이 하나의 선으로 끊김 없이 이어지며 루프의 형태를 띠는 워드마크예요. 끊기지 않고 이어지는 루틴의 본질을 그대로 담았어요."
        />
        <FeatureItem
          label="심볼"
          description="루프가 돌아가는 형태를 단순화한 심볼은, 루틴을 채워가는 행위 자체가 보상이 된다는 루핀의 철학을 시각적으로 표현해요."
        />
        <FeatureItem
          label="타이포그래피 — SUIT"
          description="깔끔하고 직관적인 한글 서체로, ‘누구나 쉽게 시작하는 루틴 앱’이라는 루핀의 방향과 맞닿아 있어요."
        />
      </Section>

      {/* 어떻게 쓰나요 */}
      <Section eyebrow="How to use" title="시작하기">
        <p>
          카카오·네이버·구글로 간편 로그인하고, 닉네임을 정하면 끝.
          루핀의 핵심 기능을 3장으로 빠르게 살펴본 뒤 바로 첫 루프를 만들 수 있어요.
        </p>
      </Section>

      <Section title="홈 — 오늘의 루프">
        <p>
          화면 한가운데 도넛 차트가 오늘의 진행률을 보여줘요.
          아래 루프 리스트에서 하나씩 체크하면 루프가 채워지고,
          팀 루프가 있는 날엔 바로 이동할 수 있는 안내도 떠요.
        </p>
      </Section>

      <Section title="캘린더 — 루틴 설계">
        <p>
          달력에서 날짜를 골라 그날의 루프를 확인하고,
          &lsquo;루프 추가하기&rsquo;로 이름·체크리스트·반복 주기·기간을
          한 번에 설정할 수 있어요. 하루 단위든 주간 단위든,
          내 일정에 맞게 시각적으로 짤 수 있어요.
        </p>
      </Section>

      <Section title="루틴 수정">
        <p>
          일정이 바뀌어도 괜찮아요. 반복 루프는 &lsquo;전체 반복&rsquo;과 &lsquo;오늘만&rsquo; 중에서
          골라 수정할 수 있어 상황에 맞게 유연하게 조정돼요.
        </p>
      </Section>

      <Section title="AI 플래너 — 루미와 함께">
        <p>
          무엇부터 시작할지 막막할 땐 루미에게 말 걸어 보세요.
          목표·기간·빈도를 입력하면 맞춤 루프 3개를 추천해줘요.
          마음에 드는 걸 골라 바로 시작하거나, 원하는 대로 다듬을 수도 있어요.
        </p>
      </Section>

      <Section title="팀 루프 — 함께 이어가기">
        <p>
          혼자서는 끊기기 쉬운 루틴, 팀과 함께라면 끝까지 갈 수 있어요.
          목표가 맞는 팀에 참여하거나 직접 팀을 만들어 공통 루프를 채우고,
          팀 채팅으로 서로 응원할 수 있어요.
        </p>
      </Section>

      <Section title="루프 리포트 — 나의 패턴 돌아보기">
        <p>
          주간·월간으로 내 루틴 패턴을 한눈에 확인할 수 있어요.
          잘 이어지고 있는 루프는 칭찬받고,
          흐트러진 루프는 가볍게 다듬어볼 수 있도록 안내해줘요.
        </p>
      </Section>

      <footer className="px-6 py-10 text-center">
        <p className="text-caption-r text-gray-500">© Loopin</p>
      </footer>
    </div>
  );
}
