import { TokenCard } from './TokenCard';

interface SelectableTokenCardProps {
  tokenId: string;
  isSelected: boolean;
  selectToken?: (tokenId: string) => void;
}

export function SelectableTokenCard(props: SelectableTokenCardProps) {
  let style = 'p-2 cursor-pointer';
  if (props.isSelected) style += ' bg-blue-700';

  return (
    <div
      className={style}
      onClick={() => {
        if (props.selectToken) {
          props.selectToken(props.tokenId);
        }
      }}
    >
      <TokenCard tokenId={props.tokenId}></TokenCard>
    </div>
  );
}
