"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

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
      { }
      <p className="text-caption-r text-gray-500">
        팀원 목록
      </p>
      <div className="flex w-full flex-col gap-2">
        {members.map((member) => (
          <div
            key={member.id}
             
            className="flex items-center justify-between self-stretch h-[44px] px-4 py-[9px] rounded-[10px] bg-gray-100"
          >
            { }
            <span className="text-body-2-m text-gray-800">
              {member.nickname} {member.email}
            </span>
            {onRemove && (
              <Button
                variant="icon"
                onClick={() => onRemove(member.id)}
                aria-label="팀원 제거"
              >
                <Image
                  src="/loop/loop_delete.png"
                  alt="팀원 제거"
                  width={20}
                  height={20}
                  style={{ width: 20, height: 20 }}
                />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

