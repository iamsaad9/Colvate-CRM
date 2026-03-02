import { useQuery } from "@tanstack/react-query";
import { User } from "@/app/types/types";

export function useAllUser<T = User[]>(companyId: string) {
  return useQuery<T>({
    queryKey: ["users", companyId],
    queryFn: async () => {
      const res = await fetch(`/api/users?companyId=${companyId}`);
      console.log("Fetching users for companyId:", companyId);
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      return res.json();
    },
    enabled: !!companyId,
  });
}
