type Listener = () => void;

// A cached, hydratable view of a JSON list in localStorage. getSnapshot is
// stable between changes, and getServerSnapshot returns a stable empty list so
// the server HTML and first client render always agree.
export function createLocalStorageListStore<T>(key: string, parse: (value: unknown) => T[]) {
    const emptyList: T[] = [];
    let cache: T[] | null = null;
    const listeners = new Set<Listener>();

    const notify = () => {
        listeners.forEach((listener) => listener());
    };

    const onStorage = (event: StorageEvent) => {
        if (event.key !== null && event.key !== key) return;
        cache = null;
        notify();
    };

    const subscribe = (listener: Listener) => {
        listeners.add(listener);
        if (typeof window !== "undefined") {
            window.addEventListener("storage", onStorage);
        }
        return () => {
            listeners.delete(listener);
            if (listeners.size === 0 && typeof window !== "undefined") {
                window.removeEventListener("storage", onStorage);
            }
        };
    };

    const getSnapshot = (): T[] => {
        if (cache !== null) return cache;
        if (typeof window === "undefined") return emptyList;
        try {
            const raw = window.localStorage.getItem(key);
            if (!raw) {
                cache = emptyList;
                return cache;
            }
            cache = parse(JSON.parse(raw) as unknown);
            return cache;
        } catch {
            cache = emptyList;
            return cache;
        }
    };

    const getServerSnapshot = (): T[] => emptyList;

    const set = (items: T[]): boolean => {
        if (typeof window === "undefined") return false;
        try {
            window.localStorage.setItem(key, JSON.stringify(items));
            cache = items;
            notify();
            return true;
        } catch {
            return false;
        }
    };

    return { subscribe, getSnapshot, getServerSnapshot, set };
}
