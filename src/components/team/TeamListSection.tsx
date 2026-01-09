import Link from "next/link";

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
        <h2 className="text-body-1-sb text-[var(--gray-800)]">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-center text-caption-r text-[var(--gray-500)]">
            전체보기 &gt;
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

