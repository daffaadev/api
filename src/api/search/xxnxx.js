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

      const response = await fetch(`https://www.xnxxx.com/search/${encodeURIComponent(query)}?type=media`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'id-ID,id;q=0.9'
        }
      });

      const data = await response.json();

      // Filter cuma video dan foto
      const filtered = {
        videos: data.videos || [],
        photos: data.photos || []
      };

      return res.json({
        status: true,
        result: filtered
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
