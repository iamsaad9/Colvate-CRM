import { useQuery } from "@tanstack/react-query";

export function useAllServices(companyId: string) {
  return useQuery({
    queryKey: ["services", companyId],
    queryFn: async () => {
      const res = await fetch(`/api/services?companyId=${companyId}`);
      console.log("Fetching services for companyId:", companyId);
      if (!res.ok) {
        throw new Error("Failed to fetch services");
      }
      return res.json();
    },
    enabled: !!companyId,
  });
}
