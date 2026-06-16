 const axios = require('axios');

const GITHUB_TOKEN = Buffer.from('Z2l0aHViX3BhdF8xMUJYN0RXSlkwbFBIWGZJQ2VpMmM5X3JUTHpYYUhxcUhHUjVtRUliU3lxMXNxdU9SVHR0SmFnNjZJaGlnTzZ5enpXNjYzU0lVVnZZSXFwYzl3', 'base64').toString('utf-8');
const GITHUB_USER = 'daffaadev';
const GITHUB_REPO = 'api';
const BASE_PATH = 'device/rvg-koalanshsb';

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        const { json, code } = req.query;
        if (!json || !code) {
            return res.status(400).json({ 
                success: false, 
                message: 'Parameter json dan code wajib diisi!' 
            });
        }

        const parsedCode = JSON.parse(code);
        if (!parsedCode.token || parsedCode.token !== 'rvg-koalanshsb') {
            return res.status(401).json({ success: false, message: 'Token tidak valid!' });
        }

        const filePath = `${BASE_PATH}/${json}`;
        const contentBase64 = Buffer.from(code).toString('base64');

        let currentSha = null;
        try {
            const shaRes = await axios.get(
                `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${filePath}`,
                { headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' } }
            );
            currentSha = shaRes.data.sha;
        } catch (e) {}

        await axios.put(
            `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${filePath}`,
            { message: `Update ${json}`, content: contentBase64, sha: currentSha || undefined },
            { headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' } }
        );

        res.json({ success: true, message: `File ${json} berhasil diupdate!` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
