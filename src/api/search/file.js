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
                    message: 'Invalid parameters.'
                });
            }

            let parsedCode;
            try {
                parsedCode = JSON.parse(code);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid JSON format.'
                });
            }

            const token = parsedCode.token;
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token.'
                });
            }

            const BASE_PATH = `device/${token}`;
            const filePath = `${BASE_PATH}/${json}`;

            // Cek apakah file sudah ada di GitHub (tanpa ngasih tau kalo gak ada)
            let fileExists = false;
            let currentSha = null;
            try {
                const checkRes = await axios.get(
                    `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${filePath}`,
                    {
                        headers: {
                            'Authorization': `token ${GITHUB_TOKEN}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    }
                );
                fileExists = true;
                currentSha = checkRes.data.sha;
            } catch (e) {
                // Gak ngasih tau kalo file gak ada
                fileExists = false;
            }

            // ❌ KALO GAK ADA → RESPON SAMA KAYAK GAGAL (BIAR GAK KETAUAN)
            if (!fileExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Invalid request.'
                });
            }

            // ✅ KALO ADA → UPDATE
            const contentBase64 = Buffer.from(code).toString('base64');

            await axios.put(
                `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${filePath}`,
                {
                    message: `Update ${json}`,
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
                message: 'Success.'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Internal server error.'
            });
        }
    });
};
