"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import type { LoopDetail } from "@/types/loop";
import { apiFetch, MissingAccessTokenError } from "@/lib/api";

dayjs.locale("ko");

export default function LoopDetailPage() {
  const params = useParams<{ loopId: string }>();
  const router = useRouter();
  const loopId = Number(params?.loopId);
  const [detail, setDetail] = useState<LoopDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(loopId)) {
      setErrorMessage("유효하지 않은 루프 ID입니다.");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await apiFetch<{
          success?: boolean;
          data?: {
            id: number;
            title: string;
            content?: string | null;
            loopDate: string;
            progress: number;
            checklists?: Array<{
              id: number;
              content: string;
              completed: boolean;
            }>;
          };
        }>(`/api-proxy/rest-api/v1/loops/${loopId}`);

        if (cancelled) return;

        if (response?.success === false || !response?.data) {
          setErrorMessage("루프 상세 정보를 불러오지 못했습니다.");
          setDetail(null);
          return;
        }

        const data = response.data;
        setDetail({
          id: data.id,
          title: data.title,
          content: data.content ?? null,
          loopDate: data.loopDate,
          progress: Math.round(Math.min(Math.max(data.progress * 100, 0), 100)),
          checklists: data.checklists ?? [],
        });
      } catch (error) {
        if (cancelled) return;
        if (error instanceof MissingAccessTokenError) {
          setErrorMessage("로그인 정보가 필요합니다. 다시 로그인해 주세요.");
        } else {
          setErrorMessage("루프 상세 정보를 불러오지 못했습니다.");
        }
        setDetail(null);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      cancelled = true;
    };
  }, [loopId]);

  const formattedDate = useMemo(() => {
    if (!detail?.loopDate) {
      return "";
    }
    return dayjs(detail.loopDate).format("YYYY년 M월 D일 dddd");
  }, [detail?.loopDate]);

  const checklistCount = detail?.checklists.length ?? 0;
  const completedCount =
    detail?.checklists.filter((item) => item.completed).length ?? 0;

  return (
    <>
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,228,224,0.35) 100%)",
        }}
      />

      <div className="relative flex min-h-dvh flex-col">
        <Header
          leftType="back"
          rightType="user"
          onBack={() => router.back()}
          className="px-4 pt-6 pb-4"
        />

        <main className="flex flex-1 flex-col gap-6 px-4 pb-32">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-gray-500">루프 정보를 불러오는 중...</p>
            </div>
          ) : errorMessage ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
              <p className="text-sm text-red-500">{errorMessage}</p>
              <button
                className="rounded-3xl bg-[#2C2C2C] px-4 py-2 text-sm font-semibold text-white"
                onClick={() => router.back()}
              >
                돌아가기
              </button>
            </div>
          ) : detail ? (
            <>
              <section className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold text-[#2C2C2C]">
                  {detail.title}
                </h1>
                <div className="text-sm text-[#8D91A1]">{formattedDate}</div>
                {detail.content ? (
                  <p className="text-sm leading-relaxed text-[#676A79]">
                    {detail.content}
                  </p>
                ) : null}
              </section>

              <section className="flex flex-col items-center gap-4 rounded-3xl bg-white/90 px-6 py-8 shadow-[0px_12px_32px_rgba(0,0,0,0.08)]">
                <CircularProgress percent={detail.progress} />
                <div className="text-sm font-medium text-[#8D91A1]">
                  Checklist · {checklistCount}
                </div>

                <ul className="flex w-full flex-col gap-2">
                  {detail.checklists.map((checklist) => (
                    <li
                      key={checklist.id}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                        checklist.completed
                          ? "bg-[#FFE3DD]"
                          : "bg-[#F5F6F8]"
                      }`}
                    >
                      <span
                        className={`text-sm font-medium ${
                          checklist.completed
                            ? "text-[#FF543F]"
                            : "text-[#2C2C2C]"
                        }`}
                      >
                        {checklist.content}
                      </span>
                      <span
                        className={`grid h-6 w-6 place-items-center rounded-full border ${
                          checklist.completed
                            ? "border-[#FF543F] bg-[#FF543F]/10"
                            : "border-[#D4D6E0]"
                        }`}
                      >
                        {checklist.completed ? (
                          <span className="h-3 w-3 rounded-full bg-[#FF543F]" />
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="mt-auto flex flex-col gap-4 pb-8">
                <button className="w-full rounded-3xl bg-[#2C2C2C] px-6 py-4 text-base font-semibold text-white shadow-[0px_20px_32px_rgba(0,0,0,0.12)]">
                  루프 완료하기
                </button>
                <p className="text-center text-sm text-[#8D91A1]">
                  {completedCount}개 완료 · {checklistCount - completedCount}개 남음
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-gray-500">루프 정보를 불러오는 중...</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

function CircularProgress({ percent }: { percent: number }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex h-48 w-48 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#FFE5DF"
          strokeWidth="16"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#FF7765"
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-4xl font-semibold text-[#FF7765]">
        {percent}%
      </span>
    </div>
  );
}


