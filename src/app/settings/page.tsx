import { getFunds } from "@/lib/db/actions";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const funds = await getFunds();
  
  return <SettingsClient initialFunds={funds} />;
}
