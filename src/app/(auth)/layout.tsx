export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center bg-background">
      {children}
      {/* <div className="w-full max-w-md h-[600px] bg-card rounded-[25px] shadow-custom">
      </div> */}
    </div>
  );
}
