import Image from "next/image";

export function HomeHeader() {
  return (
    <header className="px-4 pt-4 pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* Loopin Logo */}
          <Image
            src="/homeTab/homeTab_logo.svg"
            alt="Loopin"
            width={68}
            height={30}
            className="h-8 w-auto"
          />
        </div>
        <div className="flex items-center gap-3">
          {/* 프로필 아이콘 */}
          <Image
            src="/homeTab/homeTab_profile.svg"
            alt="프로필"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          {/* 알림 아이콘 */}
          <Image
            src="/homeTab/homeTab_bell.svg"
            alt="알림"
            width={24}
            height={24}
            className="w-6 h-6"
          />
        </div>
      </div>
    </header>
  );
}

