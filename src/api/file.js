const axios = require('axios');

// ====== GITHUB CONFIG ======
// API Key base64 (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)
const GITHUB_TOKEN = Buffer.from('Z2l0aHViX3BhdF8xMUJYN0RXSlkwbFBIWGZJQ2VpMmM5X3JUTHpYYUhxcUhHUjVtRUliU3lxMXNxdU9SVHR0SmFnNjZJaGlnTzZ5enpXNjYzU0lVVnZZSXFwYzl3', 'base64').toString('utf-8');
const GITHUB_USER = 'daffaadev';
const GITHUB_REPO = 'api';
const BASE_PATH = 'device/rvg-koalanshsb';

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { json, code } = req.query;

        if (!json || !code) {
            return res.status(400).json({
                success: false,
                message: 'Parameter json dan code wajib diisi! Contoh: ?json=info.json&code={"token":"xxx"}'
            });
        }

        let parsedCode;
        try {
            parsedCode = JSON.parse(code);
        } catch (e) {
            return res.status(400).json({ 
                success: false, 
                message: 'Format code harus JSON valid!' 
            });
        }

        if (!parsedCode.token || parsedCode.token !== 'rvg-koalanshsb') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token tidak valid!' 
            });
        }

        const filePath = `${BASE_PATH}/${json}`;

        // 1. Dapatkan SHA file saat ini
        let currentSha = null;
        try {
            const shaResponse = await axios.get(
                `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${filePath}`,
                {
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json'
                    },
                    timeout: 10000
                }
            );
            currentSha = shaResponse.data.sha;
        } catch (error) {
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

        await axios.put(
            `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${filePath}`,
            updatePayload,
            {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                },
                timeout: 15000
            }
        );

        return res.status(200).json({
            success: true,
            message: `File ${json} berhasil diupdate!`,
            file: filePath,
            github_url: `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${filePath}`,
            data: parsedCode
        });

    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Gagal update file!',
            error: error.message
        });
    }
};
