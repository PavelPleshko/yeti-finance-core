import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ContractReceipt } from 'ethers';
import { waitForTransaction } from '../../utils/contract-deploy';
import { getInterfaceAtAddress, getMarketProtocol, YetiContracts } from '../../utils/contract-factories';


export const borrowAsset = async ({ assetAddress, amount, signer }:
                                       { assetAddress: string, amount: string, signer: SignerWithAddress }): Promise<ContractReceipt> => {
   // TODO TBA
};
