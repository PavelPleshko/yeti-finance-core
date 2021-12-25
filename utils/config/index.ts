import { YetiContracts } from '../contract-factories';
import { eEthereumNetwork } from './networks';
import { AssetConfig, LendingPoolAssets } from './types';

export interface ProtocolConfig<AssetName extends string = string> {
    assets: Record<eEthereumNetwork, {}>;
    assetsConfig: Record<AssetName, AssetConfig>;
    envConfig: Record<eEthereumNetwork, {
        inMemoryDb: boolean;
    }>;
}

export default {
    assets: {
        [eEthereumNetwork.main]: {
            //  TODO
        },
        [eEthereumNetwork.hardhat]: {},
    },
    assetsConfig: {
        [LendingPoolAssets.USDC]: {
            decimals: 6,
            yetiTokenContract: YetiContracts.YToken,
            borrowingAvailable: true
        },
        [LendingPoolAssets.DAI]: {
            decimals: 18,
            yetiTokenContract: YetiContracts.YToken,
            borrowingAvailable: true
        }
    },
    envConfig: {
        [eEthereumNetwork.main]: {
            inMemoryDb: false,
        },
        [eEthereumNetwork.hardhat]: {
            inMemoryDb: true,
        }
    }
} as ProtocolConfig<LendingPoolAssets>;
