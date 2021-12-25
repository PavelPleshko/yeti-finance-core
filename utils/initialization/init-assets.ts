import { BytesLike } from '@ethersproject/bytes';
import { BigNumberish, constants as etherConstants, utils } from 'ethers';
import { ProtocolConfig } from '../config';
import { getContractAddress, getInterfaceAtAddress, getPersistedContract, YetiContracts } from '../contract-factories';


export const initAssets = async (
    assetsConfigs: ProtocolConfig['assetsConfig'],
    tokenAddresses: Record<string, string>,
) => {

    const initParamsAggregate: {
        yTokenImpl: string;
        yTokenName: string;
        yTokenSymbol: string;
        underlyingDecimals: BigNumberish;
        underlying: string;
        piggyBank: string;
        underlyingName: string;
        params: BytesLike;
    }[] = [];
    const assets = Object.entries(assetsConfigs);
    for (let [ assetSymbol, assetConfig ] of assets) {
        if (!tokenAddresses[assetSymbol]) {
            continue;
        }
        const { yetiTokenContract, borrowingAvailable, decimals } = assetConfig;

        initParamsAggregate.push({
            yTokenImpl: await getContractAddress(yetiTokenContract),
            yTokenName: `Yeti interest token for ${ assetSymbol }`,
            yTokenSymbol: `y${ assetSymbol }`,
            underlying: tokenAddresses[assetSymbol],
            underlyingName: assetSymbol,
            piggyBank: etherConstants.AddressZero,
            underlyingDecimals: `${ decimals }`,
            params: utils.toUtf8Bytes('initialize(address)'),
        });
    }

    const addressesProvider = await ((await getPersistedContract(YetiContracts.AddressesProvider))());

    const assetManager = await (getInterfaceAtAddress(await addressesProvider.getAssetPoolManager(), YetiContracts.AssetPoolManager)());

    for (let i = 0; i < initParamsAggregate.length; i++) {
        const params = initParamsAggregate[i];
        await assetManager.initPosition(params);
    }
};
