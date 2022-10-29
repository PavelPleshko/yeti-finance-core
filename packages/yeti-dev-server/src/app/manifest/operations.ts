import { readJSON } from '../../../utils/io/file.utils';

const MANIFEST_NAME = 'deployments.json';

export const fetchManifest = (): Promise<any> => {
    return readJSON<any>(`${ process.cwd() }/${ MANIFEST_NAME }`);
};
