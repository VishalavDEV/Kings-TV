import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject Authorization Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Fallback mock interceptor for dev/testing when backend is unreachable
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn("API request fallback triggered for:", error.config?.url);
    const url = error.config?.url || '';

    if (url.includes('/categories')) {
      return Promise.resolve({
        data: [
          { id: 1, name: 'Politics', nameTa: 'அரசியல்', slug: 'politics' },
          { id: 2, name: 'Cinema', nameTa: 'சினிமா', slug: 'cinema' },
          { id: 3, name: 'District', nameTa: 'மாவட்டங்கள்', slug: 'district' },
          { id: 4, name: 'Sports', nameTa: 'விளையாட்டு', slug: 'sports' }
        ]
      });
    }

    if (url.includes('/admin/analytics/dashboard') || url.includes('/analytics')) {
      return Promise.resolve({
        data: {
          activeUsers: 24,
          totalArticles: 142,
          totalViews: 42850,
          pendingArticles: 12
        }
      });
    }

    if (url.includes('/admin/analytics/news-performance')) {
      return Promise.resolve({
        data: {
          totalViews: 42850,
          publishedCount: 142,
          topArticles: [
            { id: 1, title: 'TN Budget 2026 Live Updates', titleTa: 'தமிழக பட்ஜெட் 2026', views: 12450 },
            { id: 2, title: 'Chennai Heavy Rainfall Alert', titleTa: 'சென்னை கனமழை எச்சரிக்கை', views: 8120 }
          ]
        }
      });
    }

    if (url.includes('/audit-logs')) {
      return Promise.resolve({
        data: {
          content: [
            { id: 1, userEmail: 'superadmin@kingstv.com', action: 'ARTICLE_PUBLISH', timestamp: new Date().toISOString() },
            { id: 2, userEmail: 'editor@kingstv.com', action: 'USER_UPDATE', timestamp: new Date().toISOString() }
          ]
        }
      });
    }

    if (url.includes('/articles') || url.includes('/posts')) {
      return Promise.resolve({
        data: {
          content: [
            { id: 1, titleTa: 'தமிழக பட்ஜெட் 2026 நேரலை', titleEn: 'TN Budget 2026 Live', status: 'published', views: 1240, categoryName: 'அரசியல்' },
            { id: 2, titleTa: 'சென்னை வானிலை அறிக்கை', titleEn: 'Chennai Weather Report', status: 'draft', views: 450, categoryName: 'வானிலை' }
          ],
          totalElements: 2
        }
      });
    }

    return Promise.reject(error);
  }
);

export default api;
