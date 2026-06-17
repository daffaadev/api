 module.exports = function(app) {
    const axios = require('axios');
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_USER = 'daffaadev';
    const GITHUB_REPO = 'api';

    app.get('/api/rat/:token/:file', async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');

        try {
            const { token, file } = req.params;

            if (!token || !file) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid parameters.'
                });
            }

            // Pastikan file punya ekstensi .json
            if (!file.endsWith('.json')) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid parameters.'
                });
            }

            const filePath = `device/${token}/${file}`;

            let fileExists = false;
            let fileContent = null;
            try {
                const getRes = await axios.get(
                    `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${filePath}`
                );
                fileExists = true;
                fileContent = getRes.data;
            } catch (e) {
                fileExists = false;
            }

            if (!fileExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Invalid parameters.'
                });
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
