"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/common/Header";
import type { LoopDetail, LoopChecklist } from "@/types/loop";
import { apiFetch, MissingAccessTokenError } from "@/lib/api";
import { LoopProgress } from "@/components/home/LoopProgress";
import { Checklist } from "@/components/loop/Checklist";
import { IconButton } from "@/components/common/IconButton";
import { LoopActionModal } from "@/components/loop/LoopActionModal";
import { LoopEditSheet } from "@/components/loop/LoopEditSheet";
import { LoopGroupEditSheet } from "@/components/loop/LoopGroupEditSheet";

dayjs.locale("ko");

const MENU_WIDTH = 160;

export default function LoopDetailPage() {
  const params = useParams<{ loopId: string }>();
  const router = useRouter();
  const loopId = Number(params?.loopId);
  const [detail, setDetail] = useState<LoopDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newChecklistContent, setNewChecklistContent] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [actionModal, setActionModal] = useState<{
    type: "edit" | "delete";
    isOpen: boolean;
  }>({ type: "edit", isOpen: false });
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isGroupEditSheetOpen, setIsGroupEditSheetOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);

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
            loopRule?: {
              ruleId: number;
              scheduleType: string;
              daysOfWeek?: string[];
              startDate?: string | null;
              endDate?: string | null;
            };
          };
        }>(`/api-proxy/rest-api/v1/loops/${loopId}`);

        if (cancelled) return;

        if (response?.success === false || !response?.data) {
          setErrorMessage("루프 상세 정보를 불러오지 못했습니다.");
          setDetail(null);
          return;
        }

        const data = response.data;
        const checklists = (data.checklists ?? []).sort((a, b) => a.id - b.id);
        const totalChecklistCount = checklists.length;
        const completedChecklistCount = checklists.filter(
          (item) => item.completed
        ).length;
        const normalizedProgress =
          totalChecklistCount > 0
            ? Math.round(
                Math.min(
                  Math.max((completedChecklistCount / totalChecklistCount) * 100, 0),
                  100
                )
              )
            : 0;

        const loopRule = data.loopRule
          ? {
              ruleId: data.loopRule.ruleId,
              scheduleType: data.loopRule.scheduleType,
              daysOfWeek: data.loopRule.daysOfWeek,
              startDate: data.loopRule.startDate ?? null,
              endDate: data.loopRule.endDate ?? null,
            }
          : undefined;

        setDetail({
          id: data.id,
          title: data.title,
          content: data.content ?? null,
          loopDate: data.loopDate,
          progress: normalizedProgress,
          checklists,
          loopRule,
          // 하위 호환성
          scheduleType: loopRule?.scheduleType,
          daysOfWeek: loopRule?.daysOfWeek,
          startDate: loopRule?.startDate,
          endDate: loopRule?.endDate,
          loopRuleId: loopRule?.ruleId,
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
  }, [loopId, reloadKey]);

  const formattedDate = useMemo(() => {
    if (!detail?.loopDate) {
      return "";
    }
    return dayjs(detail.loopDate).format("YYYY년 M월 D일 dddd");
  }, [detail?.loopDate]);

  const checklistCount = detail?.checklists.length ?? 0;
  const completedCount =
    detail?.checklists.filter((item) => item.completed).length ?? 0;

  const handleToggleChecklist = useCallback(
    async (updatedItem: LoopChecklist) => {
      setDetail((prev) => {
        if (!prev) return prev;

        const nextChecklists = prev.checklists.map((item) =>
          item.id === updatedItem.id
            ? { ...item, completed: updatedItem.completed }
            : item
        );

        const total = nextChecklists.length;
        const completed = nextChecklists.filter((i) => i.completed).length;

        return {
          ...prev,
          checklists: nextChecklists,
          progress:
            total > 0
              ? Math.round(Math.min(Math.max((completed / total) * 100, 0), 100))
              : 0,
        };
      });

      try {
        await apiFetch(`/api-proxy/rest-api/v1/checklists/${updatedItem.id}`, {
          method: "PUT",
          json: {
            content: updatedItem.content,
            completed: updatedItem.completed,
          },
        });
      } catch (error) {
        setDetail((prev) => {
          if (!prev) return prev;
          const nextChecklists = prev.checklists.map((item) =>
            item.id === updatedItem.id
              ? { ...item, completed: !updatedItem.completed }
              : item
          );
          const total = nextChecklists.length;
          const completed = nextChecklists.filter((i) => i.completed).length;

          return {
            ...prev,
            checklists: nextChecklists,
            progress:
              total > 0
                ? Math.round(Math.min(Math.max((completed / total) * 100, 0), 100))
                : 0,
          };
        });
      }
    },
    []
  );

  const handleAddChecklist = useCallback(async () => {
    if (!detail) {
      return;
    }

    const content = newChecklistContent.trim();
    if (!content) {
      return;
    }

    const tempId = Date.now();
    const optimisticItem: LoopChecklist = {
      id: tempId,
      content,
      completed: false,
    };

    setDetail((prev) => {
      if (!prev) return prev;
      const nextChecklists = [...prev.checklists, optimisticItem];
      const total = nextChecklists.length;
      const completed = nextChecklists.filter((i) => i.completed).length;

      return {
        ...prev,
        checklists: nextChecklists,
        progress:
          total > 0
            ? Math.round(Math.min(Math.max((completed / total) * 100, 0), 100))
            : 0,
      };
    });
    setNewChecklistContent("");

    try {
      const response = await apiFetch<{
        success?: boolean;
        data?: { id: number; content: string; completed: boolean };
      }>(`/api-proxy/rest-api/v1/loops/${detail.id}/checklists`, {
        method: "POST",
        json: { content },
      });

      if (response?.data?.id) {
        setDetail((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            checklists: prev.checklists.map((item) =>
              item.id === tempId ? { ...item, id: response.data!.id } : item
            ),
          };
        });
      }
    } catch (error) {
      setDetail((prev) => {
        if (!prev) return prev;
        const nextChecklists = prev.checklists.filter(
          (item) => item.id !== tempId
        );
        const total = nextChecklists.length;
        const completed = nextChecklists.filter((i) => i.completed).length;

        return {
          ...prev,
          checklists: nextChecklists,
          progress:
            total > 0
              ? Math.round(Math.min(Math.max((completed / total) * 100, 0), 100))
              : 0,
        };
      });
      setNewChecklistContent(content);
    }
  }, [detail, newChecklistContent]);

  const handleCompleteLoop = useCallback(async () => {
    if (!detail) {
      return;
    }

    const previousState = detail;

    setDetail((prev) => {
      if (!prev) return prev;
      const nextChecklists = prev.checklists.map((item) => ({
        ...item,
        completed: true,
      }));
      return {
        ...prev,
        checklists: nextChecklists,
        progress: 100,
      };
    });

    try {
      await Promise.all(
        detail.checklists.map((item) =>
          apiFetch(`/api-proxy/rest-api/v1/checklists/${item.id}`, {
            method: "PUT",
            json: {
              content: item.content,
              completed: true,
            },
          })
        )
      );
    } catch (error) {
      setDetail(previousState);
    }
  }, [detail]);

  const handleDeleteLoop = useCallback(async () => {
    if (!detail?.id || isDeleting) {
      return;
    }

    try {
      setIsDeleting(true);
      await apiFetch(`/api-proxy/rest-api/v1/loops/${detail.id}`, {
        method: "DELETE",
      });
      router.back();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "루프를 삭제하지 못했습니다. 다시 시도해 주세요.";
      setErrorMessage(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, [detail?.id, isDeleting, router]);

  const handleDeleteGroup = useCallback(async () => {
    const ruleId = detail?.loopRule?.ruleId ?? detail?.loopRuleId;
    if (!ruleId || isDeletingGroup) {
      return;
    }

    try {
      setIsDeletingGroup(true);
      await apiFetch(`/api-proxy/rest-api/v1/loops/group/${ruleId}`, {
        method: "DELETE",
      });
      router.back();
    } catch (error) {
      setErrorMessage("반복 루프를 삭제하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setIsDeletingGroup(false);
    }
  }, [detail?.loopRule?.ruleId, detail?.loopRuleId, isDeletingGroup, router]);

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
              <section className="flex flex-col gap-2 pt-6">
                <div className="text-sm text-[#8D91A1]">{formattedDate}</div>
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-xl font-semibold text-[#2C2C2C]">{detail.title}</h1>
                  <IconButton
                    src="/loop/loop_kebab.svg"
                    alt="메뉴"
                    width={20}
                    height={20}
                    onClick={(event) => {
                      const rect = event.currentTarget.getBoundingClientRect();
                      const top = rect.bottom + window.scrollY + 8;
                      const left = rect.right + window.scrollX - MENU_WIDTH;
                      setMenuPosition({ top, left });
                      setIsMenuOpen((prev) => !prev);
                    }}
                  />
                </div>
                {detail.content ? (
                  <p className="text-sm leading-relaxed text-[#676A79]">
                    {detail.content}
                  </p>
                ) : null}
              </section>

              <section className="flex flex-col items-center gap-6 px-1">
                <LoopProgress progress={detail.progress} />
                <div className="w-full max-w-[420px] space-y-4">
                  <Checklist
                    checklists={detail.checklists}
                    onToggleItem={handleToggleChecklist}
                    key={detail.id}
                  />

                  <div className="flex h-14 w-full items-center gap-[10px] rounded-[10px] border border-[#E2E4EA] bg-white px-4 transition-colors focus-within:border-[#FF7765]">
                    <input
                      type="text"
                      placeholder="새로운 루틴을 추가해보세요"
                      value={newChecklistContent}
                      onChange={(event) => setNewChecklistContent(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleAddChecklist();
                        }
                      }}
                      className="flex-1 border-none bg-transparent text-sm text-[#2C2C2C] placeholder:text-[#B7BAC7] focus:outline-none focus:ring-0"
                    />
                    <IconButton
                      src="/addloopsheet/addloopsheet_add.svg"
                      alt="루틴 추가"
                      width={20}
                      height={20}
                      className="h-5 w-5"
                      onClick={handleAddChecklist}
                    />
                  </div>
                </div>
              </section>

              <div className="mt-auto flex flex-col gap-4 pb-8">
                <button
                  className="w-full rounded-3xl bg-[#FF7765] px-6 py-4 text-base font-semibold text-white transition-opacity active:opacity-90 disabled:opacity-60"
                  onClick={handleCompleteLoop}
                  disabled={!detail.checklists.length}
                >
                  루프 완료하기
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-gray-500">루프 정보를 불러오는 중...</p>
            </div>
          )}
        </main>
      </div>

      {isMenuOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/10"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="absolute z-50 rounded-3xl bg-white p-3 shadow-[0px_20px_40px_rgba(0,0,0,0.12)]"
            style={{ top: menuPosition.top, left: menuPosition.left, width: MENU_WIDTH }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col divide-y divide-[#F2F3F5] text-sm font-semibold">
              <button
                type="button"
                className="flex items-center justify-between gap-4 px-2 py-3 text-[#2C2C2C]"
                onClick={() => {
                  setIsMenuOpen(false);
              setActionModal({ type: "edit", isOpen: true });
                }}
              >
                <span>수정하기</span>
                <Image
                  src="/loop/loop_edit.svg"
                  alt="수정"
                  width={20}
                  height={20}
                  className="text-[#8D91A1]"
                />
              </button>
              <button
                type="button"
                className="flex items-center justify-between gap-4 px-2 py-3 text-[#FF5A45]"
                onClick={() => {
                  setIsMenuOpen(false);
                  setActionModal({ type: "delete", isOpen: true });
                }}
              >
                <span>삭제하기</span>
                <Image
                  src="/loop/loop_delete.svg"
                  alt="삭제"
                  width={20}
                  height={20}
                />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <LoopActionModal
        isOpen={actionModal.isOpen}
        type={actionModal.type}
        onClose={() => setActionModal((prev) => ({ ...prev, isOpen: false }))}
        onPrimaryAction={() => {
          setActionModal((prev) => ({ ...prev, isOpen: false }));
          if (actionModal.type === "delete") {
            handleDeleteGroup();
          } else {
            setIsGroupEditSheetOpen(true);
          }
        }}
        onSecondaryAction={() => {
          setActionModal((prev) => ({ ...prev, isOpen: false }));
          if (actionModal.type === "delete") {
            handleDeleteLoop();
          } else {
            setIsEditSheetOpen(true);
          }
        }}
      />
      <LoopEditSheet
        isOpen={isEditSheetOpen}
        loop={detail}
        onClose={() => setIsEditSheetOpen(false)}
        onUpdated={() => {
          setReloadKey((prev) => prev + 1);
        }}
      />
      <LoopGroupEditSheet
        isOpen={isGroupEditSheetOpen}
        loop={detail}
        onClose={() => setIsGroupEditSheetOpen(false)}
        onUpdated={async (newLoopId) => {
          if (newLoopId) {
            // 새로 생성된 루프 ID로 리다이렉트 (히스토리에 남기지 않음)
            router.replace(`/loops/${newLoopId}`);
          } else {
            // 새 루프 ID를 찾지 못하면 캘린더로 리다이렉트
            router.replace("/calendar");
          }
        }}
      />
    </>
  );
}


