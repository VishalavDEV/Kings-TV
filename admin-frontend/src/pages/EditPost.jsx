import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { fetchApi } from '../utils/fetchApi';
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

const EditPost = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [selectedFormat, setSelectedFormat] = useState('article');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

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
    activeTab: 'url'
  });
  const [audioTracks, setAudioTracks] = useState([{ title: '', fileUrl: '' }]);
  const [quizResults, setQuizResults] = useState([{ rangeMin: 0, rangeMax: 10, title: '', imageUrl: '', description: '' }]);
  const [quizQuestions, setQuizQuestions] = useState([{
    questionText: '',
    imageUrl: '',
    description: '',
    answers: [{ text: '', isCorrect: true, resultIndex: 0 }, { text: '', isCorrect: false, resultIndex: 0 }],
    displayFormat: 'list'
  }]);

  const loadArticleDetails = async () => {
    setLoading(true);
    try {
      const [cats, subs] = await Promise.all([
        fetchApi('/admin/categories'),
        fetchApi('/admin/subcategories')
      ]);
      if (Array.isArray(cats)) setCategories(cats);
      if (Array.isArray(subs)) setSubcategories(subs);

      let articleData = location.state?.article;
      if (!articleData) {
        articleData = await fetchApi(`/admin/articles/${id}`);
      }

      if (articleData) {
        let activeTags = [];
        try {
          if (articleData.tags) {
            activeTags = JSON.parse(articleData.tags);
          }
        } catch (e) {
          activeTags = articleData.tags ? articleData.tags.split(',') : [];
        }

        const formatType = (articleData.postType || 'ARTICLE').toLowerCase();
        let displayFormat = 'article';
        if (formatType === 'gallery') displayFormat = 'gallery';
        else if (formatType === 'sorted_list') displayFormat = 'list';
        else if (formatType === 'page') displayFormat = 'page';
        else if (formatType === 'video') displayFormat = 'video';
        else if (formatType === 'audio') displayFormat = 'audio';
        else if (formatType === 'trivia_quiz') displayFormat = 'trivia';
        else if (formatType === 'personality_quiz') displayFormat = 'personality';

        setSelectedFormat(displayFormat);
        setTags(activeTags);

        setFormData({
          title: articleData.title || '',
          slug: articleData.slug || '',
          summary: articleData.summary || articleData.shortDescTa || articleData.shortDescEn || '',
          metaDescription: articleData.metaDescription || '',
          metaKeywords: articleData.metaKeywords || '',
          visibility: articleData.visibility !== false,
          showRightColumn: articleData.showRightColumn !== false,
          isFeatured: articleData.isFeatured || false,
          isBreaking: articleData.isBreaking || false,
          isSlider: articleData.isSlider || false,
          isRecommended: articleData.isRecommended || false,
          showOnlyRegistered: articleData.showOnlyRegistered || false,
          optionalUrl: articleData.optionalUrl || '',
          content: articleData.content || articleData.contentTa || articleData.contentEn || '',
          imageUrl: articleData.imageUrl || articleData.featuredImageUrl || '',
          featuredImageUrl: articleData.featuredImageUrl || articleData.imageUrl || '',
          language: articleData.language || 'ta',
          categoryId: articleData.categoryId || '',
          subcategoryId: articleData.subcategoryId || '',
          isScheduled: articleData.status === 'SCHEDULED',
          scheduledAt: articleData.scheduledAt ? articleData.scheduledAt.substring(0, 16) : ''
        });

        // Prefill custom layouts
        if (formatType === 'gallery' && articleData.galleryImages) {
          try { setGalleryImages(JSON.parse(articleData.galleryImages)); } catch (e) {}
        }
        if (formatType === 'sorted_list' && articleData.sortedListItems) {
          try { setSortedListItems(JSON.parse(articleData.sortedListItems)); } catch (e) {}
        }
        if (formatType === 'video') {
          setVideoData({
            videoUrl: articleData.videoUrl || '',
            videoEmbedCode: articleData.videoEmbedCode || '',
            videoThumbnailUrl: articleData.videoThumbnailUrl || '',
            activeTab: 'url'
          });
        }
        if (formatType === 'audio' && articleData.audioTracks) {
          try { setAudioTracks(JSON.parse(articleData.audioTracks)); } catch (e) {}
        }
        if ((formatType === 'trivia_quiz' || formatType === 'personality_quiz')) {
          if (articleData.quizQuestions) {
            try { setQuizQuestions(JSON.parse(articleData.quizQuestions)); } catch (e) {}
          }
          if (articleData.quizResults) {
            try { setQuizResults(JSON.parse(articleData.quizResults)); } catch (e) {}
          }
        }
      }
    } catch (err) {
      setErrorMsg('Failed to load article details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticleDetails();
  }, [id]);

  useEffect(() => {
    if (formData.categoryId) {
      const filtered = subcategories.filter(
        sub => String(sub.parentCategoryId || sub.categoryId) === String(formData.categoryId)
      );
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
    }
  }, [formData.categoryId, subcategories]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setFormData(prev => ({ ...prev, title, slug }));
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

  const moveItem = (list, setList, index, direction) => {
    const newList = [...list];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newList.length) return;
    const temp = newList[index];
    newList[index] = newList[targetIdx];
    newList[targetIdx] = temp;
    setList(newList);
  };

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

        galleryImages: postType === 'GALLERY' ? JSON.stringify(galleryImages) : null,
        sortedListItems: postType === 'SORTED_LIST' ? JSON.stringify(sortedListItems) : null,
        videoUrl: postType === 'VIDEO' ? videoData.videoUrl : null,
        videoEmbedCode: postType === 'VIDEO' ? videoData.videoEmbedCode : null,
        videoThumbnailUrl: postType === 'VIDEO' ? videoData.videoThumbnailUrl : null,
        audioTracks: postType === 'AUDIO' ? JSON.stringify(audioTracks) : null,
        quizQuestions: (postType === 'TRIVIA_QUIZ' || postType === 'PERSONALITY_QUIZ') ? JSON.stringify(quizQuestions) : null,
        quizResults: (postType === 'TRIVIA_QUIZ' || postType === 'PERSONALITY_QUIZ') ? JSON.stringify(quizResults) : null
      };

      const res = await fetchApi(`/admin/articles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (res && res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(saveAsDraft ? 'Draft saved successfully!' : 'Post updated successfully!');
        setTimeout(() => {
          navigate('/posts');
        }, 1500);
      }
    } catch (err) {
      if (err.status === 409) {
        setErrorMsg('An article with this title already exists for the selected language.');
      } else {
        setErrorMsg(err.message || 'Failed to update post.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="add-post-container"><div className="loading-state">Loading article form...</div></div>;
  }

  return (
    <div className="add-post-container">
      <div className="add-post-header">
        <button className="back-btn" onClick={() => navigate('/posts')}>
          <i className="fa-solid fa-arrow-left"></i> Cancel & Return
        </button>
        <h1>Edit Post #{id}</h1>
      </div>

      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
      {successMsg && <div className="alert-banner success">{successMsg}</div>}

      <form onSubmit={(e) => handleSubmit(e, false)} className="post-edit-form">
        <div className="editor-main-layout">
          <div className="editor-body">
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
                              featuredImageUrl: data.url
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
                  <div style={{ marginTop: '0.25rem' }}>
                    <img src={formData.imageUrl} alt="preview" style={{ maxWidth: '150px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                  </div>
                )}
              </div>
            )}

            {/* --- CUSTOM FORMS BY TYPE --- */}
            
            {(selectedFormat === 'article' || selectedFormat === 'page') && (
              <div className="form-group">
                <label htmlFor="content">Content *</label>
                <HtmlToolbar targetField="content" setFormData={setFormData} />
                <textarea
                  id="content"
                  name="content"
                  rows="12"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            {selectedFormat === 'gallery' && (
              <div className="format-special-block">
                <h2>Gallery Images</h2>
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
                      <label>Image URL *</label>
                      <input
                        type="text"
                        value={img.url}
                        onChange={(e) => {
                          const newImgs = [...galleryImages];
                          newImgs[idx].url = e.target.value;
                          setGalleryImages(newImgs);
                        }}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Caption</label>
                      <input
                        type="text"
                        value={img.caption}
                        onChange={(e) => {
                          const newImgs = [...galleryImages];
                          newImgs[idx].caption = e.target.value;
                          setGalleryImages(newImgs);
                        }}
                      />
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary w-full" onClick={() => setGalleryImages([...galleryImages, { url: '', caption: '' }])}>
                  + Add Gallery Image
                </button>
              </div>
            )}

            {selectedFormat === 'list' && (
              <div className="format-special-block">
                <h2>Sorted List Items</h2>
                {sortedListItems.map((item, idx) => (
                  <div key={idx} className="repeatable-item-card">
                    <div className="card-header-actions">
                      <span>Item #{idx + 1}</span>
                      <div className="flex gap-1">
                        <button type="button" className="mini-action" onClick={() => moveItem(sortedListItems, setSortedListItems, idx, -1)}><i className="fa-solid fa-arrow-up"></i></button>
                        <button type="button" className="mini-action" onClick={() => moveItem(sortedListItems, setSortedListItems, idx, 1)}><i className="fa-solid fa-arrow-down"></i></button>
                        <button type="button" className="mini-action danger" onClick={() => setSortedListItems(sortedListItems.filter((_, i) => i !== idx))}><i className="fa-solid fa-trash"></i></button>
                      </div>
                    </div>
                    <div className="form-group mt-2">
                      <label>Title *</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const newList = [...sortedListItems];
                          newList[idx].title = e.target.value;
                          setSortedListItems(newList);
                        }}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Image URL</label>
                      <input
                        type="text"
                        value={item.imageUrl}
                        onChange={(e) => {
                          const newList = [...sortedListItems];
                          newList[idx].imageUrl = e.target.value;
                          setSortedListItems(newList);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Content</label>
                      <textarea
                        rows="3"
                        value={item.content}
                        onChange={(e) => {
                          const newList = [...sortedListItems];
                          newList[idx].content = e.target.value;
                          setSortedListItems(newList);
                        }}
                      />
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary w-full" onClick={() => setSortedListItems([...sortedListItems, { title: '', imageUrl: '', content: '' }])}>
                  + Add List Item
                </button>
              </div>
            )}

            {selectedFormat === 'video' && (
              <div className="format-special-block">
                <h2>Video Details</h2>
                <div className="form-group">
                  <label>Video Platform Link / URL *</label>
                  <input
                    type="text"
                    value={videoData.videoUrl}
                    onChange={(e) => setVideoData(prev => ({ ...prev, videoUrl: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Embed Code</label>
                  <textarea
                    rows="3"
                    value={videoData.videoEmbedCode}
                    onChange={(e) => setVideoData(prev => ({ ...prev, videoEmbedCode: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Thumbnail URL</label>
                  <input
                    type="text"
                    value={videoData.videoThumbnailUrl}
                    onChange={(e) => setVideoData(prev => ({ ...prev, videoThumbnailUrl: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {selectedFormat === 'audio' && (
              <div className="format-special-block">
                <h2>Audio Tracks Playlist</h2>
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
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>File URL *</label>
                      <input
                        type="text"
                        value={track.fileUrl}
                        onChange={(e) => {
                          const newTracks = [...audioTracks];
                          newTracks[idx].fileUrl = e.target.value;
                          setAudioTracks(newTracks);
                        }}
                        required
                      />
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary w-full" onClick={() => setAudioTracks([...audioTracks, { title: '', fileUrl: '' }])}>
                  + Add Track
                </button>
              </div>
            )}

            {(selectedFormat === 'trivia' || selectedFormat === 'personality') && (
              <div className="format-special-block">
                <h2>Quiz Outcome Cards</h2>
                {quizResults.map((res, idx) => (
                  <div key={idx} className="repeatable-item-card">
                    <div className="card-header-actions">
                      <span>Outcome #{idx + 1}</span>
                      <button type="button" className="mini-action danger" onClick={() => setQuizResults(quizResults.filter((_, i) => i !== idx))}><i className="fa-solid fa-trash"></i></button>
                    </div>
                    <div className="form-row">
                      {selectedFormat === 'trivia' && (
                        <div className="form-group third">
                          <label>Min Score</label>
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
                          <label>Max Score</label>
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
                        <label>Outcome Title *</label>
                        <input
                          type="text"
                          value={res.title}
                          onChange={(e) => {
                            const newResults = [...quizResults];
                            newResults[idx].title = e.target.value;
                            setQuizResults(newResults);
                          }}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Image URL</label>
                      <input
                        type="text"
                        value={res.imageUrl}
                        onChange={(e) => {
                          const newResults = [...quizResults];
                          newResults[idx].imageUrl = e.target.value;
                          setQuizResults(newResults);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        rows="2"
                        value={res.description}
                        onChange={(e) => {
                          const newResults = [...quizResults];
                          newResults[idx].description = e.target.value;
                          setQuizResults(newResults);
                        }}
                      />
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary w-full mb-4" onClick={() => setQuizResults([...quizResults, { rangeMin: 0, rangeMax: 10, title: '', imageUrl: '', description: '' }])}>
                  + Add Outcome Card
                </button>

                <h2>Questions & Choice Setting</h2>
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
                        required
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group half">
                        <label>Image URL</label>
                        <input
                          type="text"
                          value={q.imageUrl}
                          onChange={(e) => {
                            const newQs = [...quizQuestions];
                            newQs[idx].imageUrl = e.target.value;
                            setQuizQuestions(newQs);
                          }}
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
                            required
                          />
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
                              className="w-40 px-2 py-1.5 border border-gray-300 rounded text-sm"
                            >
                              {quizResults.map((res, rIdx) => (
                                <option key={rIdx} value={rIdx}>Maps to Outcome #{rIdx + 1}</option>
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
                  + Add Question
                </button>
              </div>
            )}

            <div className="form-group mt-4">
              <label>Tags</label>
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
                  placeholder="Add tags..."
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
              <label htmlFor="optionalUrl">Optional Source URL</label>
              <input
                type="text"
                id="optionalUrl"
                name="optionalUrl"
                value={formData.optionalUrl}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="editor-sidebar">
            <div className="sidebar-card">
              <h3>Publishing Options</h3>
              
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
                  <span>Slider Carousel</span>
                </label>
                <label className="toggle-item">
                  <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} />
                  <span>Featured Post</span>
                </label>
                <label className="toggle-item">
                  <input type="checkbox" name="isBreaking" checked={formData.isBreaking} onChange={handleInputChange} />
                  <span>Breaking News</span>
                </label>
                <label className="toggle-item">
                  <input type="checkbox" name="isRecommended" checked={formData.isRecommended} onChange={handleInputChange} />
                  <span>Recommended</span>
                </label>
                <label className="toggle-item">
                  <input type="checkbox" name="showOnlyRegistered" checked={formData.showOnlyRegistered} onChange={handleInputChange} />
                  <span>Show Only Registered</span>
                </label>
                <label className="toggle-item">
                  <input type="checkbox" name="visibility" checked={formData.visibility} onChange={handleInputChange} />
                  <span>Visible (Show / Hide)</span>
                </label>
                <label className="toggle-item">
                  <input type="checkbox" name="showRightColumn" checked={formData.showRightColumn} onChange={handleInputChange} />
                  <span>Show Right Column</span>
                </label>
              </div>
            </div>

            <div className="sidebar-card">
              <h3>Schedule Posting</h3>
              <label className="toggle-item mb-2">
                <input type="checkbox" name="isScheduled" checked={formData.isScheduled} onChange={handleInputChange} />
                <span>Enable Schedule Posting</span>
              </label>

              {formData.isScheduled && (
                <div className="form-group mt-2">
                  <label htmlFor="scheduledAt">Schedule Launch</label>
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
                Save & Update
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditPost;
