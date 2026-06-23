// index.js - FULL CODE LENGKAP
const express = require('express');
const axios = require('axios');
const https = require('https');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route utama biar gak error 404
app.get('/', (req, res) => {
  res.json({
    status: true,
    message: 'API Rynn running',
    endpoints: {
      '/orderkuota/login': 'GET dengan parameter username & password'
    }
  });
});

// Route orderkuota
app.get('/orderkuota/login', async (req, res) => {
  try {
    const { username, password } = req.query;

    if (!username || !password) {
      return res.status(400).json({
        status: false,
        error: 'Parameter username dan password wajib diisi'
      });
    }

    const payload = new URLSearchParams({
      username: username.toString(),
      password: password.toString(),
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
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'id-ID,id;q=0.9',
        'Origin': 'https://orderkuota.com',
        'Referer': 'https://orderkuota.com/'
      },
      timeout: 30000,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });

    return res.json({
      status: true,
      result: response.data
    });

  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({
      status: false,
      error: error.message,
      data: error.response?.data || null
    });
  }
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

module.exports = app;
