import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader2 } from 'lucide-react';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                const courseData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCourses(courseData);
            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
    }

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="text-center mb-12 space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Our Courses</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">Explore our diverse range of courses designed to empower you with the skills needed for today's competitive world.</p>
                </div>

                {courses.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                        {courses.map((course) => (
                            <div key={course.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-slate-100 flex flex-col h-full">
                                <img src={course.image} alt={course.title} className="w-full h-32 md:h-48 object-cover" />
                                <div className="p-4 md:p-6 flex-1 flex flex-col">
                                    <span className="text-[10px] md:text-xs font-semibold text-blue-600 bg-blue-50 px-2 md:px-3 py-1 rounded-full w-fit">{course.category}</span>
                                    <h3 className="text-sm md:text-xl font-bold text-slate-900 mt-2 md:mt-3 mb-1 md:mb-2 line-clamp-2 leading-tight">{course.title}</h3>
                                    <p className="text-slate-600 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">{course.description}</p>
                                    <div className="mt-auto pt-2">
                                        <button className="w-full py-1.5 md:py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-xs md:text-base font-medium transition-colors">
                                            Learn More
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl">
                        <p className="text-slate-500 text-lg">No courses available at the moment. Please check back later.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Courses;
