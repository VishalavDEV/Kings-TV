import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Save, Plus, Trash2, Mail, Phone, Clock, MapPin, History, Users, Award, ShieldAlert, FileText, Download } from 'lucide-react';
import api from '../../utils/axios';

export default function SpecialPageEdit() {
  const { pageType } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState(null);

  // Field states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('Public');
  const [language, setLanguage] = useState('ta');

  // Page-specific structures
  const [teamMembers, setTeamMembers] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [emailAddresses, setEmailAddresses] = useState([]);
  const [officeHours, setOfficeHours] = useState('');
  const [embeddedMap, setEmbeddedMap] = useState('');

  // Policy Version history states
  const [versions, setVersions] = useState([]);
  const [newVersionContent, setNewVersionContent] = useState('');
  const [showVersionModal, setShowVersionModal] = useState(false);

  // Careers Applicants states
  const [applicants, setApplicants] = useState([]);

  // Self-heal/Initialize option
  const [initializing, setInitializing] = useState(false);

  const getPageTitleLabel = () => {
    switch (pageType) {
      case 'about_us': return 'About Us Settings';
      case 'contact': return 'Contact Details';
      case 'career': return 'Careers Information & Applications';
      case 'privacy_policy': return 'Privacy Policy Manager';
      case 'terms_of_use': return 'Terms of Use Manager';
      default: return 'Special Page Editor';
    }
  };

  const loadPageData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/pages');
      const matched = res.data.find(p => p.pageType === pageType);
      
      if (matched) {
        setPageData(matched);
        setTitle(matched.title || '');
        setContent(matched.content || '');
        setVisibility(matched.visibility || 'Public');
        setLanguage(matched.language || 'ta');

        // Parse parsed fields
        try { setTeamMembers(JSON.parse(matched.teamMembers) || []); } catch (e) { setTeamMembers([]); }
        try { setMilestones(JSON.parse(matched.milestones) || []); } catch (e) { setMilestones([]); }
        try { setPhoneNumbers(JSON.parse(matched.phoneNumbers) || []); } catch (e) { setPhoneNumbers([]); }
        try { setEmailAddresses(JSON.parse(matched.emailAddresses) || []); } catch (e) { setEmailAddresses([]); }
        setOfficeHours(matched.officeHours || '');
        setEmbeddedMap(matched.embeddedMap || '');

        // Load specific lists
        if (pageType === 'privacy_policy' || pageType === 'terms_of_use') {
          loadVersions(matched.id);
        }
        if (pageType === 'career') {
          loadApplicants();
        }
      } else {
        setPageData(null);
      }
    } catch (e) {
      console.error('Failed to load pages list');
    } finally {
      setLoading(false);
    }
  };

  const loadVersions = async (id) => {
    try {
      const res = await api.get(`/api/admin/pages/${id}/versions`);
      setVersions(res.data || []);
    } catch (e) {
      console.error('Failed to load version history');
    }
  };

  const loadApplicants = async () => {
    try {
      const res = await api.get('/api/admin/pages/applications');
      setApplicants(res.data || []);
    } catch (e) {
      console.error('Failed to load applications list');
    }
  };

  useEffect(() => {
    loadPageData();
  }, [pageType]);

  // Seeding/Initialization helper
  const handleInitialize = async () => {
    setInitializing(true);
    try {
      const defaults = {
        about_us: { title: 'எங்களைப் பற்றி / About Us', slug: 'about-us', pageType: 'about_us', content: 'கிங்ஸ் தொலைக்காட்சி செய்திப்பிரிவு...' },
        contact: { title: 'தொடர்பு கொள்ள / Contact Us', slug: 'contact-us', pageType: 'contact', content: 'தொடர்பு கொள்ள தேவையான தகவல்கள்...' },
        career: { title: 'வேலைவாய்ப்பு / Careers', slug: 'careers', pageType: 'career', content: 'டிஜிட்டல் செய்திப்பிரிவில் பணியாற்ற விருப்பமா...' },
        privacy_policy: { title: 'தனியுரிமைக் கொள்கை / Privacy Policy', slug: 'privacy-policy', pageType: 'privacy_policy', content: 'தனியுரிமை கொள்கைகள்...', version: 1 },
        terms_of_use: { title: 'பயன்பாட்டு விதிகள் / Terms of Use', slug: 'terms-of-use', pageType: 'terms_of_use', content: 'பயன்பாட்டு விதிமுறைகள்...', version: 1 }
      };

      const payload = defaults[pageType] || { title: pageType, slug: pageType, pageType: pageType };
      await api.post('/api/admin/pages', payload);
      loadPageData();
    } catch (e) {
      alert('Initialization failed: ' + (e.response?.data?.error || e.message));
    } finally {
      setInitializing(false);
    }
  };

  const handleSave = async () => {
    if (!pageData) return;
    try {
      const payload = {
        title,
        content,
        visibility,
        language,
        teamMembers: JSON.stringify(teamMembers),
        milestones: JSON.stringify(milestones),
        phoneNumbers: JSON.stringify(phoneNumbers),
        emailAddresses: JSON.stringify(emailAddresses),
        officeHours,
        embeddedMap
      };

      await api.put(`/api/admin/pages/${pageData.id}`, payload);
      alert('Settings updated successfully!');
      loadPageData();
    } catch (e) {
      alert('Save failed: ' + (e.response?.data?.error || e.message));
    }
  };

  // Publish new policy version
  const handlePublishVersion = async () => {
    if (!pageData || !newVersionContent) return;
    try {
      await api.put(`/api/admin/pages/${pageData.id}/publish-version`, { content: newVersionContent });
      alert('New version published successfully!');
      setShowVersionModal(false);
      setNewVersionContent('');
      loadPageData();
    } catch (e) {
      alert('Publish failed: ' + (e.response?.data?.error || e.message));
    }
  };

  const handleDeleteApplicant = async (id) => {
    if (!confirm('Are you sure you want to delete this applicant file?')) return;
    try {
      await api.delete(`/api/admin/pages/applications/${id}`);
      loadApplicants();
    } catch (e) {
      alert('Failed to delete application log');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 max-w-lg mx-auto">
        <BookOpen className="mx-auto text-gray-300 mb-3" size={48} />
        <h3 className="font-bold text-gray-800 text-base">Page Not Found</h3>
        <p className="text-xs text-gray-500 mt-1 mb-4">This special page has not been initialized in the database yet.</p>
        <button
          onClick={handleInitialize}
          disabled={initializing}
          className="bg-[#B3732A] hover:bg-[#9c6323] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
        >
          {initializing ? 'Initializing...' : 'Initialize and Seed Page'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Title Header */}
      <div className="flex justify-between items-center bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{getPageTitleLabel()}</h2>
          <p className="text-xs text-gray-500 mt-0.5">Editable fields for template URL: <span className="font-mono text-amber-600 bg-amber-50 px-1 py-0.5 rounded">{`/public/pages/${pageType}`}</span></p>
        </div>
        <button
          onClick={handleSave}
          className="bg-[#B3732A] hover:bg-[#9c6323] text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Save size={14} /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Editors */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Fields */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">General Information</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Page Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Body Description / Rich Text</label>
              <textarea
                rows="8"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write page content here (supports basic HTML tags)..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A] font-sans"
              />
            </div>
          </div>

          {/* Special Type Forms */}
          {pageType === 'about_us' && (
            <>
              {/* Team Members List */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Users size={14} /> Team Members</h3>
                  <button
                    onClick={() => setTeamMembers([...teamMembers, { name: '', title: '', photo: '', bio: '' }])}
                    className="text-[#B3732A] text-xs font-bold flex items-center gap-0.5"
                  >
                    <Plus size={14} /> Add Member
                  </button>
                </div>

                {teamMembers.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No team members added yet.</p>
                ) : (
                  <div className="space-y-4 divide-y divide-gray-100">
                    {teamMembers.map((m, idx) => (
                      <div key={idx} className="pt-4 first:pt-0 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-500">Member #{idx + 1}</span>
                          <button
                            onClick={() => setTeamMembers(teamMembers.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Name"
                            value={m.name}
                            onChange={(e) => {
                              const list = [...teamMembers];
                              list[idx].name = e.target.value;
                              setTeamMembers(list);
                            }}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Job Title"
                            value={m.title}
                            onChange={(e) => {
                              const list = [...teamMembers];
                              list[idx].title = e.target.value;
                              setTeamMembers(list);
                            }}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Photo Image URL"
                          value={m.photo}
                          onChange={(e) => {
                            const list = [...teamMembers];
                            list[idx].photo = e.target.value;
                            setTeamMembers(list);
                          }}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                        />
                        <textarea
                          placeholder="Short biography..."
                          value={m.bio}
                          onChange={(e) => {
                            const list = [...teamMembers];
                            list[idx].bio = e.target.value;
                            setTeamMembers(list);
                          }}
                          rows="2"
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Milestones / Timeline */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Award size={14} /> Timeline Milestones</h3>
                  <button
                    onClick={() => setMilestones([...milestones, { year: '', title: '', description: '' }])}
                    className="text-[#B3732A] text-xs font-bold flex items-center gap-0.5"
                  >
                    <Plus size={14} /> Add Milestone
                  </button>
                </div>

                {milestones.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No milestones defined yet.</p>
                ) : (
                  <div className="space-y-4">
                    {milestones.map((m, idx) => (
                      <div key={idx} className="flex gap-2 items-start bg-gray-50 p-3 rounded-xl">
                        <input
                          type="text"
                          placeholder="Year"
                          value={m.year}
                          onChange={(e) => {
                            const list = [...milestones];
                            list[idx].year = e.target.value;
                            setMilestones(list);
                          }}
                          className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-xs"
                        />
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            placeholder="Milestone Title"
                            value={m.title}
                            onChange={(e) => {
                              const list = [...milestones];
                              list[idx].title = e.target.value;
                              setMilestones(list);
                            }}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs"
                          />
                          <textarea
                            placeholder="Description details..."
                            value={m.description}
                            onChange={(e) => {
                              const list = [...milestones];
                              list[idx].description = e.target.value;
                              setMilestones(list);
                            }}
                            rows="1"
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs"
                          />
                        </div>
                        <button
                          onClick={() => setMilestones(milestones.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700 mt-2 shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {pageType === 'contact' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Channels</h3>
              
              {/* Phone numbers */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-600 flex items-center gap-1"><Phone size={13} /> Phone Numbers</label>
                  <button
                    onClick={() => setPhoneNumbers([...phoneNumbers, ''])}
                    className="text-[#B3732A] text-xs font-bold"
                  >
                    + Add Phone
                  </button>
                </div>
                {phoneNumbers.map((num, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={num}
                      onChange={(e) => {
                        const list = [...phoneNumbers];
                        list[idx] = e.target.value;
                        setPhoneNumbers(list);
                      }}
                      placeholder="+91 XXXXX XXXXX"
                      className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                    />
                    <button
                      onClick={() => setPhoneNumbers(phoneNumbers.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-700 px-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Email Addresses */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-600 flex items-center gap-1"><Mail size={13} /> Email Addresses</label>
                  <button
                    onClick={() => setEmailAddresses([...emailAddresses, ''])}
                    className="text-[#B3732A] text-xs font-bold"
                  >
                    + Add Email
                  </button>
                </div>
                {emailAddresses.map((email, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        const list = [...emailAddresses];
                        list[idx] = e.target.value;
                        setEmailAddresses(list);
                      }}
                      placeholder="info@kingstv.com"
                      className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                    />
                    <button
                      onClick={() => setEmailAddresses(emailAddresses.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-700 px-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Office Hours */}
              <div className="space-y-1 pt-2">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1"><Clock size={13} /> Office Hours</label>
                <input
                  type="text"
                  value={officeHours}
                  onChange={(e) => setOfficeHours(e.target.value)}
                  placeholder="Mon - Sat: 9:00 AM - 6:00 PM"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2"
                />
              </div>

              {/* Embedded map */}
              <div className="space-y-1 pt-2">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1"><MapPin size={13} /> Map Embed (iframe src / coordinates)</label>
                <textarea
                  rows="3"
                  value={embeddedMap}
                  onChange={(e) => setEmbeddedMap(e.target.value)}
                  placeholder="https://google.com/maps/embed/v1/place?..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 font-mono"
                />
              </div>
            </div>
          )}

          {pageType === 'career' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} /> General Job Applications Inbox
              </h3>

              {applicants.length === 0 ? (
                <p className="text-xs text-gray-450 italic text-center py-6">No general resumes uploaded yet.</p>
              ) : (
                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-[10px] font-bold uppercase">
                        <th className="px-4 py-3">Applicant</th>
                        <th className="px-4 py-3">Cover Letter</th>
                        <th className="px-4 py-3">Attachment</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                      {applicants.map((app) => (
                        <tr key={app.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-800">{app.name}</div>
                            <div className="text-[10px] text-gray-400">{app.email} &bull; {app.phone}</div>
                          </td>
                          <td className="px-4 py-3 max-w-xs truncate" title={app.coverLetter}>
                            {app.coverLetter || 'No cover letter'}
                          </td>
                          <td className="px-4 py-3">
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#B3732A]/10 text-[#B3732A] text-[10px] font-bold"
                            >
                              <Download size={11} /> Download PDF
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleDeleteApplicant(app.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {(pageType === 'privacy_policy' || pageType === 'terms_of_use') && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <History size={14} /> Document Version Audit History
                </h3>
                <button
                  onClick={() => {
                    setNewVersionContent(content);
                    setShowVersionModal(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 shadow-sm"
                >
                  Publish New Version
                </button>
              </div>

              {versions.length === 0 ? (
                <p className="text-xs text-gray-450 italic text-center py-6">No previous versions archived yet.</p>
              ) : (
                <div className="space-y-3">
                  {versions.map((ver) => (
                    <div key={ver.id} className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                      <div>
                        <span className="font-bold text-gray-800 text-xs">Version #{ver.version}</span>
                        <p className="text-[10px] text-gray-400 mt-0.5">Effective Date: {new Date(ver.effectiveDate).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => {
                          alert(`Version #${ver.version} Content:\n\n${ver.content}`);
                        }}
                        className="text-[#B3732A] text-xs font-semibold"
                      >
                        Inspect content
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Page Settings</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Language Scope</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none"
              >
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="en">English (English)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Visibility Status</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none"
              >
                <option value="Public">Public (Visible)</option>
                <option value="Draft">Draft (Invisible)</option>
              </select>
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Active Version:</span>
                <span className="font-extrabold text-gray-750">v{pageData.version}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Effective Date:</span>
                <span className="font-bold text-gray-750">
                  {pageData.effectiveDate ? new Date(pageData.effectiveDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Publish New Version Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 space-y-4 animate-scale-in">
            <div>
              <h3 className="font-bold text-gray-800 text-base flex items-center gap-1.5">
                <History size={18} className="text-emerald-600" /> Publish New Version
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">This will archive the current active text to version history and increment the active index.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">New Content Block</label>
              <textarea
                rows="10"
                value={newVersionContent}
                onChange={(e) => setNewVersionContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-sans"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowVersionModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePublishVersion}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-sm"
              >
                Archive and Publish v{pageData.version + 1}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
