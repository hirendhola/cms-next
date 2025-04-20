import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { roleRedirectMap } from "@/lib/roleRedirectMap";

export default async function DashboardRedirectPage() {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  const role = user?.role;
  const targetPath = role ? roleRedirectMap[role] : null;

  if (!targetPath) {
    redirect("/not-authorized");
  }

  redirect(targetPath);
}
