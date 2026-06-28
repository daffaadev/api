module.exports = (app) => {
  app.get('/api/anime/search', async (req, res) => {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({
          status: false,
          error: 'Parameter query wajib diisi'
        });
      }

      const axios = require('axios');
      
      // Search dari Jikan
      const searchResponse = await axios.get(`https://api.jikan.moe/v4/anime`, {
        params: {
          q: query,
          limit: 10
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });

      const results = searchResponse.data.data.map(anime => ({
        mal_id: anime.mal_id,
        title: anime.title,
        thumbnail: anime.images?.jpg?.image_url || null,
        episodes: anime.episodes || 0,
        status: anime.status || null,
        synopsis: anime.synopsis || null,
        // Link streaming dari gogoanime (lu bisa akses langsung)
        watch_url: `https://gogoanime.gg/category/${anime.title.toLowerCase().replace(/ /g, '-')}`,
        // Atau pake alternate domain
        watch_url_alt: `https://animepahe.com/anime/${anime.mal_id}`
      }));

      return res.json({
        status: true,
        result: {
          query: query,
          total_results: results.length,
          data: results
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
