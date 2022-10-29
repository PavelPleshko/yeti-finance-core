import { task } from 'hardhat/config';
import { setInitialMockPriceFeedForTokens } from '../../../test/setup/asset-prices';

import { configureAssets, initAssets } from '../../../utils/initialization/init-assets';
import { selectState } from '../../tasks-helpers/shared-state.utils';
import protocolConfig from '../../../utils/config';

export const DEV_INIT_PROTOCOL_TASK = 'dev:initialize-protocol';

task(DEV_INIT_PROTOCOL_TASK)
    .setAction(async () => {
        const tokenAddresses = selectState(({ tokens }) => tokens);
        const config = protocolConfig;

        const { deployedStrategies } = await initAssets(config.assetsConfig, tokenAddresses);

        console.log('Configuring asset pools...');
        await configureAssets(config.assetsConfig, tokenAddresses);

        console.log('Setting mock prices for oracle...');
        await setInitialMockPriceFeedForTokens(tokenAddresses);
    });
