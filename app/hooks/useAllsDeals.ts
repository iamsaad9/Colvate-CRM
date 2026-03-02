import { useQuery } from "@tanstack/react-query";

export function useAllDeals(companyId: string) {
  return useQuery({
    queryKey: ["deals", companyId],
    queryFn: async () => {
      const res = await fetch(`/api/deals?companyId=${companyId}`);
      console.log("Fetching deals for companyId:", companyId);
      if (!res.ok) {
        throw new Error("Failed to fetch services");
      }
      return res.json();
    },
    enabled: !!companyId,
  });
}
