import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import { DebtTrackerToken, YToken } from '../../typechain';
import { deployContract } from '../contract-deploy';
import { YetiContracts } from '../contract-factories';


export const deployYetiTokenImplementation = async (as?: SignerWithAddress): Promise<YToken> => {
    return await deployContract<YToken>(YetiContracts.YToken, [], as);
};

export const deployDebtTokenImplementation = async (as?: SignerWithAddress): Promise<DebtTrackerToken> => {
    return await deployContract<DebtTrackerToken>(YetiContracts.DebtToken, [], as);
};
