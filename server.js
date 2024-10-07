const express = require('express');
const axios = require('axios');
const { existsSync, mkdirSync, writeFileSync } = require('fs');
const { join, dirname } = require('path');
const { fileURLToPath } = require('url');

const app = express();
const port = 3001;

// Define __dirname using fileURLToPath
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// GitHub repo information
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
                // Recursively download the contents of subdirectories
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
        const localFilePath = join(__dirname, filePath);
        const dir = dirname(localFilePath); // This should be valid now

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

// API route to trigger the folder download
app.get('/download-folder', async (req, res) => {
    try {
        await downloadFolder(owner, repo, folderPath, branch);
        res.status(200).send('Download complete');
    } catch (error) {
        res.status(500).send('Download failed');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
