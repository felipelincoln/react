import { ReactElement } from 'react';

export function Components() {
  return (
    <div className="p-20 bg-zinc-950 flex flex-row gap-6">
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <Button>Button</Button>
        <Button disabled>Button:Disabled</Button>
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <Tag>Tag</Tag>
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <PriceTag>PriceTag</PriceTag>
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <ExternalLink href="">5d ago</ExternalLink>
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <ActivityButton count={2} />
        <ActivityButton />
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <IconNFT src="sep-raccools/6.png" />
        <IconEth />
      </div>
      <div className="flex flex-col h-fit gap-2 border-2 border-dashed border-purple-600 rounded p-4">
        <Checkbox label="Checkbox" />
        <Checkbox label="Checkbox:Checked" checked />
      </div>
    </div>
  );
}

function Button({
  children,
  disabled,
}: {
  children: string | [string, ReactElement];
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={!!disabled}
      className="h-8 w-fit px-4 rounded text-sm bg-zinc-800 text-zinc-200 whitespace-nowrap hover:bg-zinc-700 disabled:bg-inherit disabled:border disabled:border-zinc-700"
    >
      {children}
    </button>
  );
}

function Tag({ children }: { children: string }) {
  return (
    <Button>
      {children}
      <svg
        className="inline h-4 w-4 align-text-bottom box-content pl-1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path
          d="M19 5L5 19M5 5L19 19"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </Button>
  );
}

function PriceTag({ children }: { children: string }) {
  return (
    <div className="leading-6 w-fit px-2 rounded text-xs text-zinc-200 bg-inherit border border-zinc-700 cursor-default">
      {children}
    </div>
  );
}

function ExternalLink({ children, href }: { children: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-xs text-zinc-400 whitespace-nowrap hover:text-zinc-200"
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
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M20.5561 3.49637L11.0488 13.0589M20.5561 3.49637C20.0622 3.00175 16.7345 3.04785 16.031 3.05786M20.5561 3.49637C21.0501 3.99098 21.0041 7.32297 20.9941 8.02738"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </a>
  );
}

function ActivityButton({ count }: { count?: number }) {
  if (count && count > 0) {
    return (
      <button
        type="button"
        className="h-8 w-8 rounded text-sm font-semibold bg-cyan-400 text-zinc-950"
      >
        {count}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="h-8 w-8 rounded bg-inherit border border-zinc-700 text-zinc-400 hover:text-zinc-200"
    >
      <svg className="h-4 w-4 m-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path
          d="M21 21H10C6.70017 21 5.05025 21 4.02513 19.9749C3 18.9497 3 17.2998 3 14V3"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
        <path
          d="M7.99707 16.999C11.5286 16.999 18.9122 15.5348 18.6979 6.43269M16.4886 8.04302L18.3721 6.14612C18.5656 5.95127 18.8798 5.94981 19.0751 6.14286L20.9971 8.04302"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  );
}

function IconEth() {
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
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  );
}

function IconNFT({ src }: { src: string }) {
  return <img src={src} className="w-10 h-10 flex rounded" />;
}

function Checkbox({ checked, label }: { checked?: boolean; label: string }) {
  return (
    <div className="flex items-center text-zinc-400 hover:text-zinc-200">
      <input
        name={label}
        type="checkbox"
        checked={!!checked}
        className="w-4 h-4 rounded cursor-pointer border-none bg-zinc-800  checked:!bg-cyan-400"
      />
      <label htmlFor={label} className="pl-2 text-sm cursor-pointer text-nowrap">
        {label}
      </label>
    </div>
  );
}
