import { BytesLike } from '@ethersproject/bytes';
import { BigNumberish, constants as etherConstants, utils } from 'ethers';
import { ProtocolConfig } from '../config';
import { waitForTransaction } from '../contract-deploy';
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
        assetLogicAddress: string;
        params: BytesLike;
    }[] = [];
    const assets = Object.entries(assetsConfigs);
    for (let [ assetSymbol, assetConfig ] of assets) {
        if (!tokenAddresses[assetSymbol]) {
            console.info(`Skipping init of ${ assetSymbol } as it is not deployed in this environment.`);
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
            assetLogicAddress: etherConstants.AddressZero,
            params: utils.toUtf8Bytes('initialize(address)'),
        });
    }

    const addressesProvider = await ((await getPersistedContract(YetiContracts.AddressesProvider))());

    const assetManager = await (getInterfaceAtAddress(await addressesProvider.getAssetPoolManager(), YetiContracts.AssetPoolManager)());

    for (let i = 0; i < initParamsAggregate.length; i++) {
        const params = initParamsAggregate[i];
        await assetManager.initAssetPool(params);
    }
};


export const configureAssets = async (assetsConfigs: ProtocolConfig['assetsConfig'], tokenAddresses: Record<string, string>) => {
    const assets = Object.entries(assetsConfigs);
    for (const [ assetSymbol, config ] of assets) {
        if (!tokenAddresses[assetSymbol]) {
            console.info(`Skipping configuration of ${ assetSymbol } as it is not deployed in this environment.`);
            continue;
        }
        const { commissionFactor } = config;
        const addressesProvider = await ((await getPersistedContract(YetiContracts.AddressesProvider))());
        const assetManager = await (getInterfaceAtAddress(await addressesProvider.getAssetPoolManager(), YetiContracts.AssetPoolManager)());

        await waitForTransaction(await assetManager.setAssetCommission(tokenAddresses[assetSymbol], commissionFactor));
    }
};

