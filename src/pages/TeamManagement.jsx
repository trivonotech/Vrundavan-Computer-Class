import React from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader2 } from 'lucide-react';

const TeamManagement = () => {
    const [leaders, setLeaders] = React.useState([]);
    const [teamMembers, setTeamMembers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Management
                const leadersQuery = query(collection(db, "management"), orderBy("createdAt", "desc"));
                const leadersSnapshot = await getDocs(leadersQuery);
                const leadersData = leadersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Fetch Team
                const teamQuery = query(collection(db, "team"), orderBy("createdAt", "desc"));
                const teamSnapshot = await getDocs(teamQuery);
                const teamData = teamSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                setLeaders(leadersData.length > 0 ? leadersData : [
                    { id: 1, name: 'Dr. Robert Fox', role: 'Director', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', bio: 'With over 20 years of experience in education, Dr. Fox leads SkillNest with a vision for innovation.' },
                    { id: 2, name: 'Sarah Wilson', role: 'Principal', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', bio: 'Sarah ensures academic excellence and student welfare are always the top priorities.' },
                    { id: 3, name: 'James Anderson', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', bio: 'James manages the day-to-day operations, ensuring a smooth learning environment for everyone.' },
                ]);

                setTeamMembers(teamData.length > 0 ? teamData : [
                    { id: 1, name: 'Emily Clark', role: 'Senior Instructor', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', subject: 'Computer Science' },
                    { id: 2, name: 'Michael Chang', role: 'Professor', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', subject: 'Mathematics' },
                    { id: 3, name: 'Jessica Lee', role: 'Lecturer', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', subject: 'English Literature' },
                    { id: 4, name: 'David Miller', role: 'Instructor', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', subject: 'Physics' },
                ]);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-screen-xl mx-auto px-4 space-y-20">

                {/* Management Section */}
                <section>
                    <div className="text-center mb-12 space-y-4">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Our Management</h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Meet the visionaries who guide our institution towards excellence.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8">
                        {leaders.map((leader) => (
                            <div key={leader.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-100 animate-fade-in">
                                <img src={leader.image} alt={leader.name} className="w-full h-40 md:h-64 object-cover" />
                                <div className="p-3 md:p-6 text-center">
                                    <h3 className="text-sm md:text-lg font-bold text-slate-900">{leader.name}</h3>
                                    <p className="text-blue-600 text-xs md:text-sm font-medium">{leader.role}</p>
                                    <p className="text-slate-500 text-[10px] md:text-sm mt-1 md:mt-2 line-clamp-2">{leader.bio}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Team Section */}
                <section>
                    <div className="text-center mb-12 space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Meet Our Faculty</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Our dedicated faculty members are passionate about teaching and helping students succeed.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
                        {teamMembers.map((member) => (
                            <div key={member.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-100 animate-fade-in">
                                <img src={member.image} alt={member.name} className="w-full h-40 md:h-64 object-cover" />
                                <div className="p-3 md:p-6 text-center">
                                    <h3 className="text-sm md:text-lg font-bold text-slate-900">{member.name}</h3>
                                    <p className="text-blue-600 text-xs md:text-sm font-medium">{member.role}</p>
                                    <p className="text-slate-500 text-[10px] md:text-sm mt-1 md:mt-2">{member.subject}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default TeamManagement;
