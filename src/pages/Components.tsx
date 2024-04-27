import React, { ReactElement, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { etherToString } from '../packages/utils';
import ReactDOM from 'react-dom/client';

export function Components() {
  const [dialog, setDialog] = useState(false);
  const [dialog2, setDialog2] = useState(false);

  return (
    <div className="p-20 bg-zinc-900 flex flex-row gap-6 flex-wrap">
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <Button>Button</Button>
        <Button disabled>Button:Disabled</Button>
        <Button loading>Button:Loading</Button>
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <ButtonLight>ButtonLight</ButtonLight>
        <ButtonLight disabled>ButtonLight:Disabled</ButtonLight>
        <ButtonLight loading>ButtonLight:Loading</ButtonLight>
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <ButtonRed>ButtonRed</ButtonRed>
        <ButtonRed disabled>ButtonRed:Disabled</ButtonRed>
        <ButtonRed loading>ButtonRed:Loading</ButtonRed>
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <ButtonBlue>ButtonBlue</ButtonBlue>
        <ButtonBlue disabled>ButtonBlue:Disabled</ButtonBlue>
        <ButtonBlue loading>ButtonBlue:Loading</ButtonBlue>
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <Tag onClick={() => {}}>Tag</Tag>
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <TagLight onClick={() => {}}>TagLight</TagLight>
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <PriceTag>PriceTag</PriceTag>
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <PriceTagClickable>PriceTagClickable</PriceTagClickable>
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <ExternalLink href="">5d ago</ExternalLink>
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <ActivityButton count={2} />
        <ActivityButton />
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <IconNFT src="https://i.seadn.io/gcs/files/829ed29f7da5b111f87add29cc6539ce.png?auto=format&dpr=1" />
        <IconEth />
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <Checkbox onClick={() => {}} label="Checkbox" />
        <Checkbox onClick={() => {}} label="Checkbox:Checked" checked />
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <Tootltip>Lorem ipsum dolor sit amet. Consectetur adipiscing elit</Tootltip>
      </div>
      <div className="flex flex-col w-72 h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <ButtonAccordion>ButtonAccordion</ButtonAccordion>
        <ButtonAccordion closed>ButtonAccordion:Closed</ButtonAccordion>
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <a>anchor</a>
        <a className="red">anchor.red</a>
        <a className="default">anchor.default</a>
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <ItemNFT
          src="https://i.seadn.io/gcs/files/829ed29f7da5b111f87add29cc6539ce.png?auto=format&dpr=1"
          tokenId={60}
        />
        <ItemETH value="20000000000000000" />
      </div>
      <div className="flex flex-row h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <CardNFTSelectable
          onSelect={() => {}}
          src="https://i.seadn.io/gcs/files/829ed29f7da5b111f87add29cc6539ce.png?auto=format&dpr=1"
          tokenId={62}
        />
        <CardNFTSelectable
          onSelect={() => {}}
          src="https://i.seadn.io/gcs/files/829ed29f7da5b111f87add29cc6539ce.png?auto=format&dpr=1"
          tokenId={62}
          selected
        />
        <CardNFTSelectable
          onSelect={() => {}}
          src="https://i.seadn.io/gcs/files/829ed29f7da5b111f87add29cc6539ce.png?auto=format&dpr=1"
          tokenId={62}
          disabled
        />
      </div>
      <div className="flex flex-row h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <CardNFTOrder
          contract=""
          symbol="RACCOOL"
          src="https://i.seadn.io/gcs/files/829ed29f7da5b111f87add29cc6539ce.png?auto=format&dpr=1"
          tokenId={33}
          priceToken="1"
        />
        <CardNFTOrder
          contract=""
          symbol="RACCOOL"
          src="https://i.seadn.io/gcs/files/829ed29f7da5b111f87add29cc6539ce.png?auto=format&dpr=1"
          tokenId={94}
          priceToken="1"
          priceEth="2"
        />
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <Input type="text" value={'Input'} />
        <Input type="text" value={'Input:Disabled'} disabled />
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <InputDisabledWithLabel label="label" value={'InputDisabledWithLabel'} />
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <TextBox>TextBox</TextBox>
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <TextBoxWithNFTs
          src="https://i.seadn.io/gcs/files/829ed29f7da5b111f87add29cc6539ce.png?auto=format&dpr=1"
          tokenIds={[1, 10, 100]}
          value="TextBoxWithNFTs"
        />
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <ActionButton onClick={() => {}}>ActionButton</ActionButton>
        <ActionButton onClick={() => {}} disabled>
          ActionButton:Disabled
        </ActionButton>
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <Paginator
          items={Array.from({ length: 100 })}
          page={0}
          setItems={() => {}}
          setPage={() => {}}
        ></Paginator>
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <ListedNFT
          name="Raccools"
          symbol="RACCOOL"
          src="https://i.seadn.io/gcs/files/829ed29f7da5b111f87add29cc6539ce.png?auto=format&dpr=1"
          tokenId={15}
          tokenPrice="2"
        />
        <ListedNFT
          name="Raccools"
          symbol="RACCOOL"
          src="https://i.seadn.io/gcs/files/829ed29f7da5b111f87add29cc6539ce.png?auto=format&dpr=1"
          tokenId={95}
          tokenPrice="2"
          ethPrice="10000000"
        />
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <Button onClick={() => setDialog(!dialog)}>Dialog:Closeable</Button>
        <Dialog open={dialog} setOpen={setDialog} title="Dialog">
          <div>test</div>
        </Dialog>
        <Button onClick={() => setDialog2(!dialog2)}>Dialog</Button>
        <Dialog open={dialog2} title="Dialog">
          <div>test</div>
        </Dialog>
      </div>
    </div>
  );
}

export function Button({
  children,
  disabled,
  loading,
  onClick,
}: {
  children?: number | string | [string, ReactElement] | ReactElement;
  disabled?: boolean;
  loading?: boolean;
  onClick?: Function;
}) {
  if (loading) {
    return (
      <button
        type="button"
        disabled={disabled}
        className="group h-8 px-4 rounded text-sm bg-zinc-800 text-zinc-200 whitespace-nowrap disabled:bg-inherit disabled:outline disabled:outline-1 -disabled:outline-offset-1 disabled:outline-zinc-700"
      >
        <span className="animate-pulse inline-block h-4 w-24 my-2 bg-zinc-700 group-disabled:bg-zinc-800"></span>
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={!!disabled}
      onClick={() => onClick?.()}
      className="h-8 px-4 rounded text-sm bg-zinc-800 text-zinc-200 whitespace-nowrap hover:bg-zinc-700 disabled:bg-inherit disabled:outline disabled:outline-1 disabled:-outline-offset-1 disabled:outline-zinc-700"
    >
      {children}
    </button>
  );
}

export function ButtonLight({
  children,
  disabled,
  loading,
  onClick,
}: {
  children?: number | string | [string, ReactElement] | ReactElement;
  disabled?: boolean;
  loading?: boolean;
  onClick?: Function;
}) {
  if (loading) {
    return (
      <button
        type="button"
        disabled={disabled}
        className="group h-8 px-4 rounded text-sm bg-zinc-700 text-zinc-200 whitespace-nowrap disabled:bg-inherit disabled:outline disabled:outline-1 -disabled:outline-offset-1 disabled:outline-zinc-600"
      >
        <span className="animate-pulse inline-block h-4 w-24 my-2 bg-zinc-600 group-disabled:bg-zinc-700"></span>
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={!!disabled}
      onClick={() => onClick?.()}
      className="h-8 px-4 rounded text-sm bg-zinc-700 text-zinc-200 whitespace-nowrap hover:bg-zinc-600 disabled:bg-inherit disabled:outline disabled:outline-1 disabled:-outline-offset-1 disabled:outline-zinc-600"
    >
      {children}
    </button>
  );
}

export function ButtonRed({
  children,
  disabled,
  loading,
  onClick,
}: {
  children?: number | string | [string, ReactElement] | ReactElement;
  disabled?: boolean;
  loading?: boolean;
  onClick?: Function;
}) {
  if (loading) {
    return (
      <button
        type="button"
        disabled={disabled}
        className="group h-8 px-4 rounded text-sm bg-red-400 text-zinc-950 whitespace-nowrap disabled:bg-inherit disabled:outline disabled:outline-1 disabled:-outline-offset-1 disabled:outline-zinc-700 disabled:text-zinc-200"
      >
        <span className="animate-pulse inline-block h-4 w-24 my-2 bg-red-300 group-disabled:bg-red-400"></span>
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={!!disabled}
      onClick={() => onClick?.()}
      className="h-8 px-4 rounded text-sm bg-red-400 font-medium text-zinc-950 whitespace-nowrap hover:bg-red-300 disabled:bg-inherit disabled:outline disabled:outline-1 disabled:-outline-offset-1 disabled:outline-zinc-700 disabled:text-zinc-200 disabled:font-normal"
    >
      {children}
    </button>
  );
}

export function ButtonBlue({
  children,
  disabled,
  loading,
  onClick,
}: {
  children?: number | string | [string, ReactElement] | ReactElement;
  disabled?: boolean;
  loading?: boolean;
  onClick?: Function;
}) {
  if (loading) {
    return (
      <button
        type="button"
        disabled={disabled}
        className="group h-8 px-4 rounded text-sm bg-cyan-400 text-zinc-950 whitespace-nowrap disabled:bg-inherit disabled:outline disabled:outline-1 -disabled:outline-offset-1 disabled:outline-cyan-500 disabled:text-cyan-500"
      >
        <span className="animate-pulse inline-block h-4 w-24 my-2 bg-cyan-300 group-disabled:bg-cyan-400"></span>
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={!!disabled}
      onClick={() => onClick?.()}
      className="h-8 px-4 rounded text-sm bg-cyan-400 font-medium text-zinc-950 whitespace-nowrap hover:bg-cyan-300 disabled:bg-inherit disabled:outline disabled:outline-1 disabled:-outline-offset-1 disabled:outline-cyan-500 disabled:text-cyan-500"
    >
      {children}
    </button>
  );
}

export function Tag({ children, onClick }: { children: string; onClick: Function }) {
  return (
    <Button onClick={() => onClick()}>
      {children}
      <svg
        className="inline h-4 w-4 align-text-bottom box-content pl-1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path
          d="M19 5L5 19M5 5L19 19"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Button>
  );
}

export function TagLight({ children, onClick }: { children: string; onClick: Function }) {
  return (
    <ButtonLight onClick={() => onClick()}>
      {children}
      <svg
        className="inline h-4 w-4 align-text-bottom box-content pl-1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path
          d="M19 5L5 19M5 5L19 19"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </ButtonLight>
  );
}

export function PriceTag({ children }: { children: string }) {
  return (
    <div className="h-6 w-fit px-2 rounded text-xs text-zinc-200 whitespace-nowrap bg-inherit border border-zinc-700 cursor-default">
      <span className="align-middle">{children}</span>
    </div>
  );
}

export function PriceTagClickable({ children, onClick }: { children: string; onClick?: Function }) {
  return (
    <div
      className="h-6 w-fit px-2 rounded text-xs whitespace-nowrap bg-inherit border border-zinc-700 cursor-pointer"
      onClick={() => onClick?.()}
    >
      <span className="align-middle">{children}</span>
    </div>
  );
}

export function ExternalLink({ children, href }: { children: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-xs text-zinc-400 hover:text-zinc-200"
    >
      {children}
      <svg
        className="inline h-4 w-4 align-text-bottom box-content pl-1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path
          d="M11.0988 3.00012C7.4498 3.00669 5.53898 3.09629 4.31783 4.31764C3 5.63568 3 7.75704 3 11.9997C3 16.2424 3 18.3638 4.31783 19.6818C5.63565 20.9999 7.75668 20.9999 11.9987 20.9999C16.2407 20.9999 18.3617 20.9999 19.6796 19.6818C20.9007 18.4605 20.9903 16.5493 20.9969 12.8998"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M20.5561 3.49637L11.0488 13.0589M20.5561 3.49637C20.0622 3.00175 16.7345 3.04785 16.031 3.05786M20.5561 3.49637C21.0501 3.99098 21.0041 7.32297 20.9941 8.02738"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}

export function ActivityButton({ count, onClick }: { count?: number; onClick?: Function }) {
  if (count && count > 0) {
    return (
      <button
        type="button"
        className="h-8 w-8 rounded text-sm font-semibold bg-cyan-400 text-zinc-900"
        onClick={() => onClick?.()}
      >
        {count}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="h-8 w-8 rounded text-zinc-200 bg-zinc-800 hover:bg-zinc-700"
      onClick={() => onClick?.()}
    >
      <svg className="h-4 w-4 m-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path
          d="M21 21H10C6.70017 21 5.05025 21 4.02513 19.9749C3 18.9497 3 17.2998 3 14V3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M7.99707 16.999C11.5286 16.999 18.9122 15.5348 18.6979 6.43269M16.4886 8.04302L18.3721 6.14612C18.5656 5.95127 18.8798 5.94981 19.0751 6.14286L20.9971 8.04302"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </button>
  );
}

export function IconEth() {
  return (
    <div className="w-10 h-10 flex bg-zinc-800 text-zinc-200 rounded">
      <svg
        className="h-6 w-6 m-auto"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M19 12L13.2404 14.5785C12.6289 14.8595 12.3232 15 12 15C11.6768 15 11.3711 14.8595 10.7596 14.5785L5 12M19 12C19 11.4678 18.6945 10.9997 18.0834 10.0636L14.5797 4.69611C13.4064 2.8987 12.8197 2 12 2C11.1803 2 10.5936 2.8987 9.42033 4.69611L5.91663 10.0636C5.30554 10.9997 5 11.4678 5 12M19 12C19 12.5322 18.6945 13.0003 18.0834 13.9364L14.5797 19.3039C13.4064 21.1013 12.8197 22 12 22C11.1803 22 10.5936 21.1013 9.42033 19.3039L5.91663 13.9364C5.30554 13.0003 5 12.5322 5 12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function IconNFT({ src }: { src?: string }) {
  return <img src={src} draggable="false" className="w-10 h-10 rounded" />;
}

export function IconNFTLarge({ src }: { src?: string }) {
  return <img src={src} draggable="false" className="w-12 h-12 rounded" />;
}

export function Checkbox({
  checked,
  label,
  onClick,
}: {
  checked?: boolean;
  label: string;
  onClick: Function;
}) {
  let id = crypto.randomUUID();
  return (
    <div className="flex items-center text-zinc-400 hover:text-zinc-200">
      <input
        id={id}
        checked={!!checked}
        onChange={() => onClick()}
        type="checkbox"
        className="peer hidden"
      />
      <label
        htmlFor={id}
        tabIndex={0}
        className="text-sm flex-grow cursor-pointer text-nowrap before:inline-block before:w-4 before:h-4 before:mr-2 before:-mt-px before:mb-px before:align-sub before:rounded before:border-none before:bg-zinc-700 peer-checked:before:bg-cyan-400"
      >
        {label}
      </label>
    </div>
  );
}

export function Tootltip({ children }: { children: string }) {
  return (
    <div
      data-text={children}
      className="relative hover:after:content-[attr(data-text)] hover:after:absolute hover:after:left-8 hover:after:top-0 hover:after:p-4 hover:after:w-40 hover:after:rounded hover:after:shadow hover:after:bg-zinc-800 hover:after:text-zinc-400 hover:after:text-sm"
    >
      <svg
        className="h-4 w-4 text-zinc-400 hover:text-zinc-200"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M12.2422 17V12C12.2422 11.5286 12.2422 11.2929 12.0957 11.1464C11.9493 11 11.7136 11 11.2422 11"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.992 8H12.001"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function ButtonAccordion({
  closed,
  onClick,
  children,
}: {
  closed?: boolean;
  onClick?: Function;
  children: string;
}) {
  let icon = (
    <path
      d="M18 9.00005C18 9.00005 13.5811 15 12 15C10.4188 15 6 9 6 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );

  if (!!closed) {
    icon = (
      <path
        d="M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => onClick?.()}
      className="h-8 w-full px-4 rounded text-sm bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
    >
      <span className="flex justify-between items-center">
        <span className="overflow-hidden text-ellipsis pr-4">{children}</span>
        <svg
          className="inline h-4 w-4 align-text-bottom box-content ml-auto"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          {icon}
        </svg>
      </span>
    </button>
  );
}

export function ItemNFT({ src, tokenId }: { src?: string; tokenId: number }) {
  return (
    <div className="flex gap-2">
      <IconNFT src={src} />
      <PriceTag>{`# ${tokenId}`}</PriceTag>
    </div>
  );
}

export function ItemETH({ value }: { value: string }) {
  return (
    <div className="flex gap-2">
      <IconEth />
      <PriceTag>{etherToString(BigInt(value))}</PriceTag>
    </div>
  );
}

export function CardNFTSelectable({
  src,
  tokenId,
  selected,
  disabled,
  onSelect,
}: {
  src?: string;
  tokenId: number;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: Function;
}) {
  let cardClass = 'cursor-pointer';

  if (!!selected) {
    cardClass = 'cursor-pointer outline outline-2 outline-cyan-400';
  }

  if (!!disabled) {
    cardClass = 'grayscale !cursor-default';
  }

  return (
    <div
      className={`rounded w-24 bg-zinc-800 ${cardClass}`}
      onClick={() => !disabled && onSelect?.()}
    >
      <img src={src} draggable="false" className="w-24 h-24 rounded-t" />
      <div className="h-6 w-24 text-sm text-center text-zinc-200 bg-zinc-800 rounded-b">
        <span className="leading-6">{tokenId}</span>
      </div>
    </div>
  );
}

export function CardNFTOrder({
  contract,
  tokenId,
  symbol,
  src,
  priceToken,
  priceEth,
  canFullfill,
}: {
  contract: string;
  tokenId: number;
  symbol: string;
  src?: string;
  priceToken: string;
  priceEth?: string;
  canFullfill?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <div
      className="w-48 h-full group cursor-pointer bg-zinc-800 rounded"
      onClick={() => navigate(`/c/${contract}/order/fulfill/${tokenId}`)}
    >
      <div className="px-4 py-2 text-sm flex justify-between items-center">
        <span className="h-6 text-base">{tokenId}</span>
        {canFullfill && <PriceTagClickable>Buy</PriceTagClickable>}
      </div>
      <div className="h-48 rounded overflow-hidden">
        <img
          src={src}
          className="h-48 group-hover:scale-110 transition bg-zinc-700"
          draggable="false"
        />
      </div>
      <div className="px-4 py-2 text-sm flex flex-wrap gap-2">
        {priceToken != '0' && <PriceTag>{`${priceToken} ${symbol}`}</PriceTag>}
        {!!priceEth && <PriceTag>{etherToString(BigInt(priceEth))}</PriceTag>}
      </div>
    </div>
  );
}

export function Input({
  disabled,
  value,
  type,
  onChange,
}: {
  disabled?: boolean;
  type: string;
  value?: any;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <input
      disabled={disabled}
      value={value}
      className="rounded bg-transparent leading-8 h-8 px-4 w-full text-zinc-400 border-zinc-700 !ring-0 focus:border-zinc-500 focus:text-zinc-200 disabled:bg-zinc-800"
      type={type}
      onChange={(e) => onChange?.(e)}
    />
  );
}

export function InputDisabledWithLabel({ value, label }: { value: any; label: string }) {
  return (
    <div className="flex w-52">
      <input
        disabled
        value={value}
        className="w-full rounded-l leading-8 h-8 px-4 text-zinc-400 border-zinc-700 overflow-hidden text-ellipsis !ring-0 focus:border-zinc-500 focus:text-zinc-200 disabled:bg-zinc-800"
        type="text"
      />
      <div className="px-4 bg-zinc-700 rounded-r text-center leading-8 text-nowrap">{label}</div>
    </div>
  );
}

export function TextBox({ children }: { children?: string | ReactElement }) {
  return (
    <div
      className={`text-sm rounded bg-transparent leading-8 px-4 w-full outline outline-1 -outline-offset-1 outline-zinc-700`}
    >
      {children}
    </div>
  );
}

export function TextBoxWithNFTs({
  value,
  src,
  tokenIds,
}: {
  value: string;
  src?: string;
  tokenIds: number[];
}) {
  const textBoxRounded = tokenIds.length > 0 ? 'rounded-t' : 'rounded';

  return (
    <div>
      <input
        disabled
        value={value}
        className={`${textBoxRounded} text-sm bg-transparent leading-8 h-8 px-4 w-full border-zinc-700`}
        type="text"
      />
      {tokenIds.length > 0 && (
        <div className="px-4 py-2 grid grid-cols-2 gap-x-4 gap-y-2 rounded-b border border-t-0 border-zinc-700">
          {tokenIds.map((tokenId) => (
            <div key={tokenId} className="">
              <ItemNFT src={src} tokenId={tokenId} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ActionButton({
  children,
  disabled,
  onClick,
}: {
  children: string;
  disabled?: boolean;
  onClick: Function;
}) {
  return (
    <button
      type="button"
      disabled={!!disabled}
      onClick={() => onClick()}
      className="h-8 w-full px-4 rounded bg-cyan-400 text-zinc-900 font-medium whitespace-nowrap hover:bg-cyan-300 disabled:text-zinc-400 disabled:font-normal disabled:bg-inherit disabled:border disabled:border-zinc-700"
    >
      {children}
    </button>
  );
}

export function Paginator({
  items,
  page,
  setItems,
  setPage,
  itemsPerPage = 10,
}: {
  items: any[];
  page: number;
  setItems: Function;
  setPage: Function;
  itemsPerPage?: number;
}) {
  const pages = Array.from({ length: Math.ceil(items.length / itemsPerPage) }, (_, index) => index);
  const paginatedItems = items.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
  useEffect(() => setItems(paginatedItems), [items.length, page]);

  return (
    <div className="flex gap-2">
      {pages.map((pageNumber) => (
        <Button key={pageNumber} disabled={pageNumber == page} onClick={() => setPage(pageNumber)}>
          {pageNumber + 1}
        </Button>
      ))}
    </div>
  );
}

export function ListedNFT({
  tokenId,
  symbol,
  name,
  src,
  onClick,
  tokenPrice,
  ethPrice,
}: {
  tokenId: number;
  symbol: string;
  name: string;
  src?: string;
  tokenPrice: string;
  ethPrice?: string;
  onClick?: Function;
}) {
  return (
    <div className="flex gap-2 items-end cursor-pointer" onClick={() => onClick?.()}>
      <IconNFTLarge src={src} />
      <div className="flex-grow max-w-64 overflow-hidden">
        <div>{`${name} #${tokenId}`}</div>
        <div className="flex gap-2 *:max-w-28 *:overflow-x-hidden *:text-ellipsis">
          <PriceTagClickable>{`${tokenPrice} ${symbol}`}</PriceTagClickable>
          {ethPrice && (
            <PriceTagClickable>{etherToString(BigInt(ethPrice), true)}</PriceTagClickable>
          )}
        </div>
      </div>
    </div>
  );
}

export function Dialog({
  children,
  open,
  setOpen,
  title,
}: {
  open?: boolean;
  title: string;
  children: ReactElement;
  setOpen?: Function;
}) {
  const root = document.getElementById('root');
  const height = root?.scrollHeight;

  useEffect(() => {
    if (open) {
      window.scrollTo(0, 0);
    }
  }, [open]);

  function handleOpenDialog() {
    setOpen?.(!open);
  }
  return (
    <div className={open ? '' : 'hidden'}>
      <div
        style={{ height }}
        className={`w-full fixed z-30 left-0 top-0 bg-zinc-950 opacity-85 ${open ? '' : 'hidden'}`}
      ></div>
      <div className="w-full h-full fixed z-40 left-0 top-0 flex items-center justify-center">
        <div className="w-96 bg-zinc-800 rounded">
          <div className="flex justify-between">
            <div className="font-medium text-lg pt-4 pl-4">{title}</div>
            {!!setOpen && (
              <div className="cursor-pointer p-4" onClick={handleOpenDialog}>
                X
              </div>
            )}
          </div>
          <div className="p-4 overflow-hidden text-ellipsis">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function SpinnerIcon() {
  return (
    <svg
      className="animate-spin text-zinc-200"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="32"
      height="32"
      color="#ffffff"
      fill="none"
    >
      <path d="M12 3V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 18V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M21 12L18 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 12L3 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M18.3635 5.63672L16.2422 7.75804"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7.75706 16.2422L5.63574 18.3635"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M18.3635 18.3635L16.2422 16.2422"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7.75706 7.75804L5.63574 5.63672"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
