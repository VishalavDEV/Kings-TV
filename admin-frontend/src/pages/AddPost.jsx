import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchApi } from '../utils/fetchApi';
import AiInlineAssistant from '../components/AiInlineAssistant';
import './AddPost.css';

const HtmlToolbar = ({ targetField, setFormData }) => {
  const insertTag = (openTag, closeTag = '') => {
    const el = document.getElementById(targetField);
    if (!el) return;
    
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selected = text.substring(start, end);
    const replacement = openTag + selected + closeTag;
    
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    
    setFormData(prev => ({
      ...prev,
      [targetField]: newValue
    }));
    
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + openTag.length, start + openTag.length + selected.length);
    }, 0);
  };

  return (
    <div className="html-editor-toolbar">
      <button type="button" title="Bold" onClick={() => insertTag('<strong>', '</strong>')}>
        <i className="fa-solid fa-bold"></i>
      </button>
      <button type="button" title="Italic" onClick={() => insertTag('<em>', '</em>')}>
        <i className="fa-solid fa-italic"></i>
      </button>
      <button type="button" title="Underline" onClick={() => insertTag('<u>', '</u>')}>
        <i className="fa-solid fa-underline"></i>
      </button>
      <button type="button" title="Strikethrough" onClick={() => insertTag('<s>', '</s>')}>
        <i className="fa-solid fa-strikethrough"></i>
      </button>
      <span className="toolbar-separator">|</span>
      <button type="button" title="Align Left" onClick={() => insertTag('<div style="text-align: left">', '</div>')}>
        <i className="fa-solid fa-align-left"></i>
      </button>
      <button type="button" title="Align Center" onClick={() => insertTag('<div style="text-align: center">', '</div>')}>
        <i className="fa-solid fa-align-center"></i>
      </button>
      <button type="button" title="Align Right" onClick={() => insertTag('<div style="text-align: right">', '</div>')}>
        <i className="fa-solid fa-align-right"></i>
      </button>
      <span className="toolbar-separator">|</span>
      <button type="button" title="Bullet List" onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')}>
        <i className="fa-solid fa-list-ul"></i>
      </button>
      <button type="button" title="Numbered List" onClick={() => insertTag('<ol>\n  <li>', '</li>\n</ol>')}>
        <i className="fa-solid fa-list-ol"></i>
      </button>
      <button type="button" title="Table" onClick={() => insertTag('<table border="1">\n  <tr>\n    <th>Header 1</th>\n    <th>Header 2</th>\n  </tr>\n  <tr>\n    <td>Cell 1</td>\n    <td>Cell 2</td>\n  </tr>\n</table>')}>
        <i className="fa-solid fa-table"></i>
      </button>
      <span className="toolbar-separator">|</span>
      <button type="button" title="Heading 2" onClick={() => insertTag('<h2>', '</h2>')}>H2</button>
      <button type="button" title="Heading 3" onClick={() => insertTag('<h3>', '</h3>')}>H3</button>
      <button type="button" title="Heading 4" onClick={() => insertTag('<h4>', '</h4>')}>H4</button>
      <span className="toolbar-separator">|</span>
      <button type="button" title="Insert Link" onClick={() => {
        const url = prompt('Enter URL:');
        if (url) insertTag(`<a href="${url}" target="_blank">`, '</a>');
      }}>
        <i className="fa-solid fa-link"></i>
      </button>
      <button type="button" title="Insert Image" onClick={() => {
        const url = prompt('Enter Image URL:');
        if (url) insertTag(`<img src="${url}" alt="image" style="max-width:100%;" />`);
      }}>
        <i className="fa-solid fa-image"></i>
      </button>
    </div>
  );
};

