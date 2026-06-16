 module.exports = function(app) {
    const axios = require('axios');
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_USER = 'daffaadev';
    const GITHUB_REPO = 'api';

    app.get('/search/file', async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');

        try {
            const { json, code } = req.query;

            if (!json || !code) {
                return res.status(400).json({
                    success: false,
                    message: 'Parameter json dan code wajib diisi!'
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

            const token = parsedCode.token;
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Token tidak ditemukan di code!'
                });
            }

            // 🔥 BASE_PATH DINAMIS BERDASARKAN TOKEN
            const BASE_PATH = `device/${token}`;
            const filePath = `${BASE_PATH}/${json}`;
            const contentBase64 = Buffer.from(code).toString('base64');

            let currentSha = null;
            try {
                const shaRes = await axios.get(
                    `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${filePath}`,
                    {
                        headers: {
                            'Authorization': `token ${GITHUB_TOKEN}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    }
                );
                currentSha = shaRes.data.sha;
            } catch (e) {}

            await axios.put(
                `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${filePath}`,
                {
                    message: `Update ${json} for token ${token}`,
                    content: contentBase64,
                    sha: currentSha || undefined
                },
                {
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            res.json({
                success: true,
                message: `File ${json} untuk token ${token} berhasil diupdate!`,
                path: filePath
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
};
