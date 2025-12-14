import React from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader2 } from 'lucide-react';

const Team = () => {
    const [teamMembers, setTeamMembers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchTeam = async () => {
            try {
                const q = query(collection(db, "team"), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    setTeamMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                } else {
                    setTeamMembers([
                        { id: 1, name: 'Emily Clark', role: 'Senior Instructor', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', subject: 'Computer Science' },
                        { id: 2, name: 'Michael Chang', role: 'Professor', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', subject: 'Mathematics' },
                        { id: 3, name: 'Jessica Lee', role: 'Lecturer', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', subject: 'English Literature' },
                        { id: 4, name: 'David Miller', role: 'Instructor', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', subject: 'Physics' },
                    ]);
                }
            } catch (error) {
                console.error("Error fetching team:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTeam();
    }, []);

    if (loading && teamMembers.length === 0) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="text-center mb-12 space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Meet Our Team</h1>
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
            </div>
        </div>
    );
};

export default Team;
