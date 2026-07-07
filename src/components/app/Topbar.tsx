import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Badge } from "@/components/ui/Badge";
import { CreditBadge } from "./CreditBadge";
import { UserMenu } from "./UserMenu";

interface TopbarProps {
  name: string | null;
  email: string;
  planName: string;
  credits: number;
}

export function Topbar({ name, email, planName, credits }: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-10">
        <Link
          href="/dashboard"
          aria-label="AdReel dashboard"
          className="rounded-lg transition-opacity hover:opacity-80 lg:hidden"
        >
          <Logo size={26} withWordmark={false} />
        </Link>

        <div className="ml-auto flex items-center gap-2.5">
          <Badge tone="neutral" className="hidden md:inline-flex">
            {planName} plan
          </Badge>
          <CreditBadge credits={credits} />
          <ThemeToggle />
          <UserMenu name={name} email={email} planName={planName} />
        </div>
      </div>
    </header>
  );
}
