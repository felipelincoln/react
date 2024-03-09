import { ReactElement } from 'react';

interface ActivitiesFeedProps {
  children: ReactElement[] | ReactElement;
}

export function ActivitiesFeed(props: ActivitiesFeedProps) {
  return <div>{props.children}</div>;
}
