module.exports = function(app) {
    const axios = require('axios');
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_USER = 'daffaadev';
    const GITHUB_REPO = 'api';

    app.get('/api/rat/:token/json', async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');

        try {
            const { token } = req.params;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid parameters.'
                });
            }

            const filePath = `device/${token}/info.json`;

            // Cek apakah file ada
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
