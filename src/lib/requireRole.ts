// lib/requireRole.ts
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function requireRole(allowedRoles: string[]) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  })

  if (!user || !allowedRoles.includes(user.role)) {
    redirect('/not-authorized')
  }

  return user
}
