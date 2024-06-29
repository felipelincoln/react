import { useNavigate } from 'react-router-dom';
import { CollectoorLogo } from './CollectoorLogo';

export function NavbarHome() {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 z-20 w-full bg-zinc-900">
      <div className="h-24 flex px-8 box-content border-b-2 border-zinc-800">
        <div className="my-4 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <CollectoorLogo />
          <div className="text-xl text-zinc-200">
            Collectoor<span className="text-zinc-400 text-xs mr-1"> (beta)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
