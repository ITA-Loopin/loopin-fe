type TitleInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function TitleInput({ value, onChange }: TitleInputProps) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-[#676A79]">루프 이름</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="루프의 이름을 적어주세요"
        className="rounded-2xl border border-[#F0F0F3] bg-[#F9FAFB] px-4 py-3"
      />
    </label>
  );
}


