import { task } from 'hardhat/config';

import { persistentDeploy } from '../../../utils/contract-deploy';
import { YetiContracts } from '../../../utils/contract-factories';
import { deployDebtTokenImplementation, deployYetiTokenImplementation } from '../../../utils/deploy/tokens';
import { injectFromEnv } from '../../../utils/env/ioc';

export const DEV_DEPLOY_PROTOCOL_TOKENS_TASK = 'dev:deploy-protocol-tokens';

task(DEV_DEPLOY_PROTOCOL_TOKENS_TASK)
    .setAction(async () => {
        const owner = injectFromEnv('owner');

        await persistentDeploy(await deployYetiTokenImplementation(owner), YetiContracts.YToken);
        await persistentDeploy(await deployDebtTokenImplementation(owner), YetiContracts.DebtToken);
    });
