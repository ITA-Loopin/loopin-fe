"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import { TeamCard } from "@/components/team/TeamCard";
import type { TeamItem } from "@/components/team/types";
import { fetchMyTeamList } from "@/lib/team";

export default function MyTeamListPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchStartIndex, setTouchStartIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadTeams = async () => {
      try {
        setIsLoading(true);
        const result = await fetchMyTeamList();
        if (!cancelled) {
          setTeams(result.teams);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "팀 리스트를 불러오는데 실패했습니다");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadTeams();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleSave = () => {
    // TODO: API 호출로 순서 저장
    setIsEditMode(false);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) {
      setDragOverIndex(null);
      return;
    }
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newTeams = [...teams];
    const draggedItem = newTeams[draggedIndex];
    newTeams.splice(draggedIndex, 1);
    newTeams.splice(dropIndex, 0, draggedItem);
    setTeams(newTeams);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // 터치 이벤트 핸들러 (모바일 지원)
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    if (!isEditMode) return;
    const touch = e.touches[0];
    setTouchStartY(touch.clientY);
    setTouchStartIndex(index);
    setDraggedIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent, index: number) => {
    if (!isEditMode || touchStartY === null || touchStartIndex === null) return;
    e.preventDefault();
    const touch = e.touches[0];
    const currentY = touch.clientY;
    const deltaY = currentY - touchStartY;

    // 드래그 중인 카드의 위치 업데이트
    if (Math.abs(deltaY) > 10) {
      // 다른 카드 위에 있는지 확인
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      if (element) {
        const cardElement = element.closest('[data-team-index]');
        if (cardElement) {
          const targetIndex = parseInt(cardElement.getAttribute('data-team-index') || '-1');
          if (targetIndex !== -1 && targetIndex !== touchStartIndex) {
            setDragOverIndex(targetIndex);
          }
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isEditMode || touchStartIndex === null || draggedIndex === null) {
      setTouchStartY(null);
      setTouchStartIndex(null);
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // 드롭 위치 확인
    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element) {
      const cardElement = element.closest('[data-team-index]');
      if (cardElement) {
        const dropIndex = parseInt(cardElement.getAttribute('data-team-index') || '-1');
        if (dropIndex !== -1 && dropIndex !== draggedIndex) {
          // 순서 변경
          const newTeams = [...teams];
          const draggedItem = newTeams[draggedIndex];
          newTeams.splice(draggedIndex, 1);
          newTeams.splice(dropIndex, 0, draggedItem);
          setTeams(newTeams);
        }
      }
    }

    setTouchStartY(null);
    setTouchStartIndex(null);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="flex flex-col">
      <div className="relative">
        <Header 
          leftType="back" 
          rightType={isEditMode ? "none" : "edit"} 
          onBack={() => router.back()} 
          onEditClick={handleEditClick}
          centerTitle="내 팀 목록"
        />
        {isEditMode && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <button
              onClick={handleSave}
              className="text-body-1-sb text-[var(--primary-main)]"
            >
              완료
            </button>
          </div>
        )}
      </div>

      <main className="flex-1 px-[16px] py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-[#A0A9B1]">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-[#A0A9B1]">아직 참여 중인 팀이 없어요 <br /> 새로운 팀을 생성해보세요!</p>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-4">
            {teams.map((team, index) => (
              <div
                key={team.id}
                data-team-index={index}
                draggable={isEditMode}
                onDragStart={() => isEditMode && handleDragStart(index)}
                onDragOver={(e) => isEditMode && handleDragOver(e, index)}
                onDragLeave={isEditMode ? handleDragLeave : undefined}
                onDrop={(e) => isEditMode && handleDrop(e, index)}
                onDragEnd={isEditMode ? handleDragEnd : undefined}
                onTouchStart={(e) => isEditMode && handleTouchStart(e, index)}
                onTouchMove={(e) => isEditMode && handleTouchMove(e, index)}
                onTouchEnd={(e) => isEditMode && handleTouchEnd(e)}
                className={`relative transition-all touch-none ${
                  isEditMode ? "cursor-move" : ""
                } ${
                  draggedIndex === index ? "opacity-50" : ""
                } ${
                  dragOverIndex === index && draggedIndex !== index
                    ? "translate-y-2 border-t-2 border-[var(--primary-main)]"
                    : ""
                }`}
              >
                {/* 드래그 핸들 (편집 모드일 때만 표시, 카드 밖에 배치) */}
                {isEditMode && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-1">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-[var(--gray-500)]"></div>
                      <div className="w-1 h-1 rounded-full bg-[var(--gray-500)]"></div>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-[var(--gray-500)]"></div>
                      <div className="w-1 h-1 rounded-full bg-[var(--gray-500)]"></div>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-[var(--gray-500)]"></div>
                      <div className="w-1 h-1 rounded-full bg-[var(--gray-500)]"></div>
                    </div>
                  </div>
                )}
                <div className={isEditMode ? "ml-4" : ""}>
                  <TeamCard team={team} variant="my" isEditMode={isEditMode} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

