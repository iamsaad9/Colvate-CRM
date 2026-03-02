import { useQuery } from "@tanstack/react-query";

export function useAllLeads(companyId: string) {
  return useQuery({
    queryKey: ["leads", companyId],
    queryFn: async () => {
      const res = await fetch(`/api/leads?companyId=${companyId}`);
      console.log("Fetching leads for companyId:", companyId);
      if (!res.ok) {
        throw new Error("Failed to fetch leads");
      }
      return res.json();
    },
    enabled: !!companyId,
  });
}
