import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../../utils/api';
import './AddPost.css';

const AddPost = () => {
  const navigate = useNavigate();
  const [selectedFormat, setSelectedFormat] = useState(null); // 'article', 'gallery', 'list', 'video', 'audio', 'trivia', 'personality'
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Core metadata fields
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    metaDescription: '',
    metaKeywords: '',
    visibility: true,
    showRightColumn: true,
    isFeatured: false,
    isBreaking: false,
    isSlider: false,
    isRecommended: false,
    showOnlyRegistered: false,
    optionalUrl: '',
    content: '',
    language: 'ta',
    categoryId: '',
    subcategoryId: '',
    isScheduled: false,
    scheduledAt: ''
  });

  // Type specific state definitions
  const [galleryImages, setGalleryImages] = useState([{ url: '', caption: '' }]);
  
  const [sortedListItems, setSortedListItems] = useState([{ title: '', imageUrl: '', content: '' }]);
  
  const [videoData, setVideoData] = useState({
    videoUrl: '',
    videoEmbedCode: '',
    videoThumbnailUrl: '',
    activeTab: 'url' // 'url' or 'upload'
  });

  const [audioTracks, setAudioTracks] = useState([{ title: '', fileUrl: '' }]);

  // Quiz States
  const [quizResults, setQuizResults] = useState([{ rangeMin: 0, rangeMax: 10, title: '', imageUrl: '', description: '' }]);
  const [quizQuestions, setQuizQuestions] = useState([{
    questionText: '',
    imageUrl: '',
    description: '',
    answers: [{ text: '', isCorrect: true, resultIndex: 0 }, { text: '', isCorrect: false, resultIndex: 0 }],
    displayFormat: 'list'
  }]);

  const formats = [
    { id: 'article', title: 'Article', desc: 'Standard news story or blog post with rich text and images', icon: 'fa-regular fa-file-lines', active: true },
    { id: 'gallery', title: 'Gallery', desc: 'Collection of images with captions and layouts', icon: 'fa-regular fa-image', active: true },
    { id: 'list', title: 'Sorted List', desc: 'Ranked list posts or itemized checklists', icon: 'fa-solid fa-list-ol', active: true },
    { id: 'video', title: 'Video', desc: 'Embed media contents or upload video stories', icon: 'fa-regular fa-circle-play', active: true },
    { id: 'audio', title: 'Audio', desc: 'Podcasts or audio playlist narrations', icon: 'fa-solid fa-microphone', active: true },
    { id: 'trivia', title: 'Trivia Quiz', desc: 'Questions with right/wrong answers to challenge readers', icon: 'fa-regular fa-circle-question', active: true },
    { id: 'personality', title: 'Personality Quiz', desc: 'Custom outcomes based on reader selections', icon: 'fa-solid fa-person', active: true }
  ];

  useEffect(() => {
    if (selectedFormat) {
      const loadCategoriesData = async () => {
        try {
          const [cats, subs] = await Promise.all([
            fetchApi('/admin/categories'),
            fetchApi('/admin/subcategories')
          ]);
          if (Array.isArray(cats)) {
            setCategories(cats);
            if (cats.length > 0) {
              setFormData(prev => ({ ...prev, categoryId: cats[0].id }));
            }
          }
          if (Array.isArray(subs)) {
            setSubcategories(subs);
          }
        } catch (err) {
          console.error('Failed to load categories/subcategories', err);
        }
      };
      loadCategoriesData();
    }
  }, [selectedFormat]);

  useEffect(() => {
    if (formData.categoryId) {
      const filtered = subcategories.filter(
        sub => String(sub.parentCategoryId || sub.categoryId) === String(formData.categoryId)
      );
      setFilteredSubcategories(filtered);
      setFormData(prev => ({
        ...prev,
        subcategoryId: filtered.length > 0 ? filtered[0].subcategoryId || filtered[0].id : ''
      }));
    } else {
      setFilteredSubcategories([]);
      setFormData(prev => ({ ...prev, subcategoryId: '' }));
    }
  }, [formData.categoryId, subcategories]);

  const handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setFormData(prev => ({ ...prev, title, slug }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (!tags.includes(tag)) {
        setTags([...tags, tag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  // Reordering helpers
  const moveItem = (list, setList, index, direction) => {
    const newList = [...list];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newList.length) return;
    const temp = newList[index];
    newList[index] = newList[targetIdx];
    newList[targetIdx] = temp;
    setList(newList);
  };

  // Form submission packaging
  const handleSubmit = async (e, saveAsDraft = false) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const status = saveAsDraft 
        ? 'DRAFT' 
        : (formData.isScheduled && formData.scheduledAt ? 'SCHEDULED' : 'PUBLISHED');

      let postType = 'ARTICLE';
      if (selectedFormat === 'gallery') postType = 'GALLERY';
      else if (selectedFormat === 'list') postType = 'SORTED_LIST';
      else if (selectedFormat === 'video') postType = 'VIDEO';
      else if (selectedFormat === 'audio') postType = 'AUDIO';
      else if (selectedFormat === 'trivia') postType = 'TRIVIA_QUIZ';
      else if (selectedFormat === 'personality') postType = 'PERSONALITY_QUIZ';

      const payload = {
        ...formData,
        status,
        postType,
        tags: JSON.stringify(tags),
        categoryId: formData.categoryId ? parseInt(formData.categoryId, 10) : null,
        subcategoryId: formData.subcategoryId ? parseInt(formData.subcategoryId, 10) : null,
        scheduledAt: formData.isScheduled && formData.scheduledAt ? formData.scheduledAt : null,

        // Format specific JSON payloads
        galleryImages: postType === 'GALLERY' ? JSON.stringify(galleryImages) : null,
        sortedListItems: postType === 'SORTED_LIST' ? JSON.stringify(sortedListItems) : null,
        videoUrl: postType === 'VIDEO' ? videoData.videoUrl : null,
        videoEmbedCode: postType === 'VIDEO' ? videoData.videoEmbedCode : null,
        videoThumbnailUrl: postType === 'VIDEO' ? videoData.videoThumbnailUrl : null,
        audioTracks: postType === 'AUDIO' ? JSON.stringify(audioTracks) : null,
        quizQuestions: (postType === 'TRIVIA_QUIZ' || postType === 'PERSONALITY_QUIZ') ? JSON.stringify(quizQuestions) : null,
        quizResults: (postType === 'TRIVIA_QUIZ' || postType === 'PERSONALITY_QUIZ') ? JSON.stringify(quizResults) : null
      };

      const res = await fetchApi('/admin/articles', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res && res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(saveAsDraft ? 'Draft saved successfully!' : 'Post published successfully!');
        setTimeout(() => {
          navigate('/posts');
        }, 1500);
      }
    } catch (err) {
      if (err.status === 409) {
        setErrorMsg('An article with this title already exists for the selected language.');
      } else {
        setErrorMsg(err.message || 'Failed to save post.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-post-container">
      {!selectedFormat ? (
        <div className="choose-format-container">
          <h1>Choose a Post Format</h1>
          <p className="subtitle">Select the format that best fits your story content</p>
          
          <div className="formats-grid">
            {formats.map((fmt) => (
              <div 
                key={fmt.id} 
                className={`format-card ${fmt.active ? 'active' : 'disabled'}`}
                onClick={() => fmt.active && setSelectedFormat(fmt.id)}
              >
                <div className="format-icon">
                  <i className={fmt.icon}></i>
                </div>
                <div className="format-details">
                  <h3>{fmt.title}</h3>
                  <p>{fmt.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="add-post-header">
            <button className="back-btn" onClick={() => setSelectedFormat(null)}>
              <i className="fa-solid fa-arrow-left"></i> Change Format
            </button>
            <h1>Create New {selectedFormat.toUpperCase()} Post</h1>
          </div>

          {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
          {successMsg && <div className="alert-banner success">{successMsg}</div>}

          <form onSubmit={(e) => handleSubmit(e, false)} className="post-edit-form">
            <div className="editor-main-layout">
              {/* Left Column Body */}
              <div className="editor-body">
                {/* Core Title / Slug Block */}
                <div className="form-group">
                  <label htmlFor="title">Post Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="e.g. Breaking Update Headline"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="slug">Slug</label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="breaking-headline"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="summary">Summary / Lead Paragraph *</label>
                  <textarea
                    id="summary"
                    name="summary"
                    rows="3"
                    value={formData.summary}
                    onChange={handleInputChange}
                    placeholder="Brief outline lead paragraph summary..."
                    required
                  />
                </div>

                {/* --- RENDER CUSTOM FIELDS BY TYPE --- */}
                
                {/* 1. ARTICLE FORMAT */}
                {selectedFormat === 'article' && (
                  <div className="form-group">
                    <label htmlFor="content">Content Details *</label>
                    <textarea
                      id="content"
                      name="content"
                      rows="12"
                      value={formData.content}
                      onChange={handleInputChange}
                      placeholder="Write your story details..."
                      required
                    />
                  </div>
                )}

                {/* 2. GALLERY FORMAT */}
                {selectedFormat === 'gallery' && (
                  <div className="format-special-block">
                    <h2>Gallery Images Payload</h2>
                    {galleryImages.map((img, idx) => (
                      <div key={idx} className="repeatable-item-card">
                        <div className="card-header-actions">
                          <span>Image #{idx + 1}</span>
                          <div className="flex gap-1">
                            <button type="button" className="mini-action" onClick={() => moveItem(galleryImages, setGalleryImages, idx, -1)}><i className="fa-solid fa-arrow-up"></i></button>
                            <button type="button" className="mini-action" onClick={() => moveItem(galleryImages, setGalleryImages, idx, 1)}><i className="fa-solid fa-arrow-down"></i></button>
                            <button type="button" className="mini-action danger" onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== idx))}><i className="fa-solid fa-trash"></i></button>
                          </div>
                        </div>
                        <div className="form-group mt-2">
                          <label>Image Source URL *</label>
                          <input
                            type="text"
                            value={img.url}
                            onChange={(e) => {
                              const newImgs = [...galleryImages];
                              newImgs[idx].url = e.target.value;
                              setGalleryImages(newImgs);
                            }}
                            placeholder="https://example.com/image.jpg"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Caption text</label>
                          <input
                            type="text"
                            value={img.caption}
                            onChange={(e) => {
                              const newImgs = [...galleryImages];
                              newImgs[idx].caption = e.target.value;
                              setGalleryImages(newImgs);
                            }}
                            placeholder="Image caption details..."
                          />
                        </div>
                      </div>
                    ))}
                    <button type="button" className="btn btn-secondary w-full" onClick={() => setGalleryImages([...galleryImages, { url: '', caption: '' }])}>
                      <i className="fa-solid fa-plus"></i> Add New Gallery Image
                    </button>
                  </div>
                )}

                {/* 3. SORTED LIST FORMAT */}
                {selectedFormat === 'list' && (
                  <div className="format-special-block">
                    <h2>Sorted List Items</h2>
                    {sortedListItems.map((item, idx) => (
                      <div key={idx} className="repeatable-item-card">
                        <div className="card-header-actions">
                          <span>List Item #{idx + 1}</span>
                          <div className="flex gap-1">
                            <button type="button" className="mini-action" onClick={() => moveItem(sortedListItems, setSortedListItems, idx, -1)}><i className="fa-solid fa-arrow-up"></i></button>
                            <button type="button" className="mini-action" onClick={() => moveItem(sortedListItems, setSortedListItems, idx, 1)}><i className="fa-solid fa-arrow-down"></i></button>
                            <button type="button" className="mini-action danger" onClick={() => setSortedListItems(sortedListItems.filter((_, i) => i !== idx))}><i className="fa-solid fa-trash"></i></button>
                          </div>
                        </div>
                        <div className="form-group mt-2">
                          <label>Item Title *</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const newList = [...sortedListItems];
                              newList[idx].title = e.target.value;
                              setSortedListItems(newList);
                            }}
                            placeholder="Item Title Headline..."
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Item Image URL</label>
                          <input
                            type="text"
                            value={item.imageUrl}
                            onChange={(e) => {
                              const newList = [...sortedListItems];
                              newList[idx].imageUrl = e.target.value;
                              setSortedListItems(newList);
                            }}
                            placeholder="https://example.com/item.jpg"
                          />
                        </div>
                        <div className="form-group">
                          <label>Description Details (Content)</label>
                          <textarea
                            rows="3"
                            value={item.content}
                            onChange={(e) => {
                              const newList = [...sortedListItems];
                              newList[idx].content = e.target.value;
                              setSortedListItems(newList);
                            }}
                            placeholder="Item descriptions..."
                          />
                        </div>
                      </div>
                    ))}
                    <button type="button" className="btn btn-secondary w-full" onClick={() => setSortedListItems([...sortedListItems, { title: '', imageUrl: '', content: '' }])}>
                      <i className="fa-solid fa-plus"></i> Add New List Item
                    </button>
                  </div>
                )}

                {/* 4. VIDEO FORMAT */}
                {selectedFormat === 'video' && (
                  <div className="format-special-block">
                    <h2>Video Embedding Options</h2>
                    <div className="tab-control-bar">
                      <button 
                        type="button" 
                        className={`tab-btn ${videoData.activeTab === 'url' ? 'active' : ''}`}
                        onClick={() => setVideoData(prev => ({ ...prev, activeTab: 'url' }))}
                      >
                        Embed Video URL
                      </button>
                      <button 
                        type="button" 
                        className={`tab-btn ${videoData.activeTab === 'upload' ? 'active' : ''}`}
                        onClick={() => setVideoData(prev => ({ ...prev, activeTab: 'upload' }))}
                      >
                        Upload Video Details
                      </button>
                    </div>

                    <div className="form-group mt-3">
                      <label>Video Platform Link / File URL *</label>
                      <input
                        type="text"
                        value={videoData.videoUrl}
                        onChange={(e) => setVideoData(prev => ({ ...prev, videoUrl: e.target.value }))}
                        placeholder={videoData.activeTab === 'url' ? "e.g. https://www.youtube.com/watch?v=..." : "Local storage path or upload file URL..."}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Video Embed IFrame Code (Optional)</label>
                      <textarea
                        rows="3"
                        value={videoData.videoEmbedCode}
                        onChange={(e) => setVideoData(prev => ({ ...prev, videoEmbedCode: e.target.value }))}
                        placeholder="<iframe width='560' height='315' src='https://www.youtube.com/embed/...' ...></iframe>"
                      />
                    </div>

                    <div className="form-group">
                      <label>Custom Thumbnail URL</label>
                      <input
                        type="text"
                        value={videoData.videoThumbnailUrl}
                        onChange={(e) => setVideoData(prev => ({ ...prev, videoThumbnailUrl: e.target.value }))}
                        placeholder="https://example.com/thumbnail.jpg"
                      />
                    </div>
                  </div>
                )}

                {/* 5. AUDIO FORMAT */}
                {selectedFormat === 'audio' && (
                  <div className="format-special-block">
                    <h2>Multi-track Playlist Audio</h2>
                    {audioTracks.map((track, idx) => (
                      <div key={idx} className="repeatable-item-card">
                        <div className="card-header-actions">
                          <span>Audio Track #{idx + 1}</span>
                          <div className="flex gap-1">
                            <button type="button" className="mini-action" onClick={() => moveItem(audioTracks, setAudioTracks, idx, -1)}><i className="fa-solid fa-arrow-up"></i></button>
                            <button type="button" className="mini-action" onClick={() => moveItem(audioTracks, setAudioTracks, idx, 1)}><i className="fa-solid fa-arrow-down"></i></button>
                            <button type="button" className="mini-action danger" onClick={() => setAudioTracks(audioTracks.filter((_, i) => i !== idx))}><i className="fa-solid fa-trash"></i></button>
                          </div>
                        </div>
                        <div className="form-group mt-2">
                          <label>Track Title *</label>
                          <input
                            type="text"
                            value={track.title}
                            onChange={(e) => {
                              const newTracks = [...audioTracks];
                              newTracks[idx].title = e.target.value;
                              setAudioTracks(newTracks);
                            }}
                            placeholder="Track Title..."
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Audio File URL *</label>
                          <input
                            type="text"
                            value={track.fileUrl}
                            onChange={(e) => {
                              const newTracks = [...audioTracks];
                              newTracks[idx].fileUrl = e.target.value;
                              setAudioTracks(newTracks);
                            }}
                            placeholder="https://example.com/track.mp3"
                            required
                          />
                        </div>
                      </div>
                    ))}
                    <button type="button" className="btn btn-secondary w-full" onClick={() => setAudioTracks([...audioTracks, { title: '', fileUrl: '' }])}>
                      <i className="fa-solid fa-plus"></i> Add New Track
                    </button>
                  </div>
                )}

                {/* 6. QUIZ FORMATS (TRIVIA / PERSONALITY) */}
                {(selectedFormat === 'trivia' || selectedFormat === 'personality') && (
                  <div className="format-special-block">
                    <h2>Quiz Outcomes / Results Cards</h2>
                    {quizResults.map((res, idx) => (
                      <div key={idx} className="repeatable-item-card">
                        <div className="card-header-actions">
                          <span>Outcome Card #{idx + 1}</span>
                          <button type="button" className="mini-action danger" onClick={() => setQuizResults(quizResults.filter((_, i) => i !== idx))}><i className="fa-solid fa-trash"></i></button>
                        </div>
                        <div className="form-row">
                          {selectedFormat === 'trivia' && (
                            <div className="form-group third">
                              <label>Min Score *</label>
                              <input 
                                type="number" 
                                value={res.rangeMin} 
                                onChange={(e) => {
                                  const newResults = [...quizResults];
                                  newResults[idx].rangeMin = parseInt(e.target.value, 10) || 0;
                                  setQuizResults(newResults);
                                }}
                              />
                            </div>
                          )}
                          {selectedFormat === 'trivia' && (
                            <div className="form-group third">
                              <label>Max Score *</label>
                              <input 
                                type="number" 
                                value={res.rangeMax} 
                                onChange={(e) => {
                                  const newResults = [...quizResults];
                                  newResults[idx].rangeMax = parseInt(e.target.value, 10) || 0;
                                  setQuizResults(newResults);
                                }}
                              />
                            </div>
                          )}
                          <div className={`form-group ${selectedFormat === 'trivia' ? 'third' : 'full'}`}>
                            <label>Result Card Title *</label>
                            <input
                              type="text"
                              value={res.title}
                              onChange={(e) => {
                                const newResults = [...quizResults];
                                newResults[idx].title = e.target.value;
                                setQuizResults(newResults);
                              }}
                              placeholder="e.g. Master Chef!"
                              required
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Result Image URL</label>
                          <input
                            type="text"
                            value={res.imageUrl}
                            onChange={(e) => {
                              const newResults = [...quizResults];
                              newResults[idx].imageUrl = e.target.value;
                              setQuizResults(newResults);
                            }}
                            placeholder="https://example.com/result.jpg"
                          />
                        </div>
                        <div className="form-group">
                          <label>Outcome Description</label>
                          <textarea
                            rows="2"
                            value={res.description}
                            onChange={(e) => {
                              const newResults = [...quizResults];
                              newResults[idx].description = e.target.value;
                              setQuizResults(newResults);
                            }}
                            placeholder="Outcome descriptions for scored result..."
                          />
                        </div>
                      </div>
                    ))}
                    <button type="button" className="btn btn-secondary w-full mb-4" onClick={() => setQuizResults([...quizResults, { rangeMin: 0, rangeMax: 10, title: '', imageUrl: '', description: '' }])}>
                      <i className="fa-solid fa-plus"></i> Add Outcome Card
                    </button>

                    <h2>Quiz Questions & Answers</h2>
                    {quizQuestions.map((q, idx) => (
                      <div key={idx} className="repeatable-item-card relative border-blue">
                        <div className="card-header-actions">
                          <strong>Question #{idx + 1}</strong>
                          <button type="button" className="mini-action danger" onClick={() => setQuizQuestions(quizQuestions.filter((_, i) => i !== idx))}><i className="fa-solid fa-trash"></i></button>
                        </div>
                        
                        <div className="form-group mt-2">
                          <label>Question text *</label>
                          <input
                            type="text"
                            value={q.questionText}
                            onChange={(e) => {
                              const newQs = [...quizQuestions];
                              newQs[idx].questionText = e.target.value;
                              setQuizQuestions(newQs);
                            }}
                            placeholder="Write quiz question here..."
                            required
                          />
                        </div>

                        <div className="form-row">
                          <div className="form-group half">
                            <label>Question Image URL</label>
                            <input
                              type="text"
                              value={q.imageUrl}
                              onChange={(e) => {
                                const newQs = [...quizQuestions];
                                newQs[idx].imageUrl = e.target.value;
                                setQuizQuestions(newQs);
                              }}
                              placeholder="https://example.com/q-image.jpg"
                            />
                          </div>
                          <div className="form-group half">
                            <label>Display Format</label>
                            <select
                              value={q.displayFormat}
                              onChange={(e) => {
                                const newQs = [...quizQuestions];
                                newQs[idx].displayFormat = e.target.value;
                                setQuizQuestions(newQs);
                              }}
                            >
                              <option value="list">List Column Layout</option>
                              <option value="grid">Grid (Thumbnail Images)</option>
                              <option value="2-col">2 Columns Layout</option>
                            </select>
                          </div>
                        </div>

                        <div className="quiz-answers-block mt-3">
                          <h4>Answer Choice Settings:</h4>
                          {q.answers.map((ans, ansIdx) => (
                            <div key={ansIdx} className="answer-choice-row">
                              <input
                                type="text"
                                value={ans.text}
                                onChange={(e) => {
                                  const newQs = [...quizQuestions];
                                  newQs[idx].answers[ansIdx].text = e.target.value;
                                  setQuizQuestions(newQs);
                                }}
                                placeholder={`Choice Option #${ansIdx + 1}`}
                                required
                              />
                              
                              {/* Scored vs Outcomes mapper */}
                              {selectedFormat === 'trivia' ? (
                                <label className="answer-check-label">
                                  <input
                                    type="checkbox"
                                    checked={ans.isCorrect}
                                    onChange={(e) => {
                                      const newQs = [...quizQuestions];
                                      newQs[idx].answers = newQs[idx].answers.map((a, i) => ({
                                        ...a,
                                        isCorrect: i === ansIdx ? e.target.checked : false
                                      }));
                                      setQuizQuestions(newQs);
                                    }}
                                  />
                                  Correct
                                </label>
                              ) : (
                                <select
                                  value={ans.resultIndex}
                                  onChange={(e) => {
                                    const newQs = [...quizQuestions];
                                    newQs[idx].answers[ansIdx].resultIndex = parseInt(e.target.value, 10) || 0;
                                    setQuizQuestions(newQs);
                                  }}
                                  title="Map Choice to Personality Outcome Card"
                                  className="w-40 px-2 py-1.5 border border-gray-300 rounded text-sm"
                                >
                                  {quizResults.map((res, rIdx) => (
                                    <option key={rIdx} value={rIdx}>
                                      Maps to Outcome #{rIdx + 1}
                                    </option>
                                  ))}
                                </select>
                              )}
                              
                              <button 
                                type="button" 
                                className="choice-del-btn"
                                onClick={() => {
                                  const newQs = [...quizQuestions];
                                  newQs[idx].answers = newQs[idx].answers.filter((_, i) => i !== ansIdx);
                                  setQuizQuestions(newQs);
                                }}
                                title="Remove Choice Option"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                          <button 
                            type="button" 
                            className="btn btn-secondary py-1 text-xs mt-1" 
                            onClick={() => {
                              const newQs = [...quizQuestions];
                              newQs[idx].answers.push({ text: '', isCorrect: false, resultIndex: 0 });
                              setQuizQuestions(newQs);
                            }}
                          >
                            + Add Choice Option
                          </button>
                        </div>
                      </div>
                    ))}
                    <button type="button" className="btn btn-secondary w-full" onClick={() => setQuizQuestions([...quizQuestions, {
                      questionText: '',
                      imageUrl: '',
                      description: '',
                      answers: [{ text: '', isCorrect: true, resultIndex: 0 }, { text: '', isCorrect: false, resultIndex: 0 }],
                      displayFormat: 'list'
                    }])}>
                      <i className="fa-solid fa-plus"></i> Add New Question
                    </button>
                  </div>
                )}

                {/* Tags and SEO keywords */}
                <div className="form-group mt-4">
                  <label>Tags (Press Enter to Add)</label>
                  <div className="tags-chip-input">
                    {tags.map((tag, idx) => (
                      <span key={idx} className="tag-chip">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(idx)}>&times;</button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder={tags.length === 0 ? "Add tag labels..." : ""}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group half">
                    <label htmlFor="metaDescription">Meta SEO Description</label>
                    <input
                      type="text"
                      id="metaDescription"
                      name="metaDescription"
                      value={formData.metaDescription}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group half">
                    <label htmlFor="metaKeywords">Meta Keywords</label>
                    <input
                      type="text"
                      id="metaKeywords"
                      name="metaKeywords"
                      value={formData.metaKeywords}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="optionalUrl">Optional Source / Link URL</label>
                  <input
                    type="text"
                    id="optionalUrl"
                    name="optionalUrl"
                    value={formData.optionalUrl}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Right Sidebar Column */}
              <div className="editor-sidebar">
                <div className="sidebar-card">
                  <h3>Publishing Details</h3>
                  
                  <div className="form-group">
                    <label htmlFor="language">Language</label>
                    <select id="language" name="language" value={formData.language} onChange={handleInputChange}>
                      <option value="ta">Tamil (தமிழ்)</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="categoryId">Category *</label>
                    <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleInputChange} required>
                      <option value="">Select Category...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subcategoryId">Subcategory</label>
                    <select id="subcategoryId" name="subcategoryId" value={formData.subcategoryId} onChange={handleInputChange}>
                      <option value="">Select Subcategory...</option>
                      {filteredSubcategories.map(s => <option key={s.subcategoryId || s.id} value={s.subcategoryId || s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="sidebar-card">
                  <h3>Featured Settings</h3>
                  <div className="toggle-list">
                    <label className="toggle-item">
                      <input type="checkbox" name="isSlider" checked={formData.isSlider} onChange={handleInputChange} />
                      <span>Slider Showcase Carousel</span>
                    </label>
                    <label className="toggle-item">
                      <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} />
                      <span>Featured Post Badge</span>
                    </label>
                    <label className="toggle-item">
                      <input type="checkbox" name="isBreaking" checked={formData.isBreaking} onChange={handleInputChange} />
                      <span>Breaking News Alert</span>
                    </label>
                    <label className="toggle-item">
                      <input type="checkbox" name="isRecommended" checked={formData.isRecommended} onChange={handleInputChange} />
                      <span>Recommended Showcase</span>
                    </label>
                    <label className="toggle-item">
                      <input type="checkbox" name="showOnlyRegistered" checked={formData.showOnlyRegistered} onChange={handleInputChange} />
                      <span>Show Only to Registered Users</span>
                    </label>
                    <label className="toggle-item">
                      <input type="checkbox" name="visibility" checked={formData.visibility} onChange={handleInputChange} />
                      <span>Visible (Show / Hide)</span>
                    </label>
                    <label className="toggle-item">
                      <input type="checkbox" name="showRightColumn" checked={formData.showRightColumn} onChange={handleInputChange} />
                      <span>Show Sidebar Right Column</span>
                    </label>
                  </div>
                </div>

                <div className="sidebar-card">
                  <h3>Downloadable Attachments / Files</h3>
                  <div className="form-group">
                    <label htmlFor="files">File URLs (one per line)</label>
                    <textarea
                      id="files"
                      name="files"
                      rows="3"
                      value={formData.files || ''}
                      onChange={handleInputChange}
                      placeholder="https://example.com/document1.pdf&#10;https://example.com/document2.zip"
                    />
                  </div>
                </div>

                <div className="sidebar-card">
                  <h3>Schedule Publishing</h3>
                  <label className="toggle-item mb-2">
                    <input type="checkbox" name="isScheduled" checked={formData.isScheduled} onChange={handleInputChange} />
                    <span>Enable Schedule Posting</span>
                  </label>

                  {formData.isScheduled && (
                    <div className="form-group mt-2">
                      <label htmlFor="scheduledAt">Schedule Launch Date & Time</label>
                      <input
                        type="datetime-local"
                        id="scheduledAt"
                        name="scheduledAt"
                        value={formData.scheduledAt}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="sidebar-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary w-full mb-2" 
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={isSubmitting}
                  >
                    Save as Draft
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary w-full"
                    disabled={isSubmitting}
                  >
                    {formData.isScheduled ? 'Schedule Posting' : 'Submit & Publish'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddPost;
