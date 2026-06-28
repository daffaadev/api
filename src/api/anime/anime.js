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
      const cheerio = require('cheerio');

      const response = await axios.get(`https://otakudesu.blog/?s=${encodeURIComponent(query)}`, {
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

      const $ = cheerio.load(response.data);
      const results = [];

      $('.blok, .listanime, .col-anime, .item, .post, article, .entry').each((i, el) => {
        const title = $(el).find('.title, h2, h3, .entry-title, a').first().text().trim();
        const link = $(el).find('a').first().attr('href');
        const thumbnail = $(el).find('img').first().attr('src') || $(el).find('img').first().attr('data-src');
        const rating = $(el).find('.rating, .score').text().trim();
        const episode = $(el).find('.episode, .eps').text().trim();
        const genre = $(el).find('.genre, .genres').text().trim();
        const status = $(el).find('.status').text().trim();
        const synopsis = $(el).find('.synopsis, .desc, .description').text().trim();

        if (title && link) {
          results.push({
            title: title,
            url: link,
            thumbnail: thumbnail || null,
            rating: rating || null,
            episode: episode || null,
            genre: genre || null,
            status: status || null,
            synopsis: synopsis || null,
            source: 'otakudesu'
          });
        }
      });

      return res.json({
        status: true,
        result: {
          query: query,
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
