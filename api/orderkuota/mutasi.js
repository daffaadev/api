const axios = require('axios')
const qs = require('qs')

module.exports = (app) => {
  app.get('/orderkuota/mutasi', async (req, res) => {
    try {

      const { username, token, page } = req.query

      if (!username || !token || !page) {
        return res.json({
          status: false,
          error: 'username, token & page required'
        })
      }

      const userid = token?.split(':')?.[0]

      if (!userid) {
        return res.json({
          status: false,
          error: 'token tidak valid'
        })
      }

      const payload = qs.stringify({
        request_time: Math.floor(Date.now() / 1000),
        auth_username: username,
        auth_token: token,
        'requests[qris_history][page]': page,
        'requests[0]': 'account'
      })

      const { data } = await axios.post(
        `https://app.orderkuota.com/api/v2/qris/mutasi/${userid}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'okhttp/4.12.0'
          },
          timeout: 15000
        }
      )

      return res.json({
        status: true,
        result: data
      })

    } catch (e) {

      return res.json({
        status: false,
        error: e.message,
        data: e.response?.data || null
      })

    }
  })
}