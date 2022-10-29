import BigNumber from 'bignumber.js';
import { task } from 'hardhat/config';

import { depositAsset } from '../../../test/test-helpers/deposit';
import { TokenIds } from '../../../utils/config/tokens';
import { injectFromEnv } from '../../../utils/env/ioc';
import { selectState } from '../../tasks-helpers/shared-state.utils';


export const DEV_PROVIDE_LIQUIDITY_TASK = 'dev:provide-liquidity';

const INITIAL_LIQUIDITIES_BY_TOKEN = {
    [TokenIds.DAI]: new BigNumber(1200).multipliedBy(10 ** 18),
    [TokenIds.USDC]: new BigNumber(4500).multipliedBy(10 ** 18),
};

task(DEV_PROVIDE_LIQUIDITY_TASK)
    .setAction(async () => {
        const tokenAddresses = selectState(({ tokens }) => tokens);
        const deployer = injectFromEnv('owner');
        await Promise.all(Object.keys(tokenAddresses).map(token => depositAsset(
            {
                assetAddress: tokenAddresses[token],
                amount: INITIAL_LIQUIDITIES_BY_TOKEN[token as TokenIds].toFixed(),
                signer: deployer,
                lock: false,
            })));
    });
