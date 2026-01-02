type TeamListSectionProps = {
  title: string;
  viewAllHref?: string;
  children: React.ReactNode;
};

export function TeamListSection({
  title,
  viewAllHref,
  children,
}: TeamListSectionProps) {
  return (
    <section className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold leading-[150%] tracking-[-0.32px] text-[#3A3D40]">{title}</h2>
        {viewAllHref && (
          <a
            href={viewAllHref}
            className="text-center text-xs font-medium leading-[140%] tracking-[-0.24px] text-[#A0A9B1]"
          >
            전체보기 &gt;
          </a>
        )}
      </div>
      {children}
    </section>
  );
}

