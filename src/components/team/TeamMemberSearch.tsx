"use client";

import { useRef } from "react";
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
  const { searchResults, searchMembers, clearSearchResults } =
    useSearchMembers();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (value: string) => {
    onSearchChange(value);
    clearSearchResults();
  };

  const handleSearchClick = () => {
    inputRef.current?.focus();
  };

  const handleSearchSubmit = () => {
    if (searchValue.trim()) {
      searchMembers(searchValue);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearchSubmit();
    }
  };

  return (
    <div className="flex flex-col items-start gap-2 self-stretch">
      <p className="text-caption-r text-[var(--gray-500)]">
        팀원 추가하기
      </p>
      <div className="flex h-[44px] w-full items-center gap-2.5 rounded-[10px] bg-[var(--gray-100)] px-4 py-[6px]">
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={(event) => handleSearch(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="닉네임을 검색해주세요"
          className="flex-1 bg-transparent outline-none text-body-2-m text-[var(--gray-black)] placeholder:text-[var(--gray-400)]"
        />
        <IconButton
          src="/team/search.svg"
          alt="검색"
          width={20}
          height={20}
          onClick={handleSearchClick}
        />
      </div>

      {/* 검색 결과 */}
      {searchResults.length > 0 && (
        <div className="flex w-full flex-col gap-2">
          {searchResults.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between self-stretch h-[44px] px-4 py-[9px] rounded-[10px] bg-[var(--primary-100)]"
            >
              <div className="flex flex-col gap-1">
                <span className="text-body-2-m text-[var(--gray-800)]">
                  {member.nickname + " " + member.email + ""}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onInvite?.(member);
                  clearSearchResults();
                }}
                className="flex h-[24px] items-center justify-center gap-[5px] rounded-[5px] bg-[var(--primary-500)] px-2 text-[var(--gray-white)] text-caption-m"
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

