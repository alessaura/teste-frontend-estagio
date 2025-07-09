import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default function Home() {
  // Check for auth_token in cookies (since localStorage is not available server-side)
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token");

  if (token) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
  
  return null;
}
