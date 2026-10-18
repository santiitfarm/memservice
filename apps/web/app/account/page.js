import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AccountSetting from "./_components/AccountSetting";
import OrderHistory from "./_components/OrderHistory";
import PersonalInfo from "./_components/PersonalInfo";

export default async function AccountPage() {
  const session = await auth();
  if (!session) {
    return redirect("/account/login");
  }
  if (!session.accessToken) {
    return redirect("/account/login");
  }
  const response = await fetch(
    `${process.env.API_URL}/api/customerProfile`,
    {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: "no-store",
    }
  );
  if (!response.ok) {
    return redirect("/account/login");
  }
  const data = await response.json();
  const user = data.customers?.[0];
  if (!user) {
    return redirect("/account/login");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>
        <PersonalInfo user={user} />
        <OrderHistory user={user} />
        <AccountSetting user={user} />
      </div>
    </div>
  );
}
