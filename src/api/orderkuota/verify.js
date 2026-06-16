const axios = require('axios')
module.exports = (app) => {
  app.get('/orderkuota/verify', async (req, res) => {
    try {

      const { username, otp } = req.query

      if (!username || !otp) {
        return res.json({
          status: false,
          error: 'username & otp required'
        })
      }

      const payload = new URLSearchParams({
        username,
        password: otp,
        app_reg_id: 'di309HvATsaiCppl5eDpoc',
        app_version_code: '250811',
        app_version_name: '25.08.11'
      })

      const { data } = await axios.post(
        'https://app.orderkuota.com/api/v2/login',
        payload.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'okhttp/4.12.0'
          }
        }
      )

      res.json({
        status: true,
        result: data
      })

    } catch (e) {

      res.json({
        status: false,
        error: e.message,
        data: e.response?.data || null
      })

    }
  })
}