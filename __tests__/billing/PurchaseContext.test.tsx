import React from 'react';
import { Text } from 'react-native';
import { render, waitFor, act } from '@testing-library/react-native';
import { PurchaseProvider, usePurchases } from '../../src/context/PurchaseContext';
import { BillingClient } from '../../src/billing/service';

let state: ReturnType<typeof usePurchases>;
function Probe() {
  const value = usePurchases();
  React.useEffect(() => {
    state = value;
  });
  return <Text>{String(value.fullLibrary)}</Text>;
}
function client(overrides: Partial<BillingClient> = {}): BillingClient {
  return {
    customer: async () => false,
    product: async () => ({ priceString: '$19.99' }) as any,
    purchase: async () => true,
    restore: async () => false,
    subscribe: () => () => {},
    ...overrides,
  };
}
it('keeps learning ready when billing is unavailable and never grants a simulated purchase', async () => {
  render(
    <PurchaseProvider client={null}>
      <Probe />
    </PurchaseProvider>,
  );
  await waitFor(() => expect(state.ready).toBe(true));
  await act(async () => {
    await state.purchase();
  });
  expect(state.fullLibrary).toBe(false);
  expect(state.message).toBe('unavailable');
});
it('restores without a loaded product and applies later revocation', async () => {
  let listener: (full: boolean) => void = () => {};
  const billing = client({
    product: async () => null,
    restore: async () => true,
    subscribe: (fn) => {
      listener = fn;
      return () => {};
    },
  });
  render(
    <PurchaseProvider client={billing}>
      <Probe />
    </PurchaseProvider>,
  );
  await waitFor(() => expect(state.ready).toBe(true));
  await act(async () => {
    await state.restore();
  });
  expect(state.fullLibrary).toBe(true);
  act(() => listener(false));
  expect(state.fullLibrary).toBe(false);
});
it('retains last confirmed access on network failure and clears stale product price', async () => {
  let offline = false;
  const billing = client({
    customer: async () => {
      if (offline) throw new Error('offline');
      return true;
    },
    product: async () => {
      if (offline) throw new Error('offline');
      return { priceString: '$19.99' } as any;
    },
  });
  render(
    <PurchaseProvider client={billing}>
      <Probe />
    </PurchaseProvider>,
  );
  await waitFor(() => expect(state.ready).toBe(true));
  offline = true;
  await act(async () => {
    await state.refresh();
  });
  expect(state.fullLibrary).toBe(true);
  expect(state.product).toBeNull();
  expect(state.message).toBe('error');
});
it.each([
  ['cancelled', { userCancelled: true }],
  ['pending', { code: '20' }],
  ['error', new Error('failed')],
])('reports %s without granting access', async (message, error) => {
  render(
    <PurchaseProvider
      client={client({
        purchase: async () => {
          throw error;
        },
      })}
    >
      <Probe />
    </PurchaseProvider>,
  );
  await waitFor(() => expect(state.ready).toBe(true));
  await act(async () => {
    await state.purchase();
  });
  expect(state.fullLibrary).toBe(false);
  expect(state.message).toBe(message);
});
it('serializes rapid purchase and restore taps', async () => {
  let finish: (full: boolean) => void = () => {};
  let checkouts = 0;
  const billing = client({
    purchase: () => {
      checkouts++;
      return new Promise((resolve) => {
        finish = resolve;
      });
    },
    restore: async () => {
      checkouts++;
      return false;
    },
  });
  render(
    <PurchaseProvider client={billing}>
      <Probe />
    </PurchaseProvider>,
  );
  await waitFor(() => expect(state.ready).toBe(true));
  let pending: Promise<void>;
  act(() => {
    pending = state.purchase();
    void state.purchase();
    void state.restore();
  });
  expect(checkouts).toBe(1);
  await act(async () => {
    finish(true);
    await pending!;
  });
  expect(state.fullLibrary).toBe(true);
});
it('ignores an older foreground read completing after a successful purchase', async () => {
  let resolve: (value: boolean) => void = () => {};
  let reads = 0;
  const billing = client({
    customer: () =>
      ++reads === 1
        ? Promise.resolve(false)
        : new Promise((r) => {
            resolve = r;
          }),
  });
  render(
    <PurchaseProvider client={billing}>
      <Probe />
    </PurchaseProvider>,
  );
  await waitFor(() => expect(state.ready).toBe(true));
  let refresh: Promise<void>;
  act(() => {
    refresh = state.refresh();
  });
  await act(async () => {
    await state.purchase();
  });
  await act(async () => {
    resolve(false);
    await refresh!;
  });
  expect(state.fullLibrary).toBe(true);
});

it('still loads the store price when the SDK emits CustomerInfo during its startup read', async () => {
  let listener: (full: boolean) => void = () => {};
  const billing = client({
    customer: async () => {
      await Promise.resolve();
      listener(false);
      return false;
    },
    subscribe: (fn) => {
      listener = fn;
      return () => {};
    },
  });
  render(
    <PurchaseProvider client={billing}>
      <Probe />
    </PurchaseProvider>,
  );
  await waitFor(() => expect(state.ready).toBe(true));
  await waitFor(() => expect(state.product?.priceString).toBe('$19.99'));
});

it('opens cached purchased learning without waiting for a slow store product lookup', async () => {
  let release: (product: any) => void = () => {};
  const billing = client({
    customer: async () => true,
    product: () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  });
  render(
    <PurchaseProvider client={billing}>
      <Probe />
    </PurchaseProvider>,
  );
  await waitFor(() => expect(state.fullLibrary).toBe(true));
  expect(state.ready).toBe(true);
  await act(async () => release(null));
});
