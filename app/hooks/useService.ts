import { useQuery } from "@tanstack/react-query";

export function useService(serviceId: string, companyId: string) {
  return useQuery({
    queryKey: ["services", serviceId, companyId],
    queryFn: async () => {
      const res = await fetch(
        `/api/services/${serviceId}?companyId=${companyId}`,
      );
      console.log("Fetching services for companyId:", companyId);
      if (!res.ok) {
        throw new Error("Failed to fetch services");
      }
      return res.json();
    },
    enabled: !!companyId,
  });
}
