import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
                    ...doc.data(),
                    id: doc.id
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {courses.map((course) => (
                        <div key={course.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col h-full group">
                            <div className="relative overflow-hidden h-48">
                                <img
                                    src={course.image}
                                    alt={course.title}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit mb-3">
                                    {course.category}
                                </span>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-slate-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                                    {course.fullDescription || course.description || course.shortDescription}
                                </p>
                                <div className="mt-auto">
                                    <Link
                                        to={`/courses/${course.id}`}
                                        className="w-full block text-center py-2.5 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white font-medium transition-all duration-300"
                                    >
                                        Learn More
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Courses;
