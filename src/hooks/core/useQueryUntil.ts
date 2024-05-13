import { QueryKey, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type QueryUntilStatus = "idle" | "pending" | "success" | "error";

export function useQueryUntil<T>(query: {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
  queryUntilFn: (data?: T) => boolean;
  enabled: boolean;
}) {
  const [status, setStatus] = useState<QueryUntilStatus>("idle");
  const { data, isFetching, isError } = useQuery({
    ...query,
    refetchInterval: 1000,
    enabled: query.enabled && status != "success",
  });

  useEffect(() => {
    if (!query.enabled) {
      setStatus("idle");
      return;
    }

    if (query.queryUntilFn(data)) {
      setStatus("success");
      return;
    }

    if (isError) {
      setStatus("error");
      return;
    }

    if (isFetching) {
      setStatus("pending");
      return;
    }
  }, [query, data, isFetching, isError]);

  return { status, isSuccess: status == "success", isError: status == "error" };
}
