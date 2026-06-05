'use server'

import { db } from '@/lib/db';
import { funds } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getFunds() {
  return await db.select({
    id: funds.id,
    name: funds.name,
    balance: funds.balance,
    isDefault: funds.isDefault
  }).from(funds).orderBy(funds.name);
}

export async function createFund(data: {
  name: string;
  balance: number;
}) {
  const [newFund] = await db.insert(funds).values({
    name: data.name,
    balance: data.balance,
    isDefault: false,
  }).returning();

  revalidatePath('/', 'layout');
  revalidatePath('/settings', 'page');
  return newFund;
}

export async function updateFund(id: string, data: {
  name?: string;
  balance?: number;
}) {
  const [updatedFund] = await db.update(funds)
    .set({ 
      ...data,
      updatedAt: new Date() 
    })
    .where(eq(funds.id, id))
    .returning();
  
  revalidatePath('/', 'layout');
  revalidatePath('/settings', 'page');
  return updatedFund;
}

export async function deleteFund(id: string) {
  const fund = await db.query.funds.findFirst({
    where: eq(funds.id, id),
  });
  
  if (fund?.isDefault) {
    throw new Error("Cannot delete the default fund");
  }

  const result = await db.delete(funds).where(eq(funds.id, id)).returning();
  
  revalidatePath('/', 'layout');
  revalidatePath('/settings', 'page');
  return result;
}

export async function setDefaultFund(id: string) {
  const result = await db.transaction(async (tx) => {
    await tx.update(funds).set({ isDefault: false });
    const [updated] = await tx.update(funds).set({ isDefault: true }).where(eq(funds.id, id)).returning();
    return updated;
  });

  revalidatePath('/', 'layout');
  revalidatePath('/settings', 'page');
  return result;
}
