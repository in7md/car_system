import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = ((session.user as any)?.role || "").toUpperCase();

  // توجيه الموظف العادي إلى واجهة الموظف
  if (role === "EMPLOYEE") {
    redirect("/employee");
  } else if (role === "OWNER" || role === "MANAGER" || role === "ACCOUNTANT") {
    // توجيه الإدارة والمحاسبين إلى لوحة القيادة
    redirect("/dashboard");
  } else {
    redirect("/vehicles");
  }
}
