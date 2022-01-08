import { DEV_RE } from '../misc';
import { eEthereumNetwork } from './networks';


export const getConfigurationByNetwork = <T> (config: Record<eEthereumNetwork, T>): T => {
    const network = <eEthereumNetwork> DEV_RE.network.name;
    return config[network];
};
