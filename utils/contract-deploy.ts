import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract, ContractReceipt, ContractTransaction, Event as LogEvent } from 'ethers';
import { AddressesProvider, AssetPoolManager, ERC20Mock, Yeti, YToken } from '../typechain';
import { YetiContracts } from './contract-factories';
import { DatabaseBase } from './deploy/database/database.base';
import { getDependencyByKey } from './env/ioc';
import { DEV_RE } from './misc';

export const deployYetiProtocol = async (as?: SignerWithAddress): Promise<Yeti> => {
    return await deployContract<Yeti>(YetiContracts.Yeti, [], as);
};

export const deployAddressesProvider = async (as?: SignerWithAddress): Promise<AddressesProvider> => {
    return await deployContract<AddressesProvider>(YetiContracts.AddressesProvider, [], as);
};

export const deployAssetPoolManager = async (as?: SignerWithAddress): Promise<AssetPoolManager> => {
    return await deployContract<AssetPoolManager>(YetiContracts.AssetPoolManager, [], as);
};

/**
 * Deploys a contract out of Yeti protocol and waits for transaction to be mined.
 * Helper function.
 */
export const deployContract = async <T extends Contract> (contractId: YetiContracts, args: any[] = [], as?: SignerWithAddress): Promise<T> => {
    const [ owner ] = await getSignerAccounts();
    const contractFactory = await DEV_RE.ethers.getContractFactory(contractId);

    const result = await contractFactory.connect(as || owner).deploy(...args);
    return await result.deployed() as T;
};

export const getSignerAccounts = async (): Promise<SignerWithAddress[]> => {
    return await DEV_RE.ethers.getSigners();
};


export const waitForTransaction = async (tx: ContractTransaction): Promise<ContractReceipt> => await tx.wait(1);


export const getRecognizedEvents = (allEvents: LogEvent[]): LogEvent[] => {
    return allEvents.filter(({ event }) => !!event);
};

export const findEventLog = (events: LogEvent[], byName: string): LogEvent | undefined => {
    return events.find(({ event }) => event === byName);
};


// mocks
export const deployYetiMockProtocol = async (as?: SignerWithAddress): Promise<Yeti> => {
    return await deployContract<Yeti>(YetiContracts.YetiMockUpgrade, [], as);
};


export const deployYetiMockToken = async (): Promise<YToken> => {
    return await deployContract<YToken>(YetiContracts.YToken, []);
};

// args: name, symbol, decimals
export const deployERC20MockToken = async (args: [ string, string, number ]): Promise<ERC20Mock> => {
    return await deployContract<ERC20Mock>(YetiContracts.ERC20Mock, args);
};


export const persistentDeploy = async <ContractType extends Contract>(instance: ContractType, contractId: YetiContracts): Promise<ContractType> => {
    await waitForTransaction(instance.deployTransaction);

    const db = getDependencyByKey<DatabaseBase>('db');
    await db.set(contractId, instance);
    return instance;
}
