import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Customizer from './components/Customizer';
import AiAssistant from './components/AiAssistant';

import Home from './pages/Home';
import Login from './pages/Login';
import Directory from './pages/Directory';
import Classifieds from './pages/Classifieds';
import Wishes from './pages/Wishes';
import Obituaries from './pages/Obituaries';
import Jobs from './pages/Jobs';
import BusinessStudies from './pages/BusinessStudies';
import ArticleDetail from './pages/ArticleDetail';
import Category from './pages/Category';
import Videos from './pages/Videos';
import WebStories from './pages/WebStories';
import AboutUs from './pages/AboutUs';
import Careers from './pages/Careers';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import ContactUs from './pages/ContactUs';
import Advertise from './pages/Advertise';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/index.html" element={<Navigate to="/" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login.html" element={<Navigate to="/login" replace />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/directory.html" element={<Navigate to="/directory" replace />} />
            <Route path="/classifieds" element={<Classifieds />} />
            <Route path="/classifieds.html" element={<Navigate to="/classifieds" replace />} />
            <Route path="/wishes" element={<Wishes />} />
            <Route path="/wishes.html" element={<Navigate to="/wishes" replace />} />
            <Route path="/obituaries" element={<Obituaries />} />
            <Route path="/obituaries.html" element={<Navigate to="/obituaries" replace />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs.html" element={<Navigate to="/jobs" replace />} />
            <Route path="/business-studies" element={<BusinessStudies />} />
            <Route path="/business-studies.html" element={<Navigate to="/business-studies" replace />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/category.html" element={<Category />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/web-stories" element={<WebStories />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/article" element={<Navigate to="/" replace />} />
            <Route path="/news/:id" element={<ArticleDetail />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/advertise" element={<Advertise />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-use" element={<TermsOfUse />} />
          </Routes>
        </main>

        <Footer />
        <Customizer />
        <AiAssistant />
      </div>
    </Router>
  );
}

export default App;
