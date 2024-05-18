import { Suspense } from 'react';
import { OrderLoadingPage } from './fallback';
import { Outlet } from 'react-router-dom';

export function OrderPage() {
  return (
    <Suspense fallback={<OrderLoadingPage />}>
      <Outlet />
    </Suspense>
  );
}
