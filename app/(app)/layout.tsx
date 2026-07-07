import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getBalance } from "@/lib/credits";
import { getPlan } from "@/lib/plans";
import { Sidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const credits = await getBalance(user.id);
  const plan = getPlan(user.subscription?.plan);

  return (
    <div className="flex min-h-dvh bg-bg">
      <Sidebar planId={plan.id} planName={plan.name} credits={credits} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          name={user.name}
          email={user.email}
          planName={plan.name}
          credits={credits}
        />
        <main className="flex-1 px-4 pb-28 pt-8 sm:px-6 lg:px-10 lg:pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