const AddPost = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedFormat, setSelectedFormat] = useState(null); 
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
    metaTitle: '',
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
    imageUrl: '',
    featuredImageUrl: '',
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

  const [seoSuggest, setSeoSuggest] = useState(null);
  const [fetchingSeo, setFetchingSeo] = useState(false);

  const getSeoSuggestions = async () => {
    setFetchingSeo(true);
    try {
      const res = await fetchApi('/articles/suggest-seo', {
        method: 'POST',
        body: JSON.stringify({
          title: formData.title,
          content: formData.content || formData.summary
        })
      });
      if (res && !res.error) {
        setSeoSuggest(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingSeo(false);
    }
  };

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
    { id: 'page', title: 'Page', desc: 'Same shape as a static page but filed as a post', icon: 'fa-regular fa-file-code', active: true },
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('isBreaking') === 'true') {
      setFormData(prev => ({ ...prev, isBreaking: true }));
    }
  }, [location.search]);

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
      if (!formData.title || !formData.title.trim()) {
        setErrorMsg('Post Title is required.');
        setIsSubmitting(false);
        return;
      }
      if (!formData.categoryId) {
        setErrorMsg('Category is required.');
        setIsSubmitting(false);
        return;
      }
      
      let postType = 'ARTICLE';
      if (selectedFormat === 'gallery') postType = 'GALLERY';
      else if (selectedFormat === 'list') postType = 'SORTED_LIST';
      else if (selectedFormat === 'page') postType = 'PAGE';
      else if (selectedFormat === 'video') postType = 'VIDEO';
      else if (selectedFormat === 'audio') postType = 'AUDIO';
      else if (selectedFormat === 'trivia') postType = 'TRIVIA_QUIZ';
      else if (selectedFormat === 'personality') postType = 'PERSONALITY_QUIZ';

      if (['article', 'gallery', 'list', 'page'].includes(selectedFormat)) {
        if (!formData.imageUrl && !formData.featuredImageUrl) {
          setErrorMsg(`Main post image or featured image URL is required for ${selectedFormat} format.`);
          setIsSubmitting(false);
          return;
        }
      } else if (selectedFormat === 'video') {
        if (!videoData.videoUrl && !videoData.videoEmbedCode) {
          setErrorMsg('A video file/URL or video embed code is required for video format.');
          setIsSubmitting(false);
          return;
        }
      } else if (selectedFormat === 'audio') {
        const hasTrack = audioTracks.some(track => track.fileUrl && track.fileUrl.trim());
        if (!hasTrack) {
          setErrorMsg('At least one audio track URL is required for audio format.');
          setIsSubmitting(false);
          return;
        }
      } else if (['trivia', 'personality'].includes(selectedFormat)) {
        if (!quizQuestions || quizQuestions.length < 1) {
          setErrorMsg('At least one question block is required for quiz format.');
          setIsSubmitting(false);
          return;
        }
        for (let i = 0; i < quizQuestions.length; i++) {
          const q = quizQuestions[i];
          if (!q.answers || q.answers.length < 2) {
            setErrorMsg(`Question #${i + 1} requires at least 2 choice options.`);
            setIsSubmitting(false);
            return;
          }
          const hasEmptyAnswer = q.answers.some(ans => !ans.text || !ans.text.trim());
          if (hasEmptyAnswer) {
            setErrorMsg(`Please fill in all choices for Question #${i + 1}.`);
            setIsSubmitting(false);
            return;
          }
        }
      }

      const status = saveAsDraft 
        ? 'DRAFT' 
        : (formData.isScheduled && formData.scheduledAt ? 'SCHEDULED' : 'PUBLISHED');

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

                {/* Image Section (upload + alternative URL) */}
                {['article', 'gallery', 'list', 'page'].includes(selectedFormat) && (
                  <div className="form-group">
                    <label>Main Post Image *</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input
                        type="text"
                        name="imageUrl"
                        value={formData.imageUrl || ''}
                        onChange={handleInputChange}
                        placeholder="Paste image URL alternative..."
                        style={{ flexGrow: 1 }}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            const file = e.target.files[0];
                            const fData = new FormData();
                            fData.append('file', file);
                            try {
                              const token = localStorage.getItem('accessToken');
                              const response = await fetch('/api/v1/articles/upload', {
                                method: 'POST',
                                headers: {
                                  ...(token ? { Authorization: `Bearer ${token}` } : {})
                                },
                                body: fData
                              });
                              const data = await response.json();
                              if (data && data.url) {
                                setFormData(prev => ({
                                  ...prev,
                                  imageUrl: data.url,
                                  featuredImageUrl: data.url,
                                  imageAltText: data.altText || ''
                                }));
                              }
                            } catch (err) {
                              console.error('Upload failed:', err);
                            }
                          }
                        }}
                      />
                    </div>
                    {formData.imageUrl && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <img src={formData.imageUrl} alt="preview" style={{ maxWidth: '150px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        <div style={{ marginTop: '0.25rem' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: '600' }}>Image Alt Text (Generated)</label>
                          <input
                            type="text"
                            name="imageAltText"
                            value={formData.imageAltText || ''}
                            onChange={handleInputChange}
                            placeholder="e.g. Chennai Rains Floods"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: '100%', marginTop: '0.15rem' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* --- RENDER CUSTOM FIELDS BY TYPE --- */}
                
                {/* 1. ARTICLE / PAGE FORMAT */}
                {(selectedFormat === 'article' || selectedFormat === 'page') && (
                  <div className="form-group">
                    <label htmlFor="content">Content Details *</label>
                    <HtmlToolbar targetField="content" setFormData={setFormData} />
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

                <div className="form-group">
                  <label htmlFor="metaTitle">Meta SEO Title</label>
                  <input
                    type="text"
                    id="metaTitle"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    placeholder="SEO Title..."
                  />
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
                      placeholder="SEO description..."
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
                      placeholder="SEO keywords..."
                    />
                  </div>
                </div>

                <div className="seo-suggestions-panel" style={{ background: '#f8fafc', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
                      <i className="fa-solid fa-wand-magic-sparkles text-blue-500"></i> AI/Automated SEO Helper
                    </h4>
                    <button type="button" className="btn btn-secondary py-1 text-xs" onClick={getSeoSuggestions} disabled={fetchingSeo}>
                      {fetchingSeo ? 'Generating...' : 'Generate SEO Suggestions'}
                    </button>
                  </div>
                  {seoSuggest && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div className="suggestion-item" style={{ fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontWeight: '600', marginBottom: '0.15rem' }}>
                          <span>Suggested Meta Title:</span>
                          <button type="button" style={{ background: 'transparent', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700' }} onClick={() => setFormData(prev => ({ ...prev, metaTitle: seoSuggest.metaTitle }))}>
                            Use this
                          </button>
                        </div>
                        <div style={{ padding: '0.35rem 0.5rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                          {seoSuggest.metaTitle}
                        </div>
                      </div>
                      <div className="suggestion-item" style={{ fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontWeight: '600', marginBottom: '0.15rem' }}>
                          <span>Suggested Description:</span>
                          <button type="button" style={{ background: 'transparent', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700' }} onClick={() => setFormData(prev => ({ ...prev, metaDescription: seoSuggest.metaDescription }))}>
                            Use this
                          </button>
                        </div>
                        <div style={{ padding: '0.35rem 0.5rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                          {seoSuggest.metaDescription}
                        </div>
                      </div>
                      <div className="suggestion-item" style={{ fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontWeight: '600', marginBottom: '0.15rem' }}>
                          <span>Suggested Keywords:</span>
                          <button type="button" style={{ background: 'transparent', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700' }} onClick={() => setFormData(prev => ({ ...prev, metaKeywords: seoSuggest.metaKeywords }))}>
                            Use this
                          </button>
                        </div>
                        <div style={{ padding: '0.35rem 0.5rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                          {seoSuggest.metaKeywords}
                        </div>
                      </div>
                    </div>
                  )}
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
                <div className="mb-4">
                  <AiInlineAssistant
                    draftContent={formData.content}
                    onApplyHeadline={(hl) => setFormData(prev => ({ ...prev, title: hl }))}
                    onApplyTags={(tagsStr) => setTags(tagsStr.split(',').map(t => t.trim()))}
                  />
                </div>
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
