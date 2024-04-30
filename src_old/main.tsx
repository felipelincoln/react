import { LoaderFunctionArgs, createBrowserRouter } from 'react-router-dom';
import './css/index.css';

if (!['dark', 'light'].includes(localStorage.theme)) {
  const preferedColor = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

  localStorage.setItem('theme', preferedColor);
}
document.documentElement.classList.add(localStorage.theme);

export function contractLoader({ params }: LoaderFunctionArgs): { contract: string } {
  const contract = params.contract!;

  return { contract };
}

const router = createBrowserRouter([
  {
    errorElement: <NotFoundPage />,
  },
  {
    path: '/c/:contract',
    element: (
      <App>
        <div>oi</div>
      </App>
    ),
    loader: collectionLoader,
  },
  {
    path: '/c/:contract/activity',
    element: (
      <App>
        <CollectionActivities></CollectionActivities>
      </App>
    ),
    loader: collectionLoader,
  },
  {
    path: '/c/:contract/order/create/:tokenId',
    element: (
      <App>
        <OrderCreate></OrderCreate>
      </App>
    ),
    loader: OrderCreateLoader,
  },
  {
    path: '/c/:contract/order/fulfill/:tokenId',
    element: (
      <App>
        <OrderFulfill></OrderFulfill>
      </App>
    ),
    loader: OrderFulfillLoader,
  },
  {
    path: '/components',
    element: <Components></Components>,
    loader: OrderFulfillLoader,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />);
