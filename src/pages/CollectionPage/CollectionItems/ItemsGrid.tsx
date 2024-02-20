import { ReactElement } from 'react';

interface ItemsGridProps {
  children: ReactElement[] | ReactElement;
}

export function ItemsGrid(props: ItemsGridProps) {
  return <div className="flex flex-wrap gap-2 justify-center">{props.children}</div>;
}
