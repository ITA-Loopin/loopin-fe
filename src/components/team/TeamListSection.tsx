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
    <section className="px-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#3A3D40]">{title}</h2>
        {viewAllHref && (
          <a
            href={viewAllHref}
            className="text-sm font-medium text-[#A0A9B1] transition-colors hover:text-[#737980]"
          >
            전체보기 &gt;
          </a>
        )}
      </div>
      {children}
    </section>
  );
}

