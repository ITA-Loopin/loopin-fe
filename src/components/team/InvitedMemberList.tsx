"use client";

import { IconButton } from "@/components/common/IconButton";

type TeamMember = {
  id: number;
  nickname: string;
  email: string;
};

type InvitedMemberListProps = {
  members: TeamMember[];
  onRemove?: (memberId: number) => void;
};

export function InvitedMemberList({
  members,
  onRemove,
}: InvitedMemberListProps) {
  if (members.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-start gap-2 self-stretch">
      <p className="text-caption-r text-[var(--gray-500)]">
        팀원 목록
      </p>
      <div className="flex w-full flex-col gap-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between self-stretch h-[44px] px-4 py-[9px] rounded-[10px] bg-[var(--primary-100)]"
          >
            <span className="text-body-2-m text-[var(--gray-800)]">
              {member.nickname} {member.email}
            </span>
            {onRemove && (
              <IconButton
                src="/loop/loop_delete.png"
                alt="팀원 제거"
                width={20}
                height={20}
                onClick={() => onRemove(member.id)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

