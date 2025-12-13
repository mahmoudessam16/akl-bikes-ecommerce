import Image from 'next/image';

interface MainLoadingProps {
  logoUrl?: string;
}

export function MainLoading({ logoUrl = '/imgs/logo-light.PNG' }: MainLoadingProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center gap-6">
        {/* Logo with pulse animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse-scale"></div>
          <Image
            src={logoUrl}
            alt="Loading"
            width={240}
            height={96}
            className="h-24 w-auto object-contain animate-pulse-scale relative z-10"
            priority
            unoptimized={logoUrl.startsWith('data:') || logoUrl.startsWith('http://') || logoUrl.startsWith('https://')}
          />
        </div>
        
        {/* Loading dots */}
        <div className="flex gap-2 items-center">
          <div className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}

