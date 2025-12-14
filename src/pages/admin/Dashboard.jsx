import React from 'react';
import { Users, Image as ImageIcon, BookOpen, MessageSquare, TrendingUp } from 'lucide-react';

const Dashboard = () => {
    // Mock data
    const stats = [
        { label: 'Total Students', value: '12,450', change: '+12%', icon: Users, color: 'blue' },
        { label: 'Gallery Images', value: '48', change: '+4', icon: ImageIcon, color: 'purple' },
        { label: 'Active Courses', value: '25', change: '0%', icon: BookOpen, color: 'orange' },
        { label: 'New Enquiries', value: '12', change: '+5', icon: MessageSquare, color: 'green' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                <p className="text-slate-500">Welcome back, here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                                    <Icon size={24} />
                                </div>
                                <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                    <TrendingUp size={12} className="mr-1" /> {stat.change}
                                </span>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                            <p className="text-slate-500 text-sm">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Activity Mockup */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h2>
                    <div className="space-y-6">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                    <MessageSquare size={18} className="text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-slate-900 font-medium">New enquiry from <span className="font-bold">John Doe</span></p>
                                    <p className="text-slate-500 text-sm">Interested in CCC Course • 2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all text-left group">
                            <div className="mb-2 text-slate-400 group-hover:text-blue-600"><ImageIcon size={24} /></div>
                            <span className="font-semibold block">Add Image</span>
                        </button>
                        <button className="p-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50 hover:text-purple-600 transition-all text-left group">
                            <div className="mb-2 text-slate-400 group-hover:text-purple-600"><BookOpen size={24} /></div>
                            <span className="font-semibold block">New Course</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
