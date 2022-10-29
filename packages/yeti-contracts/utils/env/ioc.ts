import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import { eEthereumNetwork } from '../config/networks';
import { getSignerAccounts } from '../contract-deploy';
import { DatabaseBase } from '../deploy/database/database.base';
import { initDbFromConfig } from '../deploy/database/database.config';
import { DEV_RE, IOC_SYMBOL } from '../misc';
import protocolConfig from '../config';

export interface InjectionTokens {
    db: DatabaseBase;
    config: typeof protocolConfig;
    owner: SignerWithAddress;
}

export const createEnv = async (): Promise<void> => {
    const network = <eEthereumNetwork> DEV_RE.network.name;
    const config = protocolConfig;

    const db = initDbFromConfig(config);
    const [ owner ] = await getSignerAccounts();

    (DEV_RE as any)[IOC_SYMBOL] = {
        db,
        config,
        owner,
    } as InjectionTokens;
};

export const injectFromEnv = <T extends keyof InjectionTokens> (key: T): InjectionTokens[T] => {
    return (DEV_RE as any)[IOC_SYMBOL][key];
};
