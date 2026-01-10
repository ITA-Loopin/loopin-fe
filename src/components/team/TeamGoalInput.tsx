type TeamGoalInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function TeamGoalInput({ value, onChange }: TeamGoalInputProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-caption-r text-[var(--gray-500)]">
        팀 목표
      </span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="팀의 목표를 적어주세요"
        className="flex h-[50px] w-full items-center gap-2.5 rounded-[10px] border border-[var(--gray-300)] px-4 py-[13px] text-body-1-m text-[var(--gray-black)] placeholder:text-[var(--gray-400)]"
      />
    </label>
  );
}

