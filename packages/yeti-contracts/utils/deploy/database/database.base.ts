import { Contract } from 'ethers';
import { eEthereumNetwork } from '../../config/networks';

export type DeploymentIdentifier = string;
export type DeploymentAddress = string;

export abstract class DatabaseBase {

    constructor (
        protected _networkName: eEthereumNetwork,
    ) {}

    set (contractName: string, contract: Contract): Promise<boolean> {
        const deploymentIdentifier = this._getDeploymentIdentifierForName(contractName);

        console.log(`Registering contract ${ contractName } in database.`);

        return this._set(deploymentIdentifier, contract.address);
    }

    get (contractName: string): Promise<DeploymentAddress> {
        const deploymentIdentifier = this._getDeploymentIdentifierForName(contractName);
        return this._get(deploymentIdentifier);
    }

    protected _getDeploymentIdentifierForName (name: string): string {
        return `${ this._networkName }.${ name }`;
    }

    protected abstract _set (deploymentIdentifier: DeploymentIdentifier, address: DeploymentAddress): Promise<boolean>;

    protected abstract _get (deploymentIdentifier: DeploymentIdentifier): Promise<DeploymentAddress>;
}
