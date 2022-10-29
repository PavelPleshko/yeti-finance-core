import { task } from 'hardhat/config';

import {
    DEV_DEPLOY_MOCK_TOKENS_TASK, DEV_DEPLOY_ORACLES_TASK, DEV_DEPLOY_PROTOCOL_TASK,
    DEV_DEPLOY_PROTOCOL_TOKENS_TASK, DEV_ENV_SETUP_TASK, DEV_INIT_PROTOCOL_TASK,
    DEV_PROVIDE_LIQUIDITY_TASK,
} from '../development';


task('yeti:dev', 'Launch development environment for yeti exchange protocol')
    .setAction(async (_, localBRE) => {
        console.log('Migration has started...\n');

        console.log('Step 0. Setting up dev environment...');
        await localBRE.run(DEV_ENV_SETUP_TASK);

        console.log('Step 1. Deploying ERC20 mock tokens...');
        await localBRE.run(DEV_DEPLOY_MOCK_TOKENS_TASK);

        console.log('Step 2. Deploying protocol core...');
        await localBRE.run(DEV_DEPLOY_PROTOCOL_TASK);

        console.log('Step 3. Deploying protocol tokens...');
        await localBRE.run(DEV_DEPLOY_PROTOCOL_TOKENS_TASK);

        console.log('Step 4. Deploying oracles...');
        await localBRE.run(DEV_DEPLOY_ORACLES_TASK);

        console.log('Step 5. Initializing protocol...');
        await localBRE.run(DEV_INIT_PROTOCOL_TASK);

        console.log('Step 6. Providing initial liquidity...');
        await localBRE.run(DEV_PROVIDE_LIQUIDITY_TASK);
    });
