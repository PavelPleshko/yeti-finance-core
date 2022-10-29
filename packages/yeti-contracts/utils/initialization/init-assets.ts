import { BytesLike } from '@ethersproject/bytes';
import { BigNumberish, constants as etherConstants, utils } from 'ethers';
import { IAssetInterestStrategy } from '../../typechain';
import { ProtocolConfig } from '../config';
import { InterestStrategy } from '../config/types';
import { deployInterestStrategy, waitForTransaction } from '../contract-deploy';
import { getContractAddress, getInterfaceAtAddress, getPersistedContract, YetiContracts } from '../contract-factories';


export const initAssets = async (
    assetsConfigs: ProtocolConfig['assetsConfig'],
    tokenAddresses: Record<string, string>,
): Promise<{ deployedStrategies: Record<string, IAssetInterestStrategy> }> => {

    const initParamsAggregate: {
        yTokenImpl: string;
        yTokenName: string;
        yTokenSymbol: string;
        debtTokenImpl: string;
        debtTokenName: string;
        debtTokenSymbol: string;
        underlying: string;
        underlyingName: string;
        underlyingDecimals: BigNumberish;
        piggyBank: string;
        interestRateLogic: string;
        params: BytesLike;
    }[] = [];
    const assets = Object.entries(assetsConfigs);
    const deployedStrategies: Record<string, IAssetInterestStrategy> = {};
    for (let [ assetSymbol, assetConfig ] of assets) {
        if (!tokenAddresses[assetSymbol]) {
            console.info(`Skipping init of ${ assetSymbol } as it is not deployed in this environment.`);
            continue;
        }
        const { yetiTokenContract, borrowingAvailable, decimals, interestStrategy } = assetConfig;

        const strategyAddress = deployedStrategies[interestStrategy.id] ||
            (await deployStrategyWithConfig(interestStrategy));
        deployedStrategies[interestStrategy.id] = strategyAddress;

        initParamsAggregate.push({
            yTokenImpl: await getContractAddress(yetiTokenContract),
            yTokenName: `Yeti interest token for ${ assetSymbol }`,
            yTokenSymbol: `y${ assetSymbol }`,
            debtTokenImpl: await getContractAddress(YetiContracts.DebtToken),
            debtTokenName: `Yeti debt tracking token for ${ assetSymbol }`,
            debtTokenSymbol: `debt${ assetSymbol }`,
            underlying: tokenAddresses[assetSymbol],
            underlyingName: assetSymbol,
            piggyBank: etherConstants.AddressZero,
            underlyingDecimals: `${ decimals }`,
            interestRateLogic: strategyAddress.address,
            params: utils.toUtf8Bytes('initialize(address)'),
        });
    }

    const addressesProvider = await ((await getPersistedContract(YetiContracts.AddressesProvider))());

    const assetManager = await (getInterfaceAtAddress(await addressesProvider.getAssetPoolManager(), YetiContracts.AssetPoolManager)());

    for (let i = 0; i < initParamsAggregate.length; i++) {
        const params = initParamsAggregate[i];
        await assetManager.initAssetPool(params);
    }
    return {
        deployedStrategies,
    };
};

export const deployStrategyWithConfig = async (config: InterestStrategy): ReturnType<typeof deployInterestStrategy> => {
    return await deployInterestStrategy([
        config.baseInterest,
        config.maxStableUtilization,
        config.normalSlope,
        config.jumpSlope,
    ]);
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

