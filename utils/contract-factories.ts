import { getSigners } from '@nomiclabs/hardhat-ethers/internal/helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract } from 'ethers';
import {
    AddressesProvider,
    AddressesProvider__factory,
    AssetPoolManager,
    AssetPoolManager__factory,
    ERC20Mock,
    ERC20Mock__factory,
    Yeti,
    Yeti__factory,
    YetiMockUpgrade,
    YetiMockUpgrade__factory,
    YToken,
    YToken__factory
} from '../typechain';
import { getSignerAccounts } from './contract-deploy';
import { DatabaseBase } from './deploy/database/database.base';
import { getDependencyByKey } from './env/ioc';

export const enum YetiContracts {
    Yeti = 'Yeti',
    YetiMockUpgrade = 'YetiMockUpgrade',
    AddressesProvider = 'AddressesProvider',
    AssetPoolManager = 'AssetPoolManager',
    YToken = 'YToken',
    ERC20Mock = 'ERC20Mock',
}

export const contractTypeToFactory = {
    [YetiContracts.Yeti]: Yeti__factory,
    [YetiContracts.YetiMockUpgrade]: YetiMockUpgrade__factory,
    [YetiContracts.AddressesProvider]: AddressesProvider__factory,
    [YetiContracts.AssetPoolManager]: AssetPoolManager__factory,
    [YetiContracts.YToken]: YToken__factory,
    [YetiContracts.ERC20Mock]: ERC20Mock__factory,
};

export interface ContractTypeToContractInterface {
    [YetiContracts.Yeti]: Yeti,
    [YetiContracts.YetiMockUpgrade]: YetiMockUpgrade,
    [YetiContracts.AddressesProvider]: AddressesProvider,
    [YetiContracts.AssetPoolManager]: AssetPoolManager,
    [YetiContracts.YToken]: YToken,
    [YetiContracts.ERC20Mock]: ERC20Mock,
}

export type ConnectableFactory<T extends YetiContracts> = (connectAs?: SignerWithAddress) => Promise<ContractTypeToContractInterface[T]>;

export const getInterfaceAtAddress = <T extends YetiContracts> (
    address: string, contractType: T,
): ConnectableFactory<T> => {
    const factory = contractTypeToFactory[contractType];
    // const fallbackSigner =

    return (async (connectAs?: SignerWithAddress) => {
        const signer = connectAs ? connectAs : (await getSignerAccounts())[0];
        return factory.connect(address, signer)
    }) as ConnectableFactory<T>;
};

export const getContractAddress = async (contractId: YetiContracts): Promise<string> => {
    const db = getDependencyByKey<DatabaseBase>('db');

    return await db.get(contractId);
};


export const getPersistedContract = async <T extends YetiContracts> (contractId: T): Promise<ConnectableFactory<T>> => {
    const contractAddress = await getContractAddress(contractId);
    return getInterfaceAtAddress(contractAddress, contractId);
};
