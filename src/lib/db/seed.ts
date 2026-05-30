import { db } from './index';
import { funds } from './schema';

async function seed() {
  console.log('Checking for default fund...');
  const existingFunds = await db.select().from(funds);
  
  if (existingFunds.length === 0) {
    console.log('No funds found. Seeding default fund...');
    await db.insert(funds).values({
      name: 'Quỹ chính',
      isDefault: true,
      balance: 0,
    });
    console.log('Default fund "Quỹ chính" created.');
  } else {
    console.log(`Found ${existingFunds.length} funds.`);
  }
}

seed().catch(console.error);
