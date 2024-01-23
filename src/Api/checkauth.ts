import * as fs from 'node:fs';
import * as path from 'path';
import * as util from 'util';

const readFileAsync = util.promisify(fs.readFile);
const accessAsync = util.promisify(fs.access);

const tokensFolderPath = path.join(__dirname, 'tokens');

export const setAuthStatusToFile = async (status: boolean) => {
    if (!fs.existsSync(tokensFolderPath)) {
        fs.mkdirSync(tokensFolderPath);
    }

    fs.readdir(tokensFolderPath, (err, _files) => {
        if (err) {
            console.error(err);
        } else {
            const filePath = path.join(tokensFolderPath, `status.json`);
            fs.writeFileSync(filePath, JSON.stringify({ status }, null, 2));
        }
    });
};

export const getAuthStatusFromFile = async () => {
    const statusPath = `${tokensFolderPath}/status.json`;

    try {
        const fsData = await readFileAsync(statusPath, 'utf-8');
        const existingData = await JSON.parse(fsData);
        return existingData.status;
    } catch (error) {
        fs.readdir(tokensFolderPath, (err, _files) => {
            if (err) {
                console.error(err);
            } else {
                const statusPath = path.join(tokensFolderPath, `status.json`);
                fs.writeFileSync(
                    statusPath,
                    JSON.stringify({ status: false }, null, 2)
                );
            }
        });
        return '';
    }
};

export const checkStatusHealthFromFile = async () => {
    try {
        const statusPath = `${tokensFolderPath}/status.json`;
        await accessAsync(statusPath);
        return true;
    } catch (error) {
        return false;
    }
};
