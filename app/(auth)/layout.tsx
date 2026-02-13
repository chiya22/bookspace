import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-4">
      <div className="mb-8 flex justify-center">
        <Image
          src="/company_logo.svg"
          alt="ロゴ"
          width={400}
          height={400}
          className="h-36 w-auto max-w-[200px] object-contain object-center"
          unoptimized
        />
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
