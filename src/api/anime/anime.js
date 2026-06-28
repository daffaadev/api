module.exports = (app) => {
  app.get('/api/anime/search', async (req, res) => {
    try {
      const { query, page = 1 } = req.query;

      if (!query) {
        return res.status(400).json({
          status: false,
          error: 'Parameter query wajib diisi'
        });
      }

      const axios = require('axios');
      const cheerio = require('cheerio');

      // Pake API alternatif - consumet (gogoanime)
      const response = await axios.get(`https://api.consumet.org/anime/gogoanime/${encodeURIComponent(query)}?page=${page}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        },
        timeout: 30000
      });

      const data = response.data;
      const results = [];

      if (data.results) {
        data.results.forEach((item) => {
          results.push({
            title: item.title || 'No title',
            url: `https://gogoanime.gg/category/${item.id}`,
            thumbnail: item.image || null,
            rating: item.rating || null,
            episode: item.episodes || null,
            status: item.status || null,
            genres: item.genres || [],
            synopsis: item.synopsis || null,
            type: item.type || null,
            source: 'gogoanime (via consumet)'
          });
        });
      }

      const totalPages = data.totalPages || 5;
      const currentPage = parseInt(page);

      return res.json({
        status: true,
        result: {
          query: query,
          current_page: currentPage,
          total_pages: totalPages,
          next_page: currentPage < totalPages ? `/api/anime/search?query=${encodeURIComponent(query)}&page=${currentPage + 1}` : null,
          prev_page: currentPage > 1 ? `/api/anime/search?query=${encodeURIComponent(query)}&page=${currentPage - 1}` : null,
          total_results: results.length,
          data: results.slice(0, 20)
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
