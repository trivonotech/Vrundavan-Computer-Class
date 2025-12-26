import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Users, BookOpen, Target, Award, Loader2, Clock, Banknote } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const CourseDetails = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const docRef = doc(db, "courses", courseId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setCourse({ ...docSnap.data(), id: docSnap.id });
                } else {
                    setCourse(null); // Course not found
                }
            } catch (error) {
                console.error("Error fetching course details:", error);
                setCourse(null); // Ensure course is null on error
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId]);



    if (!loading && !course) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">Course Not Found</h2>
                <Link to="/courses" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2">
                    <ArrowLeft size={20} /> Back to Courses
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12">
            {/* Hero Section */}
            <div>
                <div className="max-w-screen-xl mx-auto px-4 py-8 md:py-12">
                    <Link to="/courses" className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-6 transition-colors">
                        <ArrowLeft size={18} className="mr-2" />
                        Back to Courses
                    </Link>

                    <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
                        {loading ? (
                            // Hero Content Skeleton
                            <div className="space-y-6 animate-pulse">
                                <div className="flex gap-3">
                                    <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
                                    <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
                                </div>
                                <div className="h-12 w-3/4 bg-slate-200 rounded"></div>
                                <div className="space-y-3">
                                    <div className="h-4 w-full bg-slate-200 rounded"></div>
                                    <div className="h-4 w-full bg-slate-200 rounded"></div>
                                    <div className="h-4 w-2/3 bg-slate-200 rounded"></div>
                                </div>
                                <div className="h-32 w-full bg-slate-200 rounded-xl"></div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex flex-wrap gap-3 mb-4">
                                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-sm font-semibold rounded-full">
                                        {course.category}
                                    </span>
                                    {course.duration && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-600 text-sm font-semibold rounded-full">
                                            <Clock size={14} /> {course.duration}
                                        </span>
                                    )}
                                    {course.fees && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 text-sm font-semibold rounded-full">
                                            <Banknote size={14} /> {course.fees}
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                                    {course.title}
                                </h1>
                                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                                    {course.fullDescription}
                                </p>
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                                    <h3 className="flex items-center gap-2 text-blue-800 font-bold mb-2">
                                        <Target size={20} />
                                        Our Objective
                                    </h3>
                                    <p className="text-blue-700">
                                        {course.objective}
                                    </p>
                                </div>
                            </div>
                        )}

                        {loading ? (
                            // Hero Image Skeleton
                            <div className="w-full aspect-video bg-slate-200 rounded-3xl animate-pulse"></div>
                        ) : (
                            <div className="relative group rounded-3xl overflow-hidden shadow-2xl shadow-blue-100">
                                <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-transparent transition-colors duration-300"></div>
                                <img
                                    src={course.image}
                                    alt={course.title}
                                    className="w-full aspect-video object-cover"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-screen-xl mx-auto px-4 py-12">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-12">
                        {loading ? (
                            // Main Content Skeletons
                            <div className="space-y-12 animate-pulse">
                                <div className="h-48 bg-slate-200 rounded-2xl"></div>
                                <div className="h-64 bg-slate-200 rounded-2xl"></div>
                            </div>
                        ) : (
                            <>
                                {/* Why Choose */}
                                <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                                        <Award className="text-blue-600" />
                                        Why Choose This Course?
                                    </h2>
                                    <p className="text-slate-600 leading-relaxed">
                                        {course.whyChoose}
                                    </p>
                                </section>

                                {/* What You Will Learn */}
                                {course.whatLearn && course.whatLearn.length > 0 && (
                                    <section className="bg-white rounded-2xl p-5 md:p-6 shadow-sm">
                                        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                                            <BookOpen className="text-blue-600" />
                                            What Will You Learn?
                                        </h2>
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            {course.whatLearn.map((item, index) => (
                                                item && (
                                                    <div key={index} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                                                        <div className="mt-1 min-w-[20px]">
                                                            <CheckCircle2 size={20} className="text-green-500" />
                                                        </div>
                                                        <span className="text-slate-700 font-medium">{item}</span>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {loading ? (
                            // Sidebar Skeletons
                            <div className="space-y-8 animate-pulse">
                                <div className="h-64 bg-slate-800 rounded-2xl opacity-10"></div>
                                <div className="h-48 bg-slate-200 rounded-2xl"></div>
                            </div>
                        ) : (
                            <>
                                {/* Why Vrundavan */}
                                {course.whyUs && course.whyUs.length > 0 && (
                                    <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl">
                                        <h3 className="text-xl font-bold mb-6">Why Vrundavan Computers?</h3>
                                        <ul className="space-y-4">
                                            {course.whyUs.map((item, index) => (
                                                item && (
                                                    <li key={index} className="flex items-start gap-3 opacity-90">
                                                        <CheckCircle2 size={18} className="text-blue-400 mt-1 shrink-0" />
                                                        <span>{item}</span>
                                                    </li>
                                                )
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Who Should Enroll */}
                                {course.whoEnroll && course.whoEnroll.length > 0 && (
                                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
                                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                            <Users className="text-blue-600" />
                                            Who Should Enroll?
                                        </h3>
                                        <ul className="space-y-3">
                                            {course.whoEnroll.map((item, index) => (
                                                item && (
                                                    <li key={index} className="flex items-center gap-3 text-slate-600">
                                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                        {item}
                                                    </li>
                                                )
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white text-center">
                                    <h3 className="text-xl font-bold mb-2">Ready to Start?</h3>
                                    <p className="mb-6 opacity-90 text-sm">Join us today and boost your career with practical skills.</p>
                                    <Link to="/contact" className="inline-block w-full bg-white text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors">
                                        Enquire Now
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetails;
