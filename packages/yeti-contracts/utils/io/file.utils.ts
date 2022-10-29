import * as fs from 'fs';

// export function createFile (atPath: string): boolean {
//     fs.op
// }

export async function read (filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (error: Error | null, data: Buffer) => {
            if (error) {
                reject(error);
            } else {
                resolve(data.toString());
            }
        });
    });
}

export async function write (filePath: string, content: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, content, (error: Error | null) => {
            if (error) {
                reject(error);
            } else {
                resolve(true);
            }
        });
    });
}

export async function readJSON<T = { [key: string]: any }> (filePath: string): Promise<T> {
    const data = await read(filePath);
    return JSON.parse(data) as T;
}

export async function writeJSON<T = { [key: string]: any }> (filePath: string, data: T): Promise<boolean> {
    return await write(filePath, JSON.stringify(data));
}
