"use client";

import { IconButton } from "@/components/common/IconButton";
import { useSearchMembers } from "@/hooks/useSearchMembers";

type TeamMember = {
  id: number;
  nickname: string;
  email: string;
};

type TeamMemberSearchProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onInvite?: (member: TeamMember) => void;
};

export function TeamMemberSearch({
  searchValue,
  onSearchChange,
  onInvite,
}: TeamMemberSearchProps) {
  const { searchResults, isSearching, searchMembers, clearSearchResults } =
    useSearchMembers();

  const handleSearch = (value: string) => {
    onSearchChange(value);
    clearSearchResults();
  };

  const handleSearchClick = () => {
    searchMembers(searchValue);
  };

  return (
    <div className="flex flex-col items-start gap-2 self-stretch">
      <p className="text-xs font-medium leading-[140%] tracking-[-0.24px] text-[#A0A9B1]">
        팀원 추가하기
      </p>
      <div className="flex h-[44px] w-full items-center gap-2.5 rounded-[10px] bg-[#F8F8F9] px-4 py-[6px]">
        <input
          type="text"
          value={searchValue}
          onChange={(event) => handleSearch(event.target.value)}
          placeholder="닉네임을 검색해주세요"
          className="flex-1 bg-transparent outline-none text-base font-semibold leading-[150%] tracking-[-0.32px] text-[#121212] placeholder:text-[#C6CCD1]"
        />
        <IconButton
          src="/team/search.svg"
          alt="검색"
          width={20}
          height={20}
          onClick={handleSearchClick}
          className="shrink-0"
          imageClassName="h-5 w-5"
        />
      </div>

      {/* 검색 결과 */}
      {searchResults.length > 0 && (
        <div className="flex w-full flex-col gap-2">
          {searchResults.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between self-stretch h-[44px] px-4 py-[9px] rounded-[10px] bg-[#FFF3F1]"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[var(--gray-800,#3A3D40)] text-sm font-medium leading-[150%] tracking-[-0.28px]">
                  {member.nickname + " " + member.email + ""}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onInvite?.(member)}
                className="flex h-[24px] items-center justify-center gap-[5px] rounded-[5px] bg-[#FF7765] px-2 text-[var(--gray-100,#F8F8F9)] text-xs font-semibold leading-[140%] tracking-[-0.24px]"
              >
                초대하기
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

