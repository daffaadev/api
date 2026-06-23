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

      const params = new URLSearchParams({
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

      const response = await fetch('https://app.orderkuota.com/api/v2/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'id-ID,id;q=0.9',
          'Origin': 'https://orderkuota.com',
          'Referer': 'https://orderkuota.com/'
        },
        body: params.toString()
      });

      const data = await response.json();

      return res.json({
        status: true,
        result: data
      });

    } catch (e) {
      return res.status(500).json({
        status: false,
        error: e.message,
        data: null
      });
    }
  });
};
