import { YetiContracts } from '../contract-factories';
import { eEthereumNetwork } from './networks';
import { AssetConfig, LendingPoolAssets } from './types';

export interface ProtocolConfig<AssetSymbol extends string = string> {
    assets: Record<eEthereumNetwork, {}>;
    assetsConfig: Record<AssetSymbol, AssetConfig>;
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
            borrowingAvailable: true,
            commissionFactor: '5',
        },
        [LendingPoolAssets.DAI]: {
            decimals: 18,
            yetiTokenContract: YetiContracts.YToken,
            borrowingAvailable: true,
            commissionFactor: '7',
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
