import { useEffect, useState, useCallback } from "react";
import { ApiError } from "../api/client";
import { endpoint, allowed } from "../api/catalog";
import type { ApiResult } from "../api/types";
import type { RequestOptions } from "../api/client";
import { useApp } from "../contexts/AppContext";
export function useApi(
  id: number | string | null,
  options: RequestOptions = {},
) {
  const { client, revision, role, user } = useApp();
  const [result, setResult] = useState<ApiResult>(),
    [error, setError] = useState<ApiError>(),
    [loading, setLoading] = useState(false),
    [reload, setReload] = useState(0);
  const key = JSON.stringify(options);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setResult(undefined);
    setError(undefined);
    if (id === null) {
      setLoading(false);
      return;
    }
    const spec = endpoint(id);
    if (!allowed(spec, user?.roles ?? [], role)) {
      setLoading(false);
      setError(
        new ApiError("Vui lòng đăng nhập để tiếp tục.", {
          code: "LOGIN_REQUIRED",
          status: 401,
        }),
      );
      return;
    }
    setLoading(true);
    client
      .request(spec, { ...JSON.parse(key), signal: controller.signal })
      .then((value) => {
        if (active) setResult(value);
      })
      .catch((error) => {
        if (active && error.code !== "CANCELLED")
          setError(
            error instanceof ApiError
              ? error
              : new ApiError("Không tải được dữ liệu."),
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [id, key, client, revision, reload, role, user]);
  return {
    result,
    error,
    loading,
    refresh: useCallback(() => setReload((n) => n + 1), []),
  };
}
