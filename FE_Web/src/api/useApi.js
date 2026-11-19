import { useCallback, useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { endpoint, allowed } from "../../../shared/api/catalog.ts";

export function useApi(id, options = {}) {
    const { client, revision, user, role, restoring } = useApp();
    const [state, setState] = useState({ loading: true });
    const [reload, setReload] = useState(0);
    const optionsKey = JSON.stringify(options);
    const spec = id ? endpoint(id) : null;
    const permitted =
        spec && allowed(spec, user?.roles || [], user ? role : "guest");
    useEffect(() => {
        let active = true;
        const controller = new AbortController();
        if (!id || !permitted || restoring) {
            setState({ loading: false });
            return;
        }
        setState({ loading: true });
        client
            .request(endpoint(id), {
                ...JSON.parse(optionsKey),
                signal: controller.signal,
            })
            .then((result) => {
                if (active) setState({ loading: false, result });
            })
            .catch((error) => {
                if (active && error.code !== "CANCELLED")
                    setState({ loading: false, error });
            });
        return () => {
            active = false;
            controller.abort();
        };
    }, [id, optionsKey, permitted, restoring, client, revision, reload]);
    return {
        ...state,
        permitted,
        refresh: useCallback(() => setReload((n) => n + 1), []),
    };
}
