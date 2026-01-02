type TitleInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function TitleInput({ value, onChange }: TitleInputProps) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="text-xs font-medium text-[#A0A9B1] leading-[140%] tracking-[-0.24px]">루프 이름</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="루프의 이름을 적어주세요"
        className="flex h-[50px] w-full items-center gap-2.5 rounded-[10px] border border-[#DDE0E3] bg-[#F9FAFB] px-4 py-[13px] text-base font-semibold leading-[150%] tracking-[-0.32px] text-[#121212] placeholder:font-medium placeholder:text-[#C6CCD1]"
      />
    </label>
  );
}


