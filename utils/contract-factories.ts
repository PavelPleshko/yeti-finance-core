import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
    AddressesProvider,
    AddressesProvider__factory,
    AssetPoolManager,
    AssetPoolManager__factory, DebtTrackerToken, DebtTrackerToken__factory,
    ERC20Mock,
    ERC20Mock__factory,
    FeedRegistryInterfaceMock,
    FeedRegistryInterfaceMock__factory,
    PriceFeedRouter,
    PriceFeedRouter__factory,
    SnowballInterestStrategy,
    SnowballInterestStrategy__factory,
    Yeti,
    Yeti__factory,
    YetiMockUpgrade,
    YetiMockUpgrade__factory,
    YToken,
    YToken__factory
} from '../typechain';
import { getSignerAccounts } from './contract-deploy';
import { injectFromEnv } from './env/ioc';

export const enum YetiContracts {
    Yeti = 'Yeti',
    YetiMockUpgrade = 'YetiMockUpgrade',
    AddressesProvider = 'AddressesProvider',
    AssetPoolManager = 'AssetPoolManager',
    YToken = 'YToken',
    DebtToken = 'DebtTrackerToken',
    ERC20Mock = 'ERC20Mock',
    FeedRegistryMock = 'FeedRegistryInterfaceMock',
    PriceFeedRouter = 'PriceFeedRouter',
    SnowballInterestStrategy = 'SnowballInterestStrategy',
}

export const contractTypeToFactory = {
    [YetiContracts.Yeti]: Yeti__factory,
    [YetiContracts.YetiMockUpgrade]: YetiMockUpgrade__factory,
    [YetiContracts.AddressesProvider]: AddressesProvider__factory,
    [YetiContracts.AssetPoolManager]: AssetPoolManager__factory,
    [YetiContracts.YToken]: YToken__factory,
    [YetiContracts.DebtToken]: DebtTrackerToken__factory,
    [YetiContracts.ERC20Mock]: ERC20Mock__factory,
    [YetiContracts.FeedRegistryMock]: FeedRegistryInterfaceMock__factory,
    [YetiContracts.PriceFeedRouter]: PriceFeedRouter__factory,
    [YetiContracts.SnowballInterestStrategy]: SnowballInterestStrategy__factory,
};

export interface ContractTypeToContractInterface {
    [YetiContracts.Yeti]: Yeti,
    [YetiContracts.YetiMockUpgrade]: YetiMockUpgrade,
    [YetiContracts.AddressesProvider]: AddressesProvider,
    [YetiContracts.AssetPoolManager]: AssetPoolManager,
    [YetiContracts.YToken]: YToken,
    [YetiContracts.DebtToken]: DebtTrackerToken,
    [YetiContracts.ERC20Mock]: ERC20Mock,
    [YetiContracts.FeedRegistryMock]: FeedRegistryInterfaceMock,
    [YetiContracts.PriceFeedRouter]: PriceFeedRouter,
    [YetiContracts.SnowballInterestStrategy]: SnowballInterestStrategy,
}

export type ConnectableFactory<T extends YetiContracts> = (connectAs?: SignerWithAddress) => Promise<ContractTypeToContractInterface[T]>;

export const getInterfaceAtAddress = <T extends YetiContracts> (
    address: string, contractType: T,
): ConnectableFactory<T> => {
    const factory = contractTypeToFactory[contractType];

    return (async (connectAs?: SignerWithAddress) => {
        const signer = connectAs ? connectAs : (await getSignerAccounts())[0];
        return factory.connect(address, signer);
    }) as ConnectableFactory<T>;
};

export const getContractAddress = async (contractId: YetiContracts): Promise<string> => {
    const db = injectFromEnv('db');

    return await db.get(contractId);
};


export const getPersistedContract = async <T extends YetiContracts> (contractId: T): Promise<ConnectableFactory<T>> => {
    const contractAddress = await getContractAddress(contractId);
    return getInterfaceAtAddress(contractAddress, contractId);
};

export const getMarketProtocol = async (as?: SignerWithAddress): Promise<Yeti> => {
    const addressesProvider = await (await getPersistedContract(YetiContracts.AddressesProvider))();
    const marketProtocol = await addressesProvider.getMarketProtocol();
    return getInterfaceAtAddress(marketProtocol, YetiContracts.Yeti)(as);
};

export const getPriceFeed = async (): Promise<PriceFeedRouter> => {
    const addressesProvider = await (await getPersistedContract(YetiContracts.AddressesProvider))();
    return getInterfaceAtAddress(await addressesProvider.getPriceFeed(), YetiContracts.PriceFeedRouter)();
};
