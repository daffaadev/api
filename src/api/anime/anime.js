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
      
      // Step 1: Search anime
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

      const results = [];

      // Loop hasil search
      for (const anime of searchResponse.data.data) {
        const animeData = {
          mal_id: anime.mal_id,
          title: anime.title,
          thumbnail: anime.images?.jpg?.image_url || null,
          episodes: anime.episodes || 0,
          status: anime.status || null,
          synopsis: anime.synopsis || null,
          video_episodes: []
        };

        // Step 2: Get episodes list
        if (anime.episodes && anime.episodes > 0) {
          try {
            const episodeResponse = await axios.get(`https://api.jikan.moe/v4/anime/${anime.mal_id}/episodes`, {
              params: { limit: 100 },
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              },
              timeout: 30000
            });

            // Step 3: Get streaming links for each episode
            const episodes = episodeResponse.data.data || [];
            for (const ep of episodes.slice(0, 5)) { // Batasi 5 episode biar cepet
              try {
                const watchResponse = await axios.get(`https://api.consumet.org/anime/gogoanime/watch/${anime.title.toLowerCase().replace(/ /g, '-')}-episode-${ep.episode}`, {
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                  },
                  timeout: 15000
                });

                animeData.video_episodes.push({
                  episode: ep.episode,
                  title: ep.title || `Episode ${ep.episode}`,
                  sources: watchResponse.data.sources || [],
                  download: watchResponse.data.download || []
                });
              } catch (e) {
                animeData.video_episodes.push({
                  episode: ep.episode,
                  title: ep.title || `Episode ${ep.episode}`,
                  sources: [],
                  download: [],
                  error: 'Gagal ambil link'
                });
              }
            }
          } catch (e) {
            animeData.video_episodes = [];
          }
        }

        results.push(animeData);
      }

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
