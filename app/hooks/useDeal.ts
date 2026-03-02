import { useQuery } from "@tanstack/react-query";

export function useDeal(dealId: string, companyId: string) {
  return useQuery({
    queryKey: ["deals", dealId, companyId],
    queryFn: async () => {
      const res = await fetch(`/api/deals/${dealId}?companyId=${companyId}`);
      if (!res.ok) throw new Error("Failed to fetch deal");
      return res.json();
    },
    enabled: !!dealId && !!companyId && dealId !== "new",
  });
}
