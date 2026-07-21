import React, { useEffect, useState } from 'react';
import NewsCard from '../components/NewsCard';
import { Flame } from 'lucide-react';

const mockNews = [
  {
    id: 1,
    titleTa: "தமிழக பட்ஜெட் 2026: புதிய திட்டங்கள் மற்றும் முக்கிய அறிவிப்புகள் வெளியீடு!",
    category: "அரசியல்",
    views: "12.4K",
    time: "10 நிமிடங்களுக்கு முன்",
    image: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    titleTa: "சென்னை வானிலை மையம் எச்சரிக்கை: 5 மாவட்டங்களில் கனமழைக்கு வாய்ப்பு!",
    category: "வானிலை",
    views: "8.1K",
    time: "25 நிமிடங்களுக்கு முன்",
    image: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    titleTa: "நாமக்கல் மாவட்ட தொழில் முனைவோருக்கு புதிய கடனு உதவி திட்டம் தொடக்கம்.",
    category: "மாவட்ட செய்திகள்",
    views: "4.2K",
    time: "1 மணி நேரத்திற்கு முன்",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80"
  }
];

const Home = () => {
  const [articles, setArticles] = useState(mockNews);

  return (
    <div>
      {/* Breaking News Ticker Banner */}
      <div style={{
        background: 'rgba(239, 68, 68, 0.12)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '8px',
        padding: '0.6rem 0.8rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.8rem'
      }}>
        <Flame size={16} color="#EF4444" />
        <span style={{ color: '#EF4444', fontWeight: 800 }}>முக்கிய செய்தி:</span>
        <marquee style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          தமிழக பட்ஜெட் கூட்டத்தொடர் நேரலை ஒளிபரப்பு நடைபெறுகிறது!
        </marquee>
      </div>

      <h2 style={{ fontSize: '1.1rem', marginBottom: '0.85rem', color: 'var(--text-primary)' }}>
        புதிய செய்திகள் (Latest News)
      </h2>

      {articles.map(article => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  );
};

export default Home;
