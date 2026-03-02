import { useQuery } from "@tanstack/react-query";

export function useLead(leadId: string, companyId: string) {
  return useQuery({
    queryKey: ["leads", leadId, companyId],
    queryFn: async () => {
      const res = await fetch(`/api/leads/${leadId}?companyId=${companyId}`);
      if (!res.ok) throw new Error("Failed to fetch lead");
      return res.json();
    },
    enabled: !!leadId && !!companyId && leadId !== "new", // Don't fetch if it's a "new" lead
  });
}
