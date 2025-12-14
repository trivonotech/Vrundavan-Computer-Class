import React, { useEffect, useState } from 'react';
import { Users, Image as ImageIcon, BookOpen, MessageSquare, TrendingUp, Loader2 } from 'lucide-react';
import { collection, getCountFromServer, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        galleryCount: 0,
        coursesCount: 0,
        enquiriesCount: 0,
        recentEnquiries: []
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Counts
                const galleryColl = collection(db, "gallery");
                const coursesColl = collection(db, "courses");
                const enquiriesColl = collection(db, "enquiries");

                const gallerySnapshot = await getCountFromServer(galleryColl);
                const coursesSnapshot = await getCountFromServer(coursesColl);
                const enquiriesSnapshot = await getCountFromServer(enquiriesColl);

                // Fetch Recent Enquiries
                const recentEnqQuery = query(enquiriesColl, orderBy("createdAt", "desc"), limit(3));
                const recentEnqSnapshot = await getDocs(recentEnqQuery);
                const recentEnquiries = recentEnqSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setStats({
                    galleryCount: gallerySnapshot.data().count,
                    coursesCount: coursesSnapshot.data().count,
                    enquiriesCount: enquiriesSnapshot.data().count,
                    recentEnquiries
                });
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const cardData = [
        { label: 'Total Enquiries', value: stats.enquiriesCount, change: 'Lifetime', icon: Users, color: 'blue' },
        { label: 'Gallery Images', value: stats.galleryCount, change: 'Live', icon: ImageIcon, color: 'purple' },
        { label: 'Active Courses', value: stats.coursesCount, change: 'Offered', icon: BookOpen, color: 'orange' },
        { label: 'Pending Msgs', value: stats.enquiriesCount, change: 'Check Inbox', icon: MessageSquare, color: 'green' }, // Could filter by status if implemented
    ];

    if (loading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                <p className="text-slate-500">Welcome back, here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cardData.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                                    <Icon size={24} />
                                </div>
                                <span className="flex items-center text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                                    {stat.change}
                                </span>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                            <p className="text-slate-500 text-sm">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900">Recent Enquiries</h2>
                        <Link to="/admin/enquiries" className="text-blue-600 text-sm font-semibold hover:underline">View All</Link>
                    </div>
                    <div className="space-y-6">
                        {stats.recentEnquiries.length > 0 ? (
                            stats.recentEnquiries.map((enq) => (
                                <div key={enq.id} className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                        <MessageSquare size={18} className="text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-slate-900 font-medium">New enquiry from <span className="font-bold">{enq.firstName} {enq.lastName}</span></p>
                                        <p className="text-slate-500 text-sm">{enq.email} • {enq.createdAt?.toDate ? new Date(enq.createdAt.toDate()).toLocaleDateString() : 'Just now'}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 text-center py-4">No recent enquiries found.</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link to="/admin/gallery" className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all text-left group">
                            <div className="mb-2 text-slate-400 group-hover:text-blue-600"><ImageIcon size={24} /></div>
                            <span className="font-semibold block">Manage Gallery</span>
                        </Link>
                        <Link to="/admin/courses" className="p-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50 hover:text-purple-600 transition-all text-left group">
                            <div className="mb-2 text-slate-400 group-hover:text-purple-600"><BookOpen size={24} /></div>
                            <span className="font-semibold block">Manage Courses</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
