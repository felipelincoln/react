import { useContext, useEffect } from 'react';
import { DialogContext } from '../App';

export function Dialog() {
  const { dialog } = useContext(DialogContext);
  useEffect(() => {
    if (dialog) {
      window.scrollTo(0, 0);
    }
  }, [dialog]);

  return (
    !!dialog && (
      <>
        <div
          style={{ height: document.getElementById('root')!.scrollHeight }}
          className="w-full fixed z-40 left-0 top-0 bg-zinc-950 opacity-85"
        ></div>
        <div className="w-full h-full fixed z-50 left-0 top-0 flex items-center justify-center">
          <div className="p-4 bg-zinc-800 rounded">{dialog}</div>
        </div>
      </>
    )
  );
}
