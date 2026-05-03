import { useState, useEffect } from "react";
import { fetchTeamMembers, type TeamMember } from "@/lib/team";

type UseTeamMemberSelectionProps = {
  isOpen: boolean;
  loopType: "COMMON" | "INDIVIDUAL" | undefined;
  teamId: number;
};

export function useTeamMemberSelection({
  isOpen,
  loopType,
  teamId,
}: UseTeamMemberSelectionProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // 바텀 시트가 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedMemberIds([]);
      setTeamMembers([]);
    }
  }, [isOpen]);

  // 개인 루프 선택 시 팀원 목록 조회
  useEffect(() => {
    if (!isOpen || !loopType) {
      setSelectedMemberIds([]);
      return;
    }

    if (loopType === "INDIVIDUAL") {
      const loadTeamMembers = async () => {
        try {
          setIsLoadingMembers(true);
          const members = await fetchTeamMembers(teamId);
          setTeamMembers(members);
        } catch (error) {
          console.error("팀원 목록 조회 실패", error);
          setTeamMembers([]);
        } finally {
          setIsLoadingMembers(false);
        }
      };
      loadTeamMembers();
    } else {
      setTeamMembers([]);
      setSelectedMemberIds([]);
    }
  }, [isOpen, loopType, teamId]);

  const handleMemberToggle = (memberId: number) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  return {
    teamMembers,
    selectedMemberIds,
    isLoadingMembers,
    handleMemberToggle,
  };
}

