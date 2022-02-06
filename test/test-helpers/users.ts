import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import BigNumber from 'bignumber.js';
import { utils } from 'ethers';

import { getSignerAccounts } from '../../utils/contract-deploy';
import { getInterfaceAtAddress, getMarketProtocol, YetiContracts } from '../../utils/contract-factories';
import { depositAsset } from './deposit';

interface AssetMetadata {
    name: string;
    underlyingAddress: string;
    storageAddress: string;
    decimals: number;
}

export const fulfillBorrowRequirements = async (
    realWorldAmount: number,
    assetName: string,
    user: SignerWithAddress,
): Promise<void> => {
    const assetConfig = (await getAssetMetadata(assetName))!;
    const marketProtocol = await getMarketProtocol();
    const allAssets = await marketProtocol.getAllAssets();
    const signers = await getSignerAccounts();

    // add liquidity to asset pool
    const liquidityProvider = signers.find(signer => signer.address !== user.address);
    await depositAsset({
        assetAddress: assetConfig.underlyingAddress,
        signer: liquidityProvider!,
        amount: new BigNumber(realWorldAmount * (10 ** assetConfig.decimals)).toFixed(),
        lock: false,
    });

    // make sure borrower is able to borrow the amount
    const collateralAsset = await extractAssetMetadata(allAssets.find(_asset => _asset.yetiToken !== assetConfig.storageAddress)!);
    const amountCollateral = utils.parseUnits('1000', collateralAsset.decimals);
    await depositAsset({
        assetAddress: collateralAsset.underlyingAddress,
        amount: amountCollateral.toString(),
        signer: user,
        lock: true,
    });

};

const getAssetMetadata = async (assetName: string): Promise<AssetMetadata> => {
    const marketProtocol = await getMarketProtocol();
    const allAssets = await marketProtocol.getAllAssets();

    let meta: AssetMetadata;
    for (let i = 0; i < allAssets.length; i++) {
        const currentAsset = allAssets[i];
        const assetMeta = await extractAssetMetadata(currentAsset);
        if (assetMeta.name === assetName) {
            meta = assetMeta;
            break;
        }
    }
    return meta!;
};

const extractAssetMetadata = async (asset: { yetiToken: string }): Promise<AssetMetadata> => {
    const ownershipToken = await getInterfaceAtAddress(asset.yetiToken, YetiContracts.YToken)();
    const underlyingAddress = await ownershipToken.underlying();
    const underlyingToken = await getInterfaceAtAddress(underlyingAddress, YetiContracts.ERC20Mock)();
    const name = await underlyingToken.name();

    return {
        name,
        underlyingAddress,
        decimals: await ownershipToken.decimals(),
        storageAddress: ownershipToken.address,
    };
};
