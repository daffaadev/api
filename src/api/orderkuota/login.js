const axios = require('axios');
const https = require('https');

module.exports = (app) => {
  app.get('/orderkuota/login', async (req, res) => {
    try {
      const { username, password } = req.query;

      if (!username || !password) {
        return res.status(400).json({
          status: false,
          error: 'Parameter username dan password wajib diisi'
        });
      }

      // Proxy rotation
      const proxies = [
        { host: '103.152.188.11', port: 80 },
        { host: '103.149.82.158', port: 8181 },
        { host: '103.121.96.210', port: 80 },
        { host: '103.89.228.138', port: 8080 },
        { host: '103.143.22.30', port: 1080 }
      ];

      const proxy = proxies[Math.floor(Math.random() * proxies.length)];

      const payload = new URLSearchParams({
        username,
        password,
        app_reg_id: 'di309HvATsaiCppl5eDpoc',
        app_version_code: '250811',
        app_version_name: '25.08.11',
        phone_model: 'SM-G960N',
        phone_android_version: '9',
        ui_mode: 'light',
        request_time: Math.floor(Date.now() / 1000)
      });

      const response = await axios({
        method: 'POST',
        url: 'https://app.orderkuota.com/api/v2/login',
        data: payload.toString(),
        timeout: 30000,
        proxy: {
          host: proxy.host,
          port: proxy.port,
          protocol: 'http'
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'id-ID,id;q=0.9',
          'Origin': 'https://orderkuota.com',
          'Referer': 'https://orderkuota.com/',
          'X-Forwarded-For': `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        }
      });

      return res.json({
        status: true,
        result: response.data
      });

    } catch (e) {
      return res.status(500).json({
        status: false,
        error: e.message,
        data: e.response?.data || null
      });
    }
  });
};
