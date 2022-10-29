import { task } from 'hardhat/config';
import { createEnv } from '../../../utils/env/ioc';
import { setDEV_RE } from '../../../utils/misc';

export const ENV_SETUP_TASK_NAME = 'env:setup';

task(ENV_SETUP_TASK_NAME,
    `Sets up a development runtime object.
     Task needs to run prior to using any functions that make use of hardhat global object.`)
    .setAction(async (args, localBRE) => {
        setDEV_RE(localBRE);
        await createEnv();

        console.log('Env setup successfully.');
    });
