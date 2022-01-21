import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ContractReceipt } from 'ethers';
import { waitForTransaction } from '../../utils/contract-deploy';
import { getInterfaceAtAddress, getMarketProtocol, YetiContracts } from '../../utils/contract-factories';


export const depositAsset = async ({ assetAddress, amount, signer, lock = false }:
                                { assetAddress: string, amount: string, signer: SignerWithAddress, lock: boolean }): Promise<ContractReceipt> => {
    const marketProtocol = await getMarketProtocol(signer);

    const assetERC20 = (await getInterfaceAtAddress(assetAddress, YetiContracts.ERC20Mock)());

    await waitForTransaction(await assetERC20.connect(signer).mint(amount));
    await waitForTransaction(await assetERC20.connect(signer).approve(marketProtocol.address, amount));

    return await waitForTransaction(await marketProtocol.deposit(assetAddress, amount, signer.address, lock));
};
