import { Logo } from '@/components/icons/logo';

export function Header() {
  return (
    <header className="sticky top-0 z-10 p-4 border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex items-center gap-3">
        <Logo className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">QuakeAlert</h1>
      </div>
    </header>
  );
}
