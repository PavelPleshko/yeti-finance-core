import { DebtTrackerToken, YToken } from '../../typechain';
import { deployContract } from '../contract-deploy';
import { YetiContracts } from '../contract-factories';


export const deployYetiTokenImplementation = async (): Promise<YToken> => {
    return await deployContract<YToken>(YetiContracts.YToken);
};

export const deployDebtTokenImplementation = async (): Promise<DebtTrackerToken> => {
    return await deployContract<DebtTrackerToken>(YetiContracts.DebtToken);
};
