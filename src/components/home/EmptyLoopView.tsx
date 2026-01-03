export function EmptyLoopView() {
  return (
    <>
      {/* 엠티뷰: 중앙 원형 요소 */}
      <section className="flex items-center justify-center mt-4 mb-6">
        <div className="relative w-80 h-80 flex items-center justify-center">
          {/* 외부 링 */}
          <div
            className="absolute inset-0 rounded-full border-8 border-white"
            style={{
              boxShadow: "0px 0px 15px 0px #7C7C7C1F",
            }}
          ></div>
          {/* 내부 링 */}
          <div
            className="absolute inset-8 rounded-full border-4 border-white"
            style={{
              boxShadow: "0px 0px 15px 0px #7C7C7C1F",
            }}
          ></div>
          {/* 그라데이션 원 */}
          <div
            className="absolute inset-12 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255, 228, 224, 0.6) 0%, rgba(255, 255, 255, 0.8) 100%)",
            }}
          ></div>
          {/* 루프 중앙 디자인 요소 */}
          <div
            className="absolute rounded-full"
            style={{
              width: "157px",
              height: "157px",
              transform: "rotate(33.923deg)",
              borderRadius: "157px",
              background: "linear-gradient(145deg, rgba(255, 84, 63, 0.40) 26.7%, rgba(242, 255, 213, 0.40) 88.06%)",
              filter: "blur(40px)",
            }}
          ></div>
        </div>
      </section>

      {/* Loop List · 0 */}
      <section className="relative">
        <div>
          <h2 className="font-semibold text-lg">Loop List · 0</h2>
        </div>
      </section>
    </>
  );
}

