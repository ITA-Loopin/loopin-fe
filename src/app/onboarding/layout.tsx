export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50"
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {children}
    </div>
  );
}
