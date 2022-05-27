import { ProtocolConfig } from '../../config';
import { eEthereumNetwork } from '../../config/networks';
import { DEV_RE } from '../../misc';
import { DatabaseBase } from './database.base';
import { DiskDatabase } from './disk.database';
import { InMemoryDatabase } from './in-memory.database';


export const initDbFromConfig = (config: ProtocolConfig): DatabaseBase => {
    const network = <eEthereumNetwork>DEV_RE.network.name;
    const envConfigForNetwork = config.envConfig[network];

    if (envConfigForNetwork.inMemoryDb) {
        return new InMemoryDatabase(network);
    } else {
        return new DiskDatabase(network)
    }
}
