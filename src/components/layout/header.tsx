import { Logo } from '@/components/icons/logo';

export function Header() {
  return (
    <header className="p-4 border-b bg-card">
      <div className="container mx-auto flex items-center gap-3">
        <Logo className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">QuakeAlert</h1>
      </div>
    </header>
  );
}
