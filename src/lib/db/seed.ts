import { db } from './index';
import { funds, transactions, categories } from './schema';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  console.log('Starting comprehensive seed...');

  // 1. Clean existing data (Optional, but good for a fresh start)
  // console.log('Cleaning existing data...');
  // await db.delete(transactions);
  // await db.delete(categories);
  // await db.delete(funds);

  // 2. Seed Funds
  console.log('Seeding funds...');
  const fundData = [
    { id: uuidv4(), name: 'Quỹ chính', isDefault: true, balance: 15000000 },
    { id: uuidv4(), name: 'Tiết kiệm', isDefault: false, balance: 50000000 },
    { id: uuidv4(), name: 'Đầu tư', isDefault: false, balance: 25000000 },
    { id: uuidv4(), name: 'Ăn chơi', isDefault: false, balance: 2000000 },
  ];
  
  const insertedFunds = await db.insert(funds).values(fundData).returning();

  // 3. Seed Categories
  console.log('Seeding categories...');
  const categoryData = [
    { id: uuidv4(), name: 'Ăn uống', type: 'EXPENSE' as const, icon: '🍜' },
    { id: uuidv4(), name: 'Lương', type: 'INCOME' as const, icon: '💰' },
    { id: uuidv4(), name: 'Di chuyển', type: 'EXPENSE' as const, icon: '🚌' },
    { id: uuidv4(), name: 'Mua sắm', type: 'EXPENSE' as const, icon: '🛒' },
    { id: uuidv4(), name: 'Giải trí', type: 'EXPENSE' as const, icon: '🎮' },
    { id: uuidv4(), name: 'Tiền thưởng', type: 'INCOME' as const, icon: '🧧' },
    { id: uuidv4(), name: 'Tiền nhà', type: 'EXPENSE' as const, icon: '🏠' },
    { id: uuidv4(), name: 'Học tập', type: 'EXPENSE' as const, icon: '📚' },
  ];
  const insertedCategories = await db.insert(categories).values(categoryData).returning();

  // 4. Seed Transactions (Large amount)
  console.log('Seeding transactions...');
  const txBatch: any[] = [];
  const now = new Date();
  
  // Generate transactions for the last 6 months
  for (let i = 0; i < 200; i++) {
    const date = new Date();
    date.setDate(now.getDate() - Math.floor(Math.random() * 180));
    
    const fund = insertedFunds[Math.floor(Math.random() * insertedFunds.length)];
    const isIncome = Math.random() > 0.8;
    const availableCats = insertedCategories.filter(c => c.type === (isIncome ? 'INCOME' : 'EXPENSE'));
    const category = availableCats[Math.floor(Math.random() * availableCats.length)];
    
    const amount = isIncome 
      ? Math.floor(Math.random() * 10 + 1) * 1000000 // 1M - 10M
      : Math.floor(Math.random() * 20 + 1) * 20000;   // 20k - 400k

    txBatch.push({
      id: uuidv4(),
      fundId: fund.id,
      categoryId: category.id,
      amount: amount,
      type: isIncome ? 'INCOME' : 'EXPENSE',
      note: `Giao dịch mẫu ${i + 1}`,
      date: date,
    });
  }

  await db.insert(transactions).values(txBatch);
  console.log(`Successfully seeded ${insertedFunds.length} funds, ${insertedCategories.length} categories, and ${txBatch.length} transactions.`);
}

seed().catch(console.error);
