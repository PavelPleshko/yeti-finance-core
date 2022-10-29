import { task } from 'hardhat/config';

import { ENV_SETUP_TASK_NAME } from '../setup/env-setup';

export const DEV_ENV_SETUP_TASK = 'dev:env-setup';

task(DEV_ENV_SETUP_TASK,
    `Sets up a development env.`)
    .setAction(async (args, localBRE) => {
        await localBRE.run(ENV_SETUP_TASK_NAME);
    });
