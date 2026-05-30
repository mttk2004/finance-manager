import { getFunds, getCategories } from "@/lib/db/actions";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const funds = await getFunds();
  const categories = await getCategories();
  
  return <SettingsClient initialFunds={funds} initialCategories={categories} />;
}
