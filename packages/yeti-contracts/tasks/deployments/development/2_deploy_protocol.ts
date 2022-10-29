import { task } from 'hardhat/config';
import {
    deployAddressesProvider,
    deployAssetPoolManager,
    deployYetiProtocol,
    persistentDeploy,
    waitForTransaction
} from '../../../utils/contract-deploy';
import { YetiContracts } from '../../../utils/contract-factories';
import { injectFromEnv } from '../../../utils/env/ioc';


export const DEV_DEPLOY_PROTOCOL_TASK = 'dev:deploy-protocol';

task(DEV_DEPLOY_PROTOCOL_TASK)
    .setAction(async () => {
        const owner = injectFromEnv('owner');

        // deploy all contracts that form the foundation of protocol from owner account
        const addressesProvider = await persistentDeploy(await deployAddressesProvider(owner), YetiContracts.AddressesProvider);
        await waitForTransaction(await addressesProvider.setMarketAdmin(owner.address));

        const assetsPoolManager = await deployAssetPoolManager(owner);
        await waitForTransaction(await addressesProvider.setAssetPoolManager(assetsPoolManager.address));

        const yeti = await deployYetiProtocol(owner);
        await waitForTransaction(await addressesProvider.setMarketProtocol(yeti.address));
    });
