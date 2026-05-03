import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTeam } from "@/lib/team";
import type { TeamCategoryString } from "@/components/team/types";

type TeamMember = {
  id: number;
  nickname: string;
  email: string;
};

export function useCreateTeam() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitTeam = async (data: {
    category: TeamCategoryString;
    name: string;
    goal: string;
    invitedMembers: TeamMember[];
  }) => {
    setIsSubmitting(true);
    try {
      await createTeam({
        category: data.category,
        name: data.name,
        goal: data.goal,
        invitedNicknames: data.invitedMembers.map((member) => member.nickname),
      });
      router.push("/teamloop");
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitTeam,
    isSubmitting,
  };
}

