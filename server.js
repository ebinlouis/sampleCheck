const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

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

        const localFilePath = path.join(__dirname, '..', filePath);
        const dir = path.dirname(localFilePath);

        // Ensure the local directory exists
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Write the file content to the local file
        fs.writeFileSync(localFilePath, response.data);
        console.log(`Downloaded: ${filePath}`);
    } catch (error) {
        console.error(`Failed to download file: ${error}`);
    }
}

app.use(cors());

// Endpoint to trigger the download process
app.get('/download', async (req, res) => {
    try {
        await downloadFolder(owner, repo, folderPath, branch);
        res.status(200).send('Download completed successfully.');
    } catch (error) {
        res.status(500).send(`Error during download: ${error.message}`);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
