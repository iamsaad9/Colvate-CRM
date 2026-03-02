import Header from "../components/Header";
import { UserProvider } from "@/app/context/UserContext";
import { getCurrentUser } from "../lib/get-current-user";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  return (
    <div className="h-full">
      <UserProvider user={user}>
        <Header />
        {children}
      </UserProvider>
    </div>
  );
}
