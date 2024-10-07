import axios from 'axios';

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
                    // Recursively download the contents of subdirectories
                    await downloadFolder(owner, repo, item.path, branch);
                }
            }
        } catch (error) {
            console.error(`Failed to download folder: ${error.message}`);
            throw error; // Re-throw the error to be caught in the outer try-catch
        }
    }

    // Function to download a single file (adjust this to return data or save elsewhere)
    async function downloadFile(fileUrl, filePath) {
        try {
            const response = await axios.get(fileUrl, {
                responseType: 'arraybuffer',
            });
            console.log(`Downloaded: ${filePath}`); // You may return this data instead
        } catch (error) {
            console.error(`Failed to download file: ${error.message}`);
            throw error; // Re-throw the error to be caught in the outer try-catch
        }
    }

    try {
        await downloadFolder(owner, repo, folderPath, branch);
        res.status(200).send('Download complete');
    } catch (error) {
        console.error(`Error: ${error.message}`); // Log the error message
        res.status(500).send('Download failed');
    }
}
