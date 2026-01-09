"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import { TeamTypeSelector } from "@/components/team/TeamTypeSelector";
import { TeamNameInput } from "@/components/team/TeamNameInput";
import { TeamGoalInput } from "@/components/team/TeamGoalInput";
import { TeamMemberSearch } from "@/components/team/TeamMemberSearch";
import { InvitedMemberList } from "@/components/team/InvitedMemberList";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import type { TeamCategoryString } from "@/components/team/types";
import { useCreateTeam } from "@/hooks/useCreateTeam";

type TeamMember = {
  id: number;
  nickname: string;
  email: string;
};

export default function CreateTeamLoopPage() {
  const router = useRouter();
  const [category, setCategory] = useState<TeamCategoryString>("PROJECT");
  const [teamName, setTeamName] = useState("");
  const [teamGoal, setTeamGoal] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [invitedMembers, setInvitedMembers] = useState<TeamMember[]>([]);
  const { submitTeam, isSubmitting } = useCreateTeam();

  const handleInvite = (member: TeamMember) => {
    if (!invitedMembers.find((m) => m.id === member.id)) {
      setInvitedMembers([...invitedMembers, member]);
    }
    setSearchValue("");
  };

  const handleRemoveMember = (memberId: number) => {
    setInvitedMembers(invitedMembers.filter((m) => m.id !== memberId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitTeam({
        category,
        name: teamName,
        goal: teamGoal,
        invitedMembers,
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "팀 생성에 실패했습니다");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header leftType="back" rightType="user" onBack={() => router.back()} centerTitle="팀 생성" />

      <form onSubmit={handleSubmit} className="flex-1 px-[16px] pt-[30px]">
        <div className="flex flex-col gap-10">
          <TeamTypeSelector
            selectedCategory={category}
            onSelectCategory={setCategory}
          />

          <TeamNameInput value={teamName} onChange={setTeamName} />

          <TeamGoalInput value={teamGoal} onChange={setTeamGoal} />

          <TeamMemberSearch
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onInvite={handleInvite}
          />

          <InvitedMemberList
            members={invitedMembers}
            onRemove={handleRemoveMember}
          />

          <div className="flex justify-center">
            <PrimaryButton type="submit" disabled={isSubmitting}>
              팀 생성하기
            </PrimaryButton>
          </div>
        </div>
      </form>
    </div>
  );
}

