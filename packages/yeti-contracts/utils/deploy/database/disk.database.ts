import * as path from 'path';

import { readJSON, writeJSON } from '../../io/file.utils';
import { DatabaseBase, DeploymentAddress, DeploymentIdentifier } from './database.base';


export const DEP_DATABASE_FILE_PATH = path.join(process.cwd(), 'deployments.json');
export type DbRecords = Record<string, string>;

export class DiskDatabase extends DatabaseBase {

    protected async _set (deploymentIdentifier: DeploymentIdentifier, address: DeploymentAddress): Promise<boolean> {
        const data = await this._fetchDbContent().catch(_ => ({} as DbRecords));
        data[deploymentIdentifier] = address;
        await writeJSON(DEP_DATABASE_FILE_PATH, data);
        return true;
    }

    protected async _get (deploymentIdentifier: DeploymentIdentifier): Promise<DeploymentAddress> {
        const data = await this._fetchDbContent();
        return data[deploymentIdentifier];
    }

    private async _fetchDbContent (): Promise<DbRecords> {
        return await readJSON(DEP_DATABASE_FILE_PATH);
    }
}
