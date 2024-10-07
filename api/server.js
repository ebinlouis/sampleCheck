import axios from 'axios';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';

export default async function handler(req, res) {
    const owner = 'ebinlouis';
    const repo = 'MOS-Exam-V2024';
    const branch = 'main';
    const folderPath = 'Files';

    // Function to get folder contents recursively
    async function downloadFolder(owner, repo, folderPath, branch) {
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}?ref=${branch}`;

        try {
            const response = await axios.get(apiUrl);
            const folderContents = response.data;

            for (const item of folderContents) {
                if (item.type === 'file') {
                    await downloadFile(item.download_url, item.path);
                } else if (item.type === 'dir') {
                    await downloadFolder(owner, repo, item.path, branch);
                }
            }
        } catch (error) {
            console.error(`Failed to download folder: ${error}`);
        }
    }

    // Function to download a single file and save it locally
    async function downloadFile(fileUrl, filePath) {
        try {
            const response = await axios.get(fileUrl, {
                responseType: 'arraybuffer',
            });

            // Construct the local file path
            const localFilePath = join(process.cwd(), filePath);
            const dir = dirname(localFilePath);

            // Ensure the local directory exists
            if (!existsSync(dir)) {
                mkdirSync(dir, { recursive: true });
            }

            writeFileSync(localFilePath, response.data);
            console.log(`Downloaded: ${filePath}`);
        } catch (error) {
            console.error(`Failed to download file: ${error}`);
        }
    }

    // Start the download process
    await downloadFolder(owner, repo, folderPath, branch);
    res.status(200).send('Download complete');
}
