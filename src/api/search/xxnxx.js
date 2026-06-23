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

      const axios = require('axios');
      
      // Looping halaman 1-5
      const allVideos = [];
      const allPhotos = [];

      for (let page = 1; page <= 5; page++) {
        try {
          const response = await axios.get(`https://www.xnxx.com/search/${encodeURIComponent(query)}/${page}`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'id-ID,id;q=0.9'
            },
            timeout: 30000,
            httpsAgent: new (require('https').Agent)({
              rejectUnauthorized: false
            })
          });

          const html = response.data;

          const videoRegex = /https?:\/\/[^\s"']+\.(mp4|webm|avi|mov|mkv|m3u8)[^\s"']*/gi;
          const videos = html.match(videoRegex) || [];
          allVideos.push(...videos);

          const imageRegex = /https?:\/\/[^\s"']+\.(jpg|jpeg|png|gif|webp|bmp|svg)[^\s"']*/gi;
          const photos = html.match(imageRegex) || [];
          allPhotos.push(...photos);

        } catch (e) {
          continue;
        }
      }

      return res.json({
        status: true,
        result: {
          query: query,
          pagination: {
            total_pages: 5,
            scraped_pages: allVideos.length > 0 || allPhotos.length > 0 ? 5 : 0
          },
          videos: allVideos.slice(0, 50),
          photos: allPhotos.slice(0, 50)
        }
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
