import { task } from 'hardhat/config';
import { deployERC20Mocks } from '../../../utils/mocking/mock-tokens';
import { pushState } from '../../tasks-helpers/shared-state.utils';

export const DEV_DEPLOY_MOCK_TOKENS_TASK = 'dev:deploy-mock-tokens';

task(DEV_DEPLOY_MOCK_TOKENS_TASK, 'Deploy mock tokens for dev environment')
    .setAction(async () => {
        const tokenMocks = await deployERC20Mocks();

        const tokenAddresses = Object.keys(tokenMocks).reduce((acc, token) => {
            acc[token] = tokenMocks[token].address;
            return acc;
        }, {} as Record<string, string>);

        pushState(() => ({ tokens: tokenAddresses }));
    });
