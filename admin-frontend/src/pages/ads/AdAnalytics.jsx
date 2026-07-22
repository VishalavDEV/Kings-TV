import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Filter, Eye, MousePointer, Percent, Search } from 'lucide-react';
import api from '../../utils/axios';

export default function AdAnalytics() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  
  // Date range defaults: last 30 days
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().substring(0, 10)
  );

  // Performance stats
  const [summary, setSummary] = useState({
    totalImpressions: 0,
    totalClicks: 0,
    overallCtr: 0,
    adStats: [],
    trend: []
  });

  const loadFilterOptions = async () => {
    try {
      const res = await api.get('/api/admin/campaigns');
      setCampaigns(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to load campaigns for filters');
    }
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/ads/analytics?date_range=${startDate},${endDate}`;
      if (selectedCampaign) {
        url += `&campaign_id=${selectedCampaign}`;
      }
      const res = await api.get(url);
      if (res.data) {
        setSummary({
          totalImpressions: res.data.totalImpressions || 0,
          totalClicks: res.data.totalClicks || 0,
          overallCtr: res.data.overallCtr || 0.0,
          adStats: Array.isArray(res.data.adStats) ? res.data.adStats : [],
          trend: Array.isArray(res.data.trend) ? res.data.trend : []
        });
      }
    } catch (e) {
      console.error('Failed to load ad analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [selectedCampaign, startDate, endDate]);

  // Find max value in trend for chart scaling
  const getMaxTrendVal = (trend, key) => {
    let max = Math.max(...trend.map(t => t[key] || 0));
    return max > 0 ? max : 10;
  };

  const maxImp = getMaxTrendVal(summary.trend, 'impressions');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">Ad Performance Analytics</h2>
        <p className="text-sm text-gray-500 mt-0.5">Track impressions, click-through rates (CTR), and daily delivery performance</p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
            <Filter size={14} /> Filters
          </div>

          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
          >
            <option value="">All Campaigns</option>
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
            <Calendar size={14} /> Date Range
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Impressions</span>
                <p className="text-3xl font-extrabold text-gray-800">{summary.totalImpressions.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl text-[#B3732A]">
                <Eye size={24} />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Clicks</span>
                <p className="text-3xl font-extrabold text-gray-800">{summary.totalClicks.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-[#B3732A]/10 rounded-2xl text-[#B3732A]">
                <MousePointer size={24} />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Click-Through Rate (CTR)</span>
                <p className="text-3xl font-extrabold text-gray-800">{summary.overallCtr.toFixed(2)}%</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <Percent size={24} />
              </div>
            </div>
          </div>

          {/* Daily Trend Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <BarChart3 size={16} className="text-[#B3732A]" />
              Daily Impressions Performance
            </h3>
            
            {summary.trend.length === 0 ? (
              <p className="text-center text-gray-400 text-xs py-8">No performance trend data available for this range.</p>
            ) : (
              <div className="h-64 flex items-end justify-between gap-1 border-b border-gray-100 pb-4 overflow-x-auto select-none pt-6 pr-2">
                {summary.trend.map((point, index) => {
                  const percent = ((point.impressions || 0) / maxImp) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center min-w-[28px] max-w-[50px] group relative h-full justify-end">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-1 bg-gray-800 text-white text-[9px] font-bold py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none whitespace-nowrap">
                        <div>Imps: {point.impressions}</div>
                        <div>Clicks: {point.clicks}</div>
                        <div>CTR: {point.ctr.toFixed(1)}%</div>
                      </div>

                      {/* Bar Fill */}
                      <div
                        style={{ height: `${Math.max(4, percent)}%` }}
                        className="w-full bg-[#B3732A] hover:bg-[#9c6323] rounded-t-md transition-all duration-300 relative"
                      >
                        {/* Click indicator bar inside */}
                        {point.clicks > 0 && (
                          <div
                            style={{ height: `${Math.min(100, ((point.clicks || 0) / (point.impressions || 1)) * 100)}%` }}
                            className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-t-md opacity-70"
                          />
                        )}
                      </div>

                      {/* Label */}
                      <span className="text-[9px] text-gray-400 mt-2 font-mono whitespace-nowrap truncate w-full text-center">
                        {point.date.substring(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="flex justify-end gap-4 text-[10px] font-semibold text-gray-500 pt-1">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 bg-[#B3732A] rounded-sm" /> Impressions
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" /> Click Share
              </div>
            </div>
          </div>

          {/* Tabular Performance list */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm">Detailed Performance Report</h3>
            </div>
            
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs font-semibold uppercase">
                  <th className="px-6 py-4">Ad ID / Placement</th>
                  <th className="px-6 py-4">Advertiser & Campaign</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Impressions</th>
                  <th className="px-6 py-4">Clicks</th>
                  <th className="px-6 py-4">CTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {summary.adStats.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-400">
                      No advertisements statistics found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  summary.adStats.map((stat, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        <div>Ad ID: #{stat.adId}</div>
                        <div className="text-[10px] text-gray-400 font-mono capitalize">{stat.placementName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-750">{stat.campaignName}</div>
                        <div className="text-[10px] text-gray-400">{stat.advertiserName}</div>
                      </td>
                      <td className="px-6 py-4 capitalize text-gray-500 font-medium">
                        {stat.adType}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {stat.impressions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {stat.clicks.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-extrabold text-[#B3732A] bg-amber-50 px-2 py-0.5 rounded text-[10px]">
                          {stat.ctr.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
