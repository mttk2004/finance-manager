import { db } from './index';
import { funds, transactions, categories, budgets, globalSettings } from './schema';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  console.log('Starting comprehensive seed...');

  // 1. Clean existing data
  console.log('Cleaning existing data...');
  await db.delete(transactions);
  await db.delete(categories);
  await db.delete(funds);
  await db.delete(budgets);
  await db.delete(globalSettings);

  // 2. Seed Funds
  console.log('Seeding funds...');
  const fundData = [
    { id: uuidv4(), name: 'Quỹ chính', isDefault: true, balance: 15000000 },
    { id: uuidv4(), name: 'Tiết kiệm', isDefault: false, balance: 50000000 },
    { id: uuidv4(), name: 'Đầu tư', isDefault: false, balance: 25000000 },
    { id: uuidv4(), name: 'Ăn chơi', isDefault: false, balance: 2000000 },
  ];
  
  const insertedFunds = await db.insert(funds).values(fundData).returning();

  // 3. Seed Categories with Hashtags
  console.log('Seeding categories...');
  const categoryData = [
    { id: uuidv4(), name: 'Ăn uống', type: 'EXPENSE' as const, icon: '🍜', hashtags: ['#an_sang', '#cafe', '#an_trua', '#an_toi'] },
    { id: uuidv4(), name: 'Lương', type: 'INCOME' as const, icon: '💰', hashtags: ['#luong', '#salary'] },
    { id: uuidv4(), name: 'Di chuyển', type: 'EXPENSE' as const, icon: '🚌', hashtags: ['#di_chuyen', '#xang', '#grab'] },
    { id: uuidv4(), name: 'Mua sắm', type: 'EXPENSE' as const, icon: '🛒', hashtags: ['#mua_sam', '#shopee', '#lazada'] },
    { id: uuidv4(), name: 'Giải trí', type: 'EXPENSE' as const, icon: '🎮', hashtags: ['#vui_ve', '#netflix', '#game'] },
    { id: uuidv4(), name: 'Tiền thưởng', type: 'INCOME' as const, icon: '🧧', hashtags: ['#thuong', '#bonus'] },
    { id: uuidv4(), name: 'Tiền nhà', type: 'EXPENSE' as const, icon: '🏠', hashtags: ['#tien_nha'] },
    { id: uuidv4(), name: 'Học tập', type: 'EXPENSE' as const, icon: '📚', hashtags: ['#lam_viec', '#hoc_tap', '#book'] },
    { id: uuidv4(), name: 'Kinh doanh', type: 'INCOME' as const, icon: '📈', hashtags: ['#kinh_doanh', '#business'] },
    { id: uuidv4(), name: 'Quà tặng', type: 'INCOME' as const, icon: '🎁', hashtags: ['#qua_tang', '#gift'] },
  ];
  const insertedCategories = await db.insert(categories).values(categoryData).returning();

  // 4. Seed Global Budgets
  console.log('Seeding global budgets...');
  const globalBudgets: Record<string, number> = {};
  insertedCategories.forEach(cat => {
    if (cat.type === 'EXPENSE') {
      if (cat.name === 'Ăn uống') globalBudgets[cat.id] = 5000000;
      if (cat.name === 'Di chuyển') globalBudgets[cat.id] = 1000000;
      if (cat.name === 'Mua sắm') globalBudgets[cat.id] = 2000000;
    }
  });
  await db.insert(globalSettings).values({
    key: 'global_budgets',
    value: globalBudgets,
  });

  // 5. Seed Month Override Budget
  console.log('Seeding month override budget...');
  const now = new Date();
  const currentMonthPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const foodCat = insertedCategories.find(c => c.name === 'Ăn uống')!;
  await db.insert(budgets).values({
    categoryId: foodCat.id,
    amountLimit: 6000000, // Higher limit for this month
    period: currentMonthPeriod,
    isOverride: true,
  });

  // 6. Seed Transactions (Large amount)
  console.log('Seeding transactions...');
  const txBatch: (typeof transactions.$inferInsert)[] = [];
  
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
      note: `Giao dịch mẫu ${i + 1} ${category.hashtags?.[0] || ''}`,
      date: date,
    });
  }

  await db.insert(transactions).values(txBatch);
  console.log(`Successfully seeded ${insertedFunds.length} funds, ${insertedCategories.length} categories, and ${txBatch.length} transactions.`);
}

seed().catch(console.error);
