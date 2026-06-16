const axios = require('axios')

module.exports = (app) => {
  app.get('/orderkuota/login', async (req, res) => {
    try {
      const { username, password } = req.query

      if (!username || !password) {
        return res.json({
          status: false,
          error: 'Parameter username dan password wajib diisi'
        })
      }

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
      })

      const { data } = await axios.post(
        'https://app.orderkuota.com/api/v2/login',
        payload.toString(),
        {
          headers: {
            Host: 'app.orderkuota.com',
            Connection: 'Keep-Alive',
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'okhttp/4.12.0'
          }
        }
      )

      return res.json({
        status: true,
        result: data
      })

    } catch (e) {
      return res.status(500).json({
        status: false,
        error: e.message,
        data: e.response?.data || null
      })
    }
  })
}