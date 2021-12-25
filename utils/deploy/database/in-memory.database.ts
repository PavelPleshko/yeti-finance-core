import { DatabaseBase, DeploymentAddress, DeploymentIdentifier } from './database.base';


export class InMemoryDatabase extends DatabaseBase {

    protected _deployments: Record<DeploymentIdentifier, DeploymentAddress> = {};

    protected _set (deploymentIdentifier: DeploymentIdentifier, address: DeploymentAddress): Promise<boolean> {
        this._deployments[deploymentIdentifier] = address;
        return Promise.resolve(true);
    }

    protected _get (deploymentIdentifier: DeploymentIdentifier): Promise<DeploymentAddress> {
        return Promise.resolve(this._deployments[deploymentIdentifier]);
    }
}
