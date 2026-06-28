// FILE 1: search anime
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
      
      const response = await axios.get(`https://api.jikan.moe/v4/anime`, {
        params: {
          q: query,
          page: 1,
          limit: 20
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });

      const data = response.data;
      const results = [];

      if (data.data) {
        data.data.forEach((item) => {
          results.push({
            mal_id: item.mal_id,
            title: item.title,
            title_english: item.title_english || null,
            title_japanese: item.title_japanese || null,
            url: item.url,
            thumbnail: item.images?.jpg?.image_url || null,
            rating: item.score || null,
            episodes: item.episodes || null,
            status: item.status || null,
            genres: item.genres?.map(g => g.name) || [],
            synopsis: item.synopsis || null,
            type: item.type || null,
            year: item.year || null,
            season: item.season || null,
            trailer: item.trailer?.url || null,
            duration: item.duration || null,
            source: 'MyAnimeList (Jikan API)'
          });
        });
      }

      return res.json({
        status: true,
        result: {
          query: query,
          total_results: data.pagination?.items?.total || 0,
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

// FILE 2: list episode
module.exports = (app) => {
  app.get('/api/anime/episodes/:id', async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          status: false,
          error: 'Parameter ID wajib diisi'
        });
      }

      const axios = require('axios');
      
      const response = await axios.get(`https://api.jikan.moe/v4/anime/${id}/episodes`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });

      const data = response.data;
      const episodes = [];

      if (data.data) {
        data.data.forEach((item) => {
          episodes.push({
            episode_id: item.mal_id,
            title: item.title,
            title_japanese: item.title_japanese || null,
            title_romanji: item.title_romanji || null,
            episode: item.episode,
            aired: item.aired,
            score: item.score || null,
            filler: item.filler || false,
            recap: item.recap || false,
            synopsis: item.synopsis || null
          });
        });
      }

      return res.json({
        status: true,
        result: {
          anime_id: id,
          total_episodes: data.pagination?.items?.total || 0,
          episodes: episodes
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

// FILE 3: streaming
module.exports = (app) => {
  app.get('/api/anime/watch/:id/:episode', async (req, res) => {
    try {
      const { id, episode } = req.params;

      if (!id || !episode) {
        return res.status(400).json({
          status: false,
          error: 'Parameter ID dan episode wajib diisi'
        });
      }

      const axios = require('axios');
      
      const response = await axios.get(`https://api.consumet.org/anime/gogoanime/watch/${id}-episode-${episode}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });

      return res.json({
        status: true,
        result: {
          anime_id: id,
          episode: episode,
          sources: response.data.sources || [],
          download: response.data.download || []
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
