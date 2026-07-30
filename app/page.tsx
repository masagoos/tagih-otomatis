import { redirect } from "next/navigation";

export default function Home() {
  // Landing page menyusul di fase marketing — untuk MVP langsung ke aplikasi.
  redirect("/dashboard");
}
