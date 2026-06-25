import React from 'react';
import { Activity, BarChart2, Clock, Gauge, Phone, Ribbon, Star, UserPlus, Users, Video } from 'lucide-react';
import { Card } from './ui'; // Assuming a generic Card component exists
import { useQuery } from '@tanstack/react-query';
import axios from '../api/axiosInstance';

const metrics = [
  {
    key: 'totalUsers',
    title: 'Total Users',
    icon: 'Users',
    bg: 'bg-gradient-to-r from-indigo-600 to-indigo-400',
  },
  { key: 'activeUsers', title: 'Active Users', icon: 'Activity', bg: 'bg-gradient-to-r from-green-600 to-green-400' },
  { key: 'newRegistrations', title: 'New Registrations', icon: 'UserPlus', bg: 'bg-gradient-to-r from-blue-600 to-blue-400' },
  { key: 'totalAiInterviews', title: 'Total AI Interviews', icon: 'Video', bg: 'bg-gradient-to-r from-purple-600 to-purple-400' },
  { key: 'totalLiveInterviews', title: 'Total Live Interviews', icon: 'Phone', bg: 'bg-gradient-to-r from-pink-600 to-pink-400' },
  { key: 'avgAtSScore', title: 'Average ATS Score', icon: 'Gauge', bg: 'bg-gradient-to-r from-orange-600 to-orange-400' },
  { key: 'avgInterviewScore', title: 'Average Interview Score', icon: 'BarChart2', bg: 'bg-gradient-to-r from-teal-600 to-teal-400' },
  { key: 'readinessIndex', title: 'Placement Readiness Index', icon: 'Ribbon', bg: 'bg-gradient-to-r from-red-600 to-red-400' },
  { key: 'mostRecommendedRole', title: 'Most Recommended Role', icon: 'Star', bg: 'bg-gradient-to-r from-yellow-600 to-yellow-400' },
  { key: 'mostRequestedLiveRole', title: 'Most Requested Live Interview Role', icon: 'Clock', bg: 'bg-gradient-to-r from-gray-600 to-gray-400' },
];

/**
 * AdminAnalyticsCards – fetches overview statistics from `/admin/overview`
 * and displays them in premium gradient glass‑morphic cards with animated counters.
 */
const AdminAnalyticsCards = () => {
  const { data, isLoading, error } = useQuery(['adminOverview'], async () => {
    const res = await axios.get('/admin/overview');
    return res.data;
  }, {
    refetchInterval: 30000, // refresh every 30 seconds for real-time feel
    staleTime: 15000,
  });

  if (isLoading) return <p className="text-center text-slate-500">Loading stats…</p>;
  if (error) return <p className="text-center text-red-600">Failed to load stats.</p>;

  const iconMap = {
    Users,
    Activity,
    UserPlus,
    Video,
    Phone,
    Gauge,
    BarChart2,
    Ribbon,
    Star,
    Clock,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {metrics.map((m) => {
        const value = data?.[m.key] ?? '--';
        const IconComp = iconMap[m.icon] || Activity;
        return (
          <div
            key={m.key}
            className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 p-4 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-md ${m.bg} bg-opacity-70`}>
                <IconComp className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-sm font-medium text-white/80">{m.title}</h3>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default AdminAnalyticsCards;
