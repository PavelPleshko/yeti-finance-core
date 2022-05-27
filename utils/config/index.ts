import BigNumber from 'bignumber.js';
import { constants } from 'ethers';
import { rayFactor } from '../constants';

import { YetiContracts } from '../contract-factories';
import { stableStrategy, stableStrategy2 } from './interest-strategies';
import { eEthereumNetwork } from './networks';
import { AssetConfig, LendingPoolAssets } from './types';

export interface ProtocolConfig<AssetSymbol extends string = string> {
    assets: Record<eEthereumNetwork, {}>;
    assetsConfig: Record<AssetSymbol, AssetConfig>;
    envConfig: Record<eEthereumNetwork, {
        inMemoryDb: boolean;
        priceFeedAddress: string;
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
            commissionFactor: new BigNumber(0.05).multipliedBy(rayFactor).toFixed(),
            interestStrategy: stableStrategy,
        },
        [LendingPoolAssets.DAI]: {
            decimals: 18,
            yetiTokenContract: YetiContracts.YToken,
            borrowingAvailable: true,
            commissionFactor: new BigNumber(0.07).multipliedBy(rayFactor).toFixed(),
            interestStrategy: stableStrategy2,
        }
    },
    envConfig: {
        [eEthereumNetwork.main]: {
            inMemoryDb: false,
            priceFeedAddress: '0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf',
        },
        [eEthereumNetwork.hardhat]: {
            inMemoryDb: false,
            priceFeedAddress: constants.AddressZero,
        }
    }
} as ProtocolConfig<LendingPoolAssets>;
