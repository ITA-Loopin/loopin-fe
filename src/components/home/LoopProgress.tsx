type LoopProgressProps = {
  progress: number;
};

export function LoopProgress({ progress }: LoopProgressProps) {
  return (
    <section>
      <div className="relative flex items-center justify-center">
        <img
          src="/homeTab/homeTab_loop.svg"
          alt="루프 진행률"
          className="w-80 h-80"
        />
        <span className="absolute text-2xl font-bold">{progress}%</span>
      </div>
    </section>
  );
}

