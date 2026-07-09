import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Customizer from './components/Customizer';

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
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/article" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
        <Customizer />
      </div>
    </Router>
  );
}

export default App;
