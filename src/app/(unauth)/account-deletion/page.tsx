import type { Metadata } from "next";
import Link from "next/link";

const SUPPORT_EMAIL = "loopin7963@gmail.com";

export const metadata: Metadata = {
  title: "계정 삭제 안내 | Loopin",
  description: "루핀(Loopin) 계정 및 데이터 삭제 요청 방법",
};

export default function AccountDeletionPage() {
  return (
    <div className="overflow-y-auto px-5 py-8">
      <h1 className="text-title-1-b text-gray-black mb-2">
        루핀(Loopin) 계정 삭제 안내
      </h1>
      <p className="text-body-2-m text-gray-700 mb-8 leading-relaxed">
        루핀(Loopin) 계정과 관련 데이터는 언제든지 삭제를 요청할 수 있어요.
        아래 두 가지 방법 중 편한 방법을 선택해 주세요.
      </p>

      <Section title="방법 1. 앱에서 직접 탈퇴하기">
        <ol className="list-decimal pl-5 space-y-1 text-body-2-m text-gray-700">
          <li>루핀 앱에 로그인해요.</li>
          <li>홈 화면 오른쪽 위의 프로필 아이콘을 눌러 마이페이지로 이동해요.</li>
          <li>
            <strong>계정 관리</strong>를 누른 뒤 화면 아래의{" "}
            <strong>탈퇴하기</strong>를 눌러요.
          </li>
          <li>확인 창에서 한 번 더 탈퇴하기를 누르면 완료돼요.</li>
        </ol>
      </Section>

      <Section title="방법 2. 이메일로 요청하기">
        <p className="text-body-2-m text-gray-700 mb-3 leading-relaxed">
          앱을 사용할 수 없는 경우 아래 주소로 삭제를 요청해 주세요. 본인
          확인을 위해 <strong>가입한 소셜 계정(카카오·네이버·구글·Apple)</strong>
          과 <strong>가입 이메일</strong>을 함께 적어 주세요. 확인 후 7일
          이내에 처리하고 결과를 회신드려요.
        </p>
        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("[루핀] 계정 삭제 요청")}`}
          className="text-body-2-sb text-primary-main underline"
        >
          {SUPPORT_EMAIL}
        </a>
      </Section>

      <Section title="삭제되는 데이터">
        <ul className="list-disc pl-5 space-y-1 text-body-2-m text-gray-700">
          <li>회원 정보: 이메일, 닉네임, 프로필 이미지, 소셜 고유 식별자</li>
          <li>루프, 체크리스트, 루프 리포트</li>
          <li>팀 활동 기록, 팀 채팅 및 AI 플래너 채팅 내용</li>
          <li>푸시 알림 수신 토큰, 알림 설정</li>
        </ul>
      </Section>

      <Section title="삭제 시점과 보관 기간">
        <ul className="list-disc pl-5 space-y-1 text-body-2-m text-gray-700">
          <li>
            탈퇴하면 계정은 즉시 이용할 수 없게 되고, 위 데이터는{" "}
            <strong>30일 후 복구할 수 없게 영구 삭제</strong>돼요.
          </li>
          <li>
            단, 관계 법령에 따라 접속 로그는 3개월, 소비자 불만 또는 분쟁 처리
            기록은 3년간 보관한 뒤 삭제해요.
          </li>
        </ul>
      </Section>

      <p className="text-body-2-m text-gray-500 mt-8 mb-12">
        개인정보 처리에 대한 자세한 내용은{" "}
        <Link href="/privacy" className="underline">
          개인정보처리방침
        </Link>
        에서 확인할 수 있어요.
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-body-1-b text-gray-black mb-3">{title}</h2>
      {children}
    </section>
  );
}
