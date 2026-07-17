const SERVER_BASE = import.meta.env.VITE_SERVER_BASE || 'http://localhost:8080';
const API_BASE = import.meta.env.VITE_API_BASE || `${SERVER_BASE}/api/v1`;

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads')) return `${SERVER_BASE}${path}`;
  return path;
};

const translateVideo = (vid, lang) => {
  if (!vid) return vid;
  const rawTitle = vid.title || '';
  const rawDesc = vid.description || '';
  let titleVal = rawTitle;
  let descVal = rawDesc;

  if (lang === 'en') {
    if (rawTitle.includes('Rain Update') || rawTitle.includes('கனமழை')) {
      titleVal = 'Rain Update in Tamil Nadu | Heavy Rain Alert in Chennai and Districts';
      descVal = 'Weather department issues heavy rain warning for next 24 hours in Chennai and surrounding districts.';
    } else if (rawTitle.includes('Gold') || rawTitle.includes('தங்கம்') || rawTitle.includes('Gold Rate')) {
      titleVal = 'Gold Rate Drops Sharply | Today\'s Gold Price details in Chennai';
      descVal = 'Good news for gold buyers as sovereign rate decreases significantly today.';
    } else if (rawTitle.includes('Vijay TVK') || rawTitle.includes('விஜய் மாநாடு') || rawTitle.includes('ஜனநாயகன்') || rawTitle.includes('விஜய்யின்')) {
      titleVal = 'Vijay\'s Jananayagan Movie Censor Board Cuts | TVK Conference Updates';
      descVal = 'Actor Vijay\'s upcoming film Jananayagan updates and debut state conference preparations of TVK in Vikravandi.';
    } else if (rawTitle.includes('IPL') || rawTitle.includes('ஐபிஎல்') || rawTitle.includes('டி20') || rawTitle.includes('ஷ்ரேயாஸ்') || rawTitle.includes('இங்கிலாந்து')) {
      titleVal = 'India vs England T20 Series | Shreyas Iyer Interview and Cricket Highlights';
      descVal = 'Catch the latest cricket analysis, match highlights, and exclusive interview of batsman Shreyas Iyer.';
    } else if (rawTitle.includes('Gaganyaan') || rawTitle.includes('ககன்யான்') || rawTitle.includes('விண்வெளி')) {
      titleVal = 'ISRO Gaganyaan Test Success | Indian Astronaut Space Mission Updates';
      descVal = 'India\'s space agency successfully tests the solid booster system for the upcoming human flight.';
    } else if (rawTitle.includes('Metro') || rawTitle.includes('சென்னை மெட்ரோ')) {
      titleVal = 'Chennai Metro Phase 2 updates | Driverless train tests began';
      descVal = 'Trial runs of driverless trainsets started between Poonamallee and Vadapalani elevated line.';
    } else if (rawTitle.includes('பட்ஜெட்')) {
      titleVal = 'Tamil Nadu Budget 2026 | Key Announcements and Live Analysis';
      descVal = 'Detailed coverage of the financial allocations and welfare projects announced in the Tamil Nadu budget session.';
    } else if (rawTitle.includes('US Presidential') || rawTitle.includes('அதிபர்') || rawTitle.includes('Elections')) {
      titleVal = 'US Presidential Elections Update | Live Status and Analysis';
      descVal = 'US Presidential election results and direct updates, featuring swing state trends and analyst debates.';
    } else if (rawTitle.includes('நேரடி செய்தி') || rawTitle.includes('Live TV') || rawTitle.includes('Puthiya Thalaimurai')) {
      titleVal = 'KINGS 24x7 Live TV News Stream | Puthiya Thalaimurai Live';
      descVal = 'Watch continuous Tamil and English live news coverage, debates and special updates.';
    } else if (rawTitle.includes('Nothing Phone 2a') || rawTitle.includes('Nothing') || rawTitle.includes('நத்திங்')) {
      titleVal = 'Nothing Phone 2a Unboxing & Review';
      descVal = 'Nothing Phone 2a unboxing and overview. We check out the design, specifications, Glyph interface, camera quality, and performance of Nothing\'s new budget smartphone.';
    }
  }

  return {
    ...vid,
    title: titleVal,
    description: descVal
  };
};

export const fetchApi = async (endpoint, options = {}) => {
  const session = JSON.parse(localStorage.getItem('king24x7_session') || 'null');
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(session && session.token ? { 'Authorization': `Bearer ${session.token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  const data = await response.json();
  const lang = localStorage.getItem('king24x7_lang') || 'en';

  if (endpoint.startsWith('/videos') && lang === 'en') {
    if (Array.isArray(data)) {
      return data.map(v => translateVideo(v, lang));
    } else if (data && typeof data === 'object') {
      return translateVideo(data, lang);
    }
  }

  return data;
};
