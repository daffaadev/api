module.exports = (app) => {
  app.get('/api/search', async (req, res) => {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({
          status: false,
          error: 'Parameter query wajib diisi'
        });
      }

      // Coba pake 3 sumber berbeda
      const sources = [
        `https://www.xnxx.com/search/${encodeURIComponent(query)}`,
        `https://xnxx.com/v1/search?q=${encodeURIComponent(query)}`,
        `https://pornhub.com/api/search?keyword=${encodeURIComponent(query)}`
      ];

      let data = null;
      let errorMsg = null;

      for (const url of sources) {
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/json'
            },
            signal: AbortSignal.timeout(10000)
          });

          if (response.ok) {
            data = await response.json();
            break;
          }
        } catch (e) {
          errorMsg = e.message;
          continue;
        }
      }

      if (!data) {
        return res.status(404).json({
          status: false,
          error: 'Semua sumber gagal',
          detail: errorMsg
        });
      }

      return res.json({
        status: true,
        result: data
      });

    } catch (e) {
      return res.status(500).json({
        status: false,
        error: e.message
      });
    }
  });
};
