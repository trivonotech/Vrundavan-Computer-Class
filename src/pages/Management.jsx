import React from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader2 } from 'lucide-react';

const Management = () => {
    const [leaders, setLeaders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const q = query(collection(db, "management"), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    setLeaders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                } else {
                    setLeaders([
                        { id: 1, name: 'Dr. Robert Fox', role: 'Director', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', bio: 'With over 20 years of experience in education, Dr. Fox leads SkillNest with a vision for innovation.' },
                        { id: 2, name: 'Sarah Wilson', role: 'Principal', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', bio: 'Sarah ensures academic excellence and student welfare are always the top priorities.' },
                        { id: 3, name: 'James Anderson', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', bio: 'James manages the day-to-day operations, ensuring a smooth learning environment for everyone.' },
                    ]);
                }
            } catch (error) {
                console.error("Error fetching management:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaders();
    }, []);

    if (loading && leaders.length === 0) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="text-center mb-12 space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Our Management</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">Meet the visionaries who guide our institution towards excellence.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8">
                    {leaders.map((leader) => (
                        <div key={leader.id} className="bg-white rounded-2xl p-4 md:p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-slate-100 animate-fade-in">
                            <div className="w-20 h-20 md:w-32 md:h-32 mx-auto mb-3 md:mb-6 rounded-full overflow-hidden border-2 md:border-4 border-blue-50">
                                <img src={leader.image} alt={leader.name} className="w-full h-full object-cover" />
                            </div>
                            <h3 className="text-sm md:text-xl font-bold text-slate-900">{leader.name}</h3>
                            <p className="text-blue-600 text-xs md:text-base font-medium mb-2 md:mb-4">{leader.role}</p>
                            <p className="text-slate-600 text-[10px] md:text-sm line-clamp-3 md:line-clamp-none leading-relaxed">{leader.bio}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Management;
