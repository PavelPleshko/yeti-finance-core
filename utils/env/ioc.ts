import { eEthereumNetwork } from '../config/networks';
import { initDbFromConfig } from '../deploy/database/database.config';
import { DEV_RE, IOC_SYMBOL } from '../misc';
import protocolConfig from '../config';

export const createEnv = async (): Promise<void> => {
    const network = <eEthereumNetwork> DEV_RE.network.name;
    const config = protocolConfig;

    const db = initDbFromConfig(config);

    (DEV_RE as any)[IOC_SYMBOL] = {
        db,
    };
};

export const getDependencyByKey = <T> (key: string): T => {
    return (DEV_RE as any)[IOC_SYMBOL][key];
};
