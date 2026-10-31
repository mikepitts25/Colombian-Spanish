import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import type { PurchasesStoreProduct } from 'react-native-purchases';
import { BillingClient, getBillingClient } from '../billing/service';

export type PurchaseMessage =
  | 'unavailable'
  | 'error'
  | 'cancelled'
  | 'pending'
  | 'purchased'
  | 'restored'
  | 'nothing'
  | null;
type PurchaseState = {
  ready: boolean;
  fullLibrary: boolean;
  product: PurchasesStoreProduct | null;
  available: boolean;
  busy: boolean;
  refreshing: boolean;
  message: PurchaseMessage;
  refresh(): Promise<void>;
  purchase(): Promise<void>;
  restore(): Promise<void>;
};
const fallback: PurchaseState = {
  ready: true,
  fullLibrary: false,
  product: null,
  available: false,
  busy: false,
  refreshing: false,
  message: null,
  refresh: async () => {},
  purchase: async () => {},
  restore: async () => {},
};
const PurchaseContext = createContext<PurchaseState>(fallback);

export function PurchaseProvider({
  children,
  client,
}: {
  children: ReactNode;
  client?: BillingClient | null;
}) {
  const [billing] = useState(() => {
    try {
      return client === undefined ? getBillingClient() : client;
    } catch {
      return null;
    }
  });
  const [ready, setReady] = useState(!billing);
  const [fullLibrary, setFullLibrary] = useState(false);
  const [product, setProduct] = useState<PurchasesStoreProduct | null>(null);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<PurchaseMessage>(null);
  const writing = useRef(false);
  const generation = useRef(0);
  const refreshSequence = useRef(0);
  const mounted = useRef(true);
  const refresh = useCallback(async () => {
    if (!billing || writing.current) return;
    const version = generation.current;
    const request = ++refreshSequence.current;
    setRefreshing(true);
    const customerRead = billing.customer().then((value) => {
      if (mounted.current && request === refreshSequence.current) {
        if (version === generation.current) setFullLibrary(value);
        setReady(true);
      }
    });
    const [customer, item] = await Promise.allSettled([customerRead, billing.product()]);
    if (!mounted.current || request !== refreshSequence.current) return;
    setProduct(item.status === 'fulfilled' ? item.value : null);
    setMessage(customer.status === 'rejected' || item.status === 'rejected' ? 'error' : null);
    setReady(true);
    setRefreshing(false);
  }, [billing]);

  useEffect(() => {
    mounted.current = true;
    // Load external store state on mount; free learning does not wait on this request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    const unsubscribe = billing?.subscribe((value) => {
      if (!mounted.current) return;
      // A purchase/restore result supersedes any earlier read in flight.
      generation.current++;
      setFullLibrary(value);
      setReady(true);
      setRefreshing(false);
    });
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => {
      mounted.current = false;
      unsubscribe?.();
      appState.remove();
    };
  }, [billing, refresh]);

  async function transact(kind: 'purchase' | 'restore') {
    if (writing.current) return;
    if (!billing || (kind === 'purchase' && !product)) {
      setMessage('unavailable');
      return;
    }
    writing.current = true;
    generation.current++;
    refreshSequence.current++;
    setRefreshing(false);
    setBusy(true);
    setMessage(null);
    try {
      const unlocked =
        kind === 'purchase' ? await billing.purchase(product!) : await billing.restore();
      if (mounted.current) {
        setFullLibrary(unlocked);
        setMessage(
          unlocked
            ? kind === 'purchase'
              ? 'purchased'
              : 'restored'
            : kind === 'purchase'
              ? 'pending'
              : 'nothing',
        );
        setReady(true);
      }
    } catch (error) {
      const failure = error as { userCancelled?: boolean; code?: string | number };
      if (mounted.current)
        setMessage(
          failure?.userCancelled
            ? 'cancelled'
            : String(failure?.code) === '20'
              ? 'pending'
              : 'error',
        );
    } finally {
      writing.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  return (
    <PurchaseContext.Provider
      value={{
        ready,
        fullLibrary,
        product,
        available: !!billing,
        busy,
        refreshing,
        message,
        refresh,
        purchase: () => transact('purchase'),
        restore: () => transact('restore'),
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
}
export function usePurchases() {
  return useContext(PurchaseContext);
}
