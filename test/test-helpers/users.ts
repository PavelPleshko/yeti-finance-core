import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import BigNumber from 'bignumber.js';

import { getSignerAccounts } from '../../utils/contract-deploy';
import { getInterfaceAtAddress, getMarketProtocol, getPriceFeed, YetiContracts } from '../../utils/contract-factories';
import { depositAsset } from './deposit';

interface AssetMetadata {
    name: string;
    underlyingAddress: string;
    storageAddress: string;
    decimals: number;
}

export const getAssetsPriceRatio = async (asset1Address: string, asset2Address: string): Promise<BigNumber> => {
    const priceFeed = await getPriceFeed();

    const asset1Price = new BigNumber((await priceFeed.getAssetPriceETH(asset1Address)).toString());
    const asset2Price = new BigNumber((await priceFeed.getAssetPriceETH(asset2Address)).toString());
    return asset1Price.dividedBy(asset2Price);
};

export const calculateEquivalentInValue = async (convertFrom: string, convertTo: string, amount: BigNumber): Promise<BigNumber> => {
    const marketProtocol = await getMarketProtocol();
    const asset1Info = await marketProtocol.getAsset(convertFrom);
    const asset2Info = await marketProtocol.getAsset(convertTo);
    const priceRatio = await getAssetsPriceRatio(convertFrom, convertTo);

    return amount.dividedBy(10 ** asset1Info.config.currencyDecimals).multipliedBy(priceRatio).multipliedBy(
        10 ** asset2Info.config.currencyDecimals
    ).decimalPlaces(0, BigNumber.ROUND_UP);
};

export const fulfillBorrowRequirements = async (
    realWorldAmount: number,
    assetName: string,
    user: SignerWithAddress,
): Promise<BigNumber> => {
    const assetConfig = (await getAssetMetadata(assetName))!;
    const marketProtocol = await getMarketProtocol();
    const allAssets = await marketProtocol.getAllAssets();
    const signers = await getSignerAccounts();
    const assetDecimalFactor = 10 ** assetConfig.decimals;

    // add liquidity to asset pool
    const adjustedBorrowAmount = new BigNumber(realWorldAmount * assetDecimalFactor);
    const currentAvailableLiquidity = await (await getInterfaceAtAddress(assetConfig.underlyingAddress, YetiContracts.ERC20Mock)())
        .balanceOf(assetConfig.storageAddress);
    const liquidityToAdd = adjustedBorrowAmount.minus(currentAvailableLiquidity.toString());

    if (liquidityToAdd.gt(0)) {
        const liquidityProvider = signers.find(signer => signer.address !== user.address);
        await depositAsset({
            assetAddress: assetConfig.underlyingAddress,
            signer: liquidityProvider!,
            amount: liquidityToAdd.toString(),
            lock: false,
        });
    }

    // make sure borrower is able to borrow the amount
    const collateralAsset = await extractAssetMetadata(allAssets.find(_asset => _asset.yetiToken !== assetConfig.storageAddress)!);

    const equivalentInCollateral = await calculateEquivalentInValue(
        assetConfig.underlyingAddress,
        collateralAsset.underlyingAddress,
        adjustedBorrowAmount.plus(assetDecimalFactor),
    );

    await depositAsset({
        assetAddress: collateralAsset.underlyingAddress,
        amount: equivalentInCollateral.toFixed(),
        signer: user,
        lock: true,
    });

    return adjustedBorrowAmount;
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
