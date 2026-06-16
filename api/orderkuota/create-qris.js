 const axios = require('axios')
const QRCode = require('qrcode')

module.exports = (app) => {
  app.get('/orderkuota/create-qris', async (req, res) => {
    try {
      const { username, token, amount } = req.query

      if (!username || !token || !amount) {
        return res.json({
          status: false,
          error: 'username, token & amount required'
        })
      }

      const userid = token.split(':')[0]

      const payload = new URLSearchParams({
        request_time: Math.floor(Date.now() / 1000),
        auth_username: username,
        auth_token: token,

        // 🔥 FIX UTAMA DI SINI
        'requests[0]': 'account',
        'requests[1]': 'qris'
      })

      const { data } = await axios.post(
        `https://app.orderkuota.com/api/v2/get`,
        payload.toString(),
        {
          headers: {
            'User-Agent': 'okhttp/4.12.0',
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )

      const account = data?.result?.account?.results
      const qrisUrl = account?.qris

      if (!qrisUrl) {
        return res.json({
          status: false,
          message: 'QRIS masih null dari API (requests[qris] belum aktif / akun belum support)'
        })
      }

      const dynamicPayload = JSON.stringify({
        qris: qrisUrl,
        amount: Number(amount),
        merchant: account.qris_name,
        user_id: account.id,
        timestamp: Date.now()
      })

      const qrImage = await QRCode.toDataURL(dynamicPayload)

      return res.json({
        status: true,
        creator: "Rynn",
        result: {
          amount,
          qris_url: qrisUrl,
          merchant: account.qris_name,
          qr_image: qrImage
        }
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