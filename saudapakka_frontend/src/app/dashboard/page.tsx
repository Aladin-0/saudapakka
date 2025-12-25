import { redirect } from "next/navigation";

export default function DashboardRoot() {
  // Automatically send user to the Overview page
  redirect("/dashboard/overview");
}