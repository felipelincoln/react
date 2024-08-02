import { config } from '../../config';
import { IconEth, IconMatic } from '.';

export function IconCurrency() {
  switch (config.chain) {
    case 'polygon': {
      return <IconMatic />;
    }
    default: {
      return <IconEth />;
    }
  }
}
