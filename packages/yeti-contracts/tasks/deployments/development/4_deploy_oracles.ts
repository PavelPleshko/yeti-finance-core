import { task } from 'hardhat/config';

import { FeedRegistryInterfaceMock } from '../../../typechain';
import { deployContract, deployPriceFeed, persistentDeploy } from '../../../utils/contract-deploy';
import { getPersistedContract, YetiContracts } from '../../../utils/contract-factories';
import { injectFromEnv } from '../../../utils/env/ioc';

export const DEV_DEPLOY_ORACLES_TASK = 'dev:deploy-oracles';

task(DEV_DEPLOY_ORACLES_TASK)
    .setAction(async () => {
        const owner = injectFromEnv('owner');
        const addressesProvider = await (await getPersistedContract(YetiContracts.AddressesProvider))(owner);

        const feedRegistryMock = await persistentDeploy(await deployContract<FeedRegistryInterfaceMock>(YetiContracts.FeedRegistryMock, [], owner), YetiContracts.FeedRegistryMock);
        const priceFeedRouter = await persistentDeploy(await deployPriceFeed(owner, [ feedRegistryMock.address ]), YetiContracts.PriceFeedRouter);
        await addressesProvider.setPriceFeed(priceFeedRouter.address);
    });
