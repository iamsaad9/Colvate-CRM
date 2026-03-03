import { useQuery } from "@tanstack/react-query";
import { Customer } from "@/app/types/types";

export function useCustomers<T = Customer[]>(companyId: string) {
  return useQuery<T>({
    queryKey: ["customers", companyId],
    queryFn: async () => {
      const res = await fetch(`/api/customers?companyId=${companyId}`);
      console.log("Fetching customers for companyId:", companyId);
      if (!res.ok) {
        throw new Error("Failed to fetch customers");
      }
      return res.json();
    },
    enabled: !!companyId,
  });
}
