import { redirect } from "next/navigation";
import { B2BShell } from "@/components/layout/B2BShell";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { getSoftLockState } from "@/lib/soft-lock";

export default async function B2BLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  const [softLockState, user] = await Promise.all([
    getSoftLockState(session.tenantId),
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true },
    }),
  ]);

  const userName = user?.name || "Vendeur";
  const userInitials = userName.substring(0, 2).toUpperCase();

  return (
    <B2BShell
      softLockState={softLockState}
      userName={userName}
      userInitials={userInitials}
    >
      {children}
    </B2BShell>
  );
}
