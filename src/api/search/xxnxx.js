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

      const response = await fetch(`https://www.xxxx.com/search/${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        }
      });

      const html = await response.text();

      // Extract video URLs
      const videoRegex = /https?:\/\/[^\s"']+\.(mp4|webm|avi|mov|mkv|m3u8)[^\s"']*/gi;
      const videos = html.match(videoRegex) || [];

      // Extract image URLs
      const imageRegex = /https?:\/\/[^\s"']+\.(jpg|jpeg|png|gif|webp|bmp|svg)[^\s"']*/gi;
      const photos = html.match(imageRegex) || [];

      return res.json({
        status: true,
        result: {
          videos: videos.slice(0, 20),
          photos: photos.slice(0, 30)
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
