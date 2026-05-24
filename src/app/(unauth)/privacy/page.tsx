import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 | Loopin",
  description: "Loopin 개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <div className="overflow-y-auto px-5 py-8">
      { }
      <h1 className="text-title-1-b text-gray-black mb-2">
        개인정보처리방침
      </h1>
      { }
      <p className="text-caption-m text-gray-500 mb-6">
        시행일: 2026년 5월 3일
      </p>

      { }
      <p className="text-body-2-m text-gray-700 mb-8 leading-relaxed">
        루프원(이하 &lsquo;회사&rsquo;)이 제공하는 Loopin
        서비스(이하 &lsquo;서비스&rsquo;)를 이용해 주셔서 감사합니다.
        <br />
        <br />
        회사는 이용자의 개인정보를 중요하게 생각하며,
        「개인정보 보호법」 및 관련 법령을 준수합니다.
        <br />
        <br />
        본 개인정보처리방침은 회사가 수집하는 개인정보의 항목, 수집 목적,
        보유 기간, 이용자의 권리 등을 안내합니다.
      </p>

      {/* 제1조 */}
      <Section title="제1조. 수집하는 개인정보 항목 및 수집 방법">
        <SubSection title="1) 회원가입 및 서비스 이용 시 수집" />

        <Label>필수 항목</Label>
        { }
        <ul className="list-disc pl-5 mb-3 space-y-1 text-body-2-m text-gray-700">
          <li>
            소셜 로그인(카카오·네이버·구글) 연동 시: 이메일, 닉네임,
            프로필 이미지, 소셜 고유 식별자(providerID)
          </li>
          <li>
            서비스 이용 시 자동 생성: 서비스 이용 기록, 루프 데이터,
            팀 활동 기록
          </li>
        </ul>

        <Label>선택 항목</Label>
        { }
        <ul className="list-disc pl-5 mb-4 space-y-1 text-body-2-m text-gray-700">
          <li>전화번호, 성별, 생년월일</li>
        </ul>

        <SubSection title="2) 서비스 이용 과정에서 자동 수집" />
        { }
        <ul className="list-disc pl-5 space-y-1 text-body-2-m text-gray-700">
          <li>기기 정보(OS 종류, 기기 고유 식별자)</li>
          <li>앱 이용 기록, 접속 로그</li>
          <li>푸시 알림 수신 토큰</li>
        </ul>
      </Section>

      {/* 제2조 */}
      <Section title="제2조. 개인정보의 수집 및 이용 목적">
        { }
        <p className="text-body-2-m text-gray-700 mb-3">
          회사는 수집한 개인정보를 다음의 목적 이외의 용도로는 이용하지
          않습니다.
        </p>
        { }
        <ul className="list-disc pl-5 space-y-1 text-body-2-m text-gray-700">
          <li>
            <strong>회원 관리</strong> — 회원 가입 의사 확인, 본인 식별·인증,
            회원자격 유지·관리, 서비스 부정이용 방지
          </li>
          <li>
            <strong>서비스 제공</strong> — 루틴 관리, AI 플래너 추천,
            팀 루프 기능, 루프 리포트 제공, AI 플래너 채팅 운영
          </li>
          <li>
            <strong>알림 발송</strong> — 루틴 알림, 팀 활동 알림,
            서비스 관련 공지 등 SSE·푸시 알림 발송
          </li>
          <li>
            <strong>서비스 개선</strong> — 신규 기능 개발,
            서비스 품질 향상을 위한 통계 분석
          </li>
          <li>
            <strong>고객 문의 대응</strong> — 민원 처리 및 공지사항 전달
          </li>
        </ul>
      </Section>

      {/* 제3조 */}
      <Section title="제3조. 개인정보의 보유 및 이용 기간">
        { }
        <p className="text-body-2-m text-gray-700 mb-3">
          회사는 원칙적으로 개인정보 수집·이용 목적이 달성된 경우 해당 정보를
          지체 없이 파기합니다. 단, 관계 법령에 따라 보존해야 하는 경우 아래와
          같이 보관합니다.
        </p>
        <Table
          headers={["항목", "보유 기간", "근거 법령"]}
          rows={[
            ["회원 정보", "회원 탈퇴 시까지", "서비스 이용계약"],
            ["서비스 이용 기록, 접속 로그", "3개월", "통신비밀보호법"],
            [
              "소비자 불만 또는 분쟁 처리 기록",
              "3년",
              "전자상거래법",
            ],
          ]}
        />
      </Section>

      {/* 제4조 */}
      <Section title="제4조. 개인정보의 제3자 제공">
        { }
        <p className="text-body-2-m text-gray-700 mb-3">
          회사는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다.
          다만, 다음의 경우에는 예외로 합니다.
        </p>
        { }
        <ul className="list-disc pl-5 space-y-1 text-body-2-m text-gray-700">
          <li>이용자가 사전에 동의한 경우</li>
          <li>
            법령의 규정에 의하거나 수사 목적으로 법령에 정해진 절차와 방법에
            따라 수사기관의 요구가 있는 경우
          </li>
        </ul>
      </Section>

      {/* 제5조 */}
      <Section title="제5조. 개인정보의 파기">
        { }
        <p className="text-body-2-m text-gray-700 mb-3">
          회사는 개인정보 보유기간 경과, 처리목적 달성 등 개인정보가 불필요하게
          된 경우 지체 없이 해당 정보를 파기합니다.
        </p>
        { }
        <ul className="list-disc pl-5 space-y-1 text-body-2-m text-gray-700">
          <li>전자적 파일: 복원이 불가능한 방법으로 영구 삭제</li>
          <li>종이 서류: 분쇄기로 분쇄하거나 소각</li>
        </ul>
      </Section>

      {/* 제6조 */}
      <Section title="제6조. 이용자의 권리와 행사 방법">
        { }
        <p className="text-body-2-m text-gray-700 mb-3">
          이용자는 회사에 대해 언제든지 다음의 권리를 행사할 수 있습니다.
        </p>
        { }
        <ul className="list-disc pl-5 mb-3 space-y-1 text-body-2-m text-gray-700">
          <li>개인정보 열람 요구</li>
          <li>오류가 있는 경우 정정 요구</li>
          <li>삭제 요구</li>
          <li>처리 정지 요구</li>
        </ul>
        { }
        <p className="text-body-2-m text-gray-700">
          위 권리 행사는 앱 내 설정 또는 아래 개인정보 보호 담당자에게 이메일로
          요청하실 수 있으며, 회사는 지체 없이 조치하겠습니다.
        </p>
      </Section>

      {/* 제7조 */}
      <Section title="제7조. 개인정보의 안전성 확보 조치">
        { }
        <p className="text-body-2-m text-gray-700 mb-3">
          회사는 개인정보의 안전성 확보를 위해 다음의 조치를 취하고 있습니다.
        </p>
        { }
        <ul className="list-disc pl-5 space-y-1 text-body-2-m text-gray-700">
          <li>관리적 조치: 개인정보 취급 직원 최소화 및 교육 실시</li>
          <li>
            기술적 조치: 개인정보 처리 시스템 접근권한 관리, 데이터 암호화,
            보안 프로그램 설치
          </li>
          <li>물리적 조치: 개인정보 보관 서버의 접근 통제</li>
        </ul>
      </Section>

      {/* 제8조 */}
      <Section title="제8조. 개인정보 보호 담당자">
        { }
        <p className="text-body-2-m text-gray-700 mb-3">
          회사는 개인정보 처리에 관한 업무를 총괄하고, 이용자의 불만 처리 및
          피해 구제를 위해 아래와 같이 개인정보 보호 담당자를 지정하고 있습니다.
        </p>
        <Table
          headers={["항목", "내용"]}
          rows={[
            ["성명", "정지율"],
            ["직책", "관리자"],
            ["이메일", "loopin7963@gmail.com"],
          ]}
        />
        { }
        <p className="text-body-2-m text-gray-700 mt-3">
          개인정보 보호와 관련한 불만, 문의사항은 위 담당자에게 연락 주시면
          신속하게 답변드리겠습니다.
        </p>
      </Section>

      {/* 제9조 */}
      <Section title="제9조. 개인정보처리방침의 변경">
        { }
        <p className="text-body-2-m text-gray-700">
          본 개인정보처리방침은 법령 및 방침의 변경에 따라 내용이
          추가·삭제·수정될 수 있으며, 변경 사항은 시행 7일 전부터 앱 공지사항을
          통해 고지합니다. 단, 이용자의 권리와 관련된 중요한 변경의 경우 30일
          전에 고지합니다.
        </p>
      </Section>

      { }
      <p className="text-body-2-sb text-gray-800 mt-8 mb-12 text-center">
        본 방침은 2026년 5월 3일부터 시행됩니다.
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
      { }
      <h2 className="text-body-1-b text-gray-black mb-3">{title}</h2>
      {children}
    </section>
  );
}

function SubSection({ title }: { title: string }) {
  return (
    <h3 className="text-body-2-sb text-gray-800 mb-2">{title}</h3>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-body-2-sb text-gray-600 mb-1">{children}</p>
  );
}

function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-300">
      { }
      <table className="w-full text-body-2-m text-gray-700">
        <thead>
          { }
          <tr className="bg-gray-100">
            {headers.map((h) => (
              <th
                key={h}
                 
                className="px-3 py-2 text-left text-body-2-sb text-gray-800 border-b border-gray-300"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={
                i < rows.length - 1
                   
                  ? "border-b border-gray-200"
                  : ""
              }
            >
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
