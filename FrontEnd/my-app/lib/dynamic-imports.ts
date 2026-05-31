import dynamic from 'next/dynamic';

// Dynamic import helpers to reduce initial bundle size.
// Each component is loaded lazily on demand with SSR disabled
// where client-only APIs are used.

export const DynamicModal = dynamic(
  () => import('../components/ui/Modal').then((mod) => mod.Modal),
  {
    ssr: false,
  }
);

export const DynamicWalletConnector = dynamic(
  () =>
    import('../components/wallet/WalletConnectionModal').then(
      (mod) => mod.WalletConnectionModal
    ),
  { ssr: false }
);

export const DynamicToastNotification = dynamic(
  () =>
    import('../components/notifications/Toast').then(
      (mod) => mod.ToastProvider
    ),
  { ssr: false, loading: () => null }
);
