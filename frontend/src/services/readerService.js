const PUBLIC_API_BASE = 'http://localhost:8080/api/public';

export const readerService = {
  async googleAuth(email, name, googleId) {
    const res = await fetch(`${PUBLIC_API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, googleId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Google Auth failed');
    }
    return res.json();
  },

  async getProfile(token) {
    const res = await fetch(`${PUBLIC_API_BASE}/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to fetch reader profile');
    }
    return res.json();
  },

  async updateProfile(token, { preferredLocation, preferredCategories, name }) {
    const res = await fetch(`${PUBLIC_API_BASE}/me/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ preferredLocation, preferredCategories, name })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update reader preferences');
    }
    return res.json();
  },

  async submitStory(token, { title, content, imageUrl, categoryId, districtId }) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${PUBLIC_API_BASE}/submissions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ title, content, imageUrl, categoryId, districtId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to submit story');
    }
    return res.json();
  },

  async getPersonalizedFeed(token) {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${PUBLIC_API_BASE}/me/feed`, { headers });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to fetch personalized feed');
    }
    return res.json();
  }
};
