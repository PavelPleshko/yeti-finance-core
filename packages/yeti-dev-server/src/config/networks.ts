import { eEthereumNetwork } from '../../utils/config/networks';


export const configByNetwork: Partial<Record<eEthereumNetwork, { url: string }>> = {
  [eEthereumNetwork.node]: {
      url: 'http://127.0.0.1:8545',
  },
};

export const getCurrentProcessNetworkConfig = <T extends typeof configByNetwork>(): T[eEthereumNetwork] => {
    const networkFromVar = (process.env.network as eEthereumNetwork) || eEthereumNetwork.node;
    return configByNetwork[networkFromVar];
};
