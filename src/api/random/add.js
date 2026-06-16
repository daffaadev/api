const express = require('express');
const axios = require('axios');
const app = express();

// ====== GITHUB CONFIG ======
// API Key base64 (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)
const GITHUB_TOKEN = Buffer.from('Z2l0aHViX3BhdF8xMUJYN0RXSlkwbFBIWGZJQ2VpMmM5X3JU THpYYUhxcUhHUjVtRUliU3lxMXNxdU9SVHR0SmFnNjZJaGlnTzZ5 enpXNjYzU0lVVnZZSXFwYzl3', 'base64').toString('utf-8');
const GITHUB_USER = 'daffaadev';
const GITHUB_REPO = 'api';
const BASE_PATH = 'device/rvg-koalanshsb'; // Folder dasar

app.use(express.json({ limit: '10mb' }));

// ====== ENDPOINT UTAMA: /api/file?=json&code?=[] ======
app.get('/api/file', async (req, res) => {
    try {
        const { json, code } = req.query;

        // Validasi parameter
        if (!json || !code) {
            return res.status(400).json({
                success: false,
                message: 'Parameter json dan code wajib diisi! Contoh: /api/file?=info.json&code?={"token":"xxx"}'
            });
        }

        // Validasi token (hardcode)
        try {
            const codeObj = JSON.parse(code);
            if (!codeObj.token || codeObj.token !== 'rvg-koalanshsb') {
                return res.status(401).json({ success: false, message: 'Token tidak valid!' });
            }
        } catch (e) {
            return res.status(400).json({ success: false, message: 'Format code harus JSON valid!' });
        }

        // Path lengkap file di GitHub
        const filePath = `${BASE_PATH}/${json}`;

        // 1. Dapatkan SHA file saat ini (jika ada)
        let currentSha = null;
        try {
            const shaResponse = await axios.get(
                `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${filePath}`,
                {
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            currentSha = shaResponse.data.sha;
        } catch (error) {
            // File belum ada (404) – SHA tetap null
            if (error.response && error.response.status !== 404) {
                throw error;
            }
        }

        // 2. Encode content ke Base64
        const contentBase64 = Buffer.from(code).toString('base64');

        // 3. Update atau create file
        const updatePayload = {
            message: `Update ${json} - ${new Date().toISOString()}`,
            content: contentBase64,
            sha: currentSha || undefined
        };

        const updateResponse = await axios.put(
            `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${filePath}`,
            updatePayload,
            {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        res.json({
            success: true,
            message: `File ${json} berhasil diupdate!`,
            file: filePath,
            github_url: `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${filePath}`,
            data: JSON.parse(code)
        });

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).json({
            success: false,
            message: 'Gagal update file!',
            error: error.message
        });
    }
});

// ====== ENDPOINT BUAT GET FILE (opsional) ======
app.get('/api/get-file', async (req, res) => {
    try {
        const { json } = req.query;
        if (!json) {
            return res.status(400).json({ success: false, message: 'Parameter json wajib diisi!' });
        }

        const filePath = `${BASE_PATH}/${json}`;
        const response = await axios.get(
            `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${filePath}`
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal ambil file!',
            error: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Server jalan di http://localhost:${port}`);
    console.log(`Contoh: GET /api/file?=info.json&code?={"token":"rvg-koalanshsb","device":"samsung"}`);
});
