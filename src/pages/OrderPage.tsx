import { Suspense } from "react";
import { OrderLoadingPàge } from "./fallback";
import { Outlet } from "react-router-dom";

export function OrderPage() {
  return (
    <Suspense fallback={<OrderLoadingPàge />}>
      <Outlet />
    </Suspense>
  );
}
