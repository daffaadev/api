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

      // Coba pake domain yang masih hidup
      const domains = [
        'https://otakudesu.blog',
        'https://otakudesu.art',
        'https://otakudesu.uno',
        'https://otakudesu.tv',
        'https://otakudesu.lol'
      ];

      let html = '';
      let success = false;

      for (const domain of domains) {
        try {
          const response = await axios.get(`${domain}/?s=${encodeURIComponent(query)}`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'id-ID,id;q=0.9',
              'Referer': 'https://otakudesu.blog/'
            },
            timeout: 30000,
            httpsAgent: new (require('https').Agent)({
              rejectUnauthorized: false
            })
          });

          html = response.data;
          success = true;
          break;
        } catch (e) {
          continue;
        }
      }

      if (!success) {
        return res.status(404).json({
          status: false,
          error: 'Gagal mengakses otakudesu, coba lain'
        });
      }

      const $ = cheerio.load(html);
      const results = [];

      // Selector otakudesu yang lebih lengkap
      $('.chiview, .col-anime, .listanime, .blok, article, .post, .entry, .item, .anime').each((i, el) => {
        const title = $(el).find('.title, h2, h3, h4, .entry-title, a').first().text().trim();
        const link = $(el).find('a').first().attr('href');
        const thumbnail = $(el).find('img').first().attr('src') || $(el).find('img').first().attr('data-src');
        const rating = $(el).find('.rating, .score, .rate').text().trim();
        const episode = $(el).find('.episode, .eps, .epz, .ep').text().trim();
        const genre = $(el).find('.genre, .genres, .category').text().trim();
        const status = $(el).find('.status, .ongoing, .completed').text().trim();
        const synopsis = $(el).find('.synopsis, .desc, .description, .excerpt').text().trim();
        const views = $(el).find('.views, .view').text().trim();
        const date = $(el).find('.date, .time').text().trim();

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
            views: views || null,
            date: date || null,
            source: 'otakudesu'
          });
        }
      });

      // Kalo gak dapet, pake selektor lain
      if (results.length === 0) {
        $('a').each((i, el) => {
          const title = $(el).text().trim();
          const link = $(el).attr('href');
          if (title && link && link.includes('/anime/')) {
            const thumbnail = $(el).find('img').attr('src') || null;
            results.push({
              title: title,
              url: link,
              thumbnail: thumbnail,
              source: 'otakudesu'
            });
          }
        });
      }

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
