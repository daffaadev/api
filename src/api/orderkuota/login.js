const axios = require('axios')

module.exports = (app) => {
  app.get('/orderkuota/login', async (req, res) => {
    try {
      const { username, password } = req.query

      if (!username || !password) {
        return res.status(400).json({
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

      const response = await axios({
        method: 'POST',
        url: 'https://app.orderkuota.com/api/v2/login',
        data: payload.toString(),
        timeout: 30000,
        validateStatus: () => true,
        headers: {
          'Host': 'app.orderkuota.com',
          'Connection': 'Keep-Alive',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'okhttp/4.12.0'
        }
      })

      return res.json({
        status: true,
        http_status: response.status,
        headers: response.headers,
        result: response.data
      })

    } catch (e) {

      console.error('ERROR MESSAGE:', e.message)
      console.error('ERROR STATUS:', e.response?.status)
      console.error('ERROR HEADERS:', e.response?.headers)
      console.error('ERROR DATA:', e.response?.data)

      return res.status(500).json({
        status: false,
        creator: 'Daffa',
        message: e.message,
        code: e.response?.status || null,
        headers: e.response?.headers || null,
        data: e.response?.data || null,
        stack: process.env.NODE_ENV === 'development'
          ? e.stack
          : undefined
      })
    }
  })
}
