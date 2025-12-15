import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, BookOpen, Users, Image as ImageIcon, Briefcase, Phone, Clock, Award, LayoutGrid, Laptop, Calculator, Quote } from 'lucide-react';
import CircularGallery from '../components/CircularGallery';
import { collection, getDocs, query, orderBy, limit, doc, getDoc, where } from 'firebase/firestore';
import { db } from "../firebase";

const Home = () => {
    const [stats, setStats] = useState({
        experience: '21+',
        events: '150+',
        students: '12k+',
        courses: '25+'
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const docRef = doc(db, "settings", "stats");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setStats(docSnap.data());
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };
        fetchStats();
    }, []);

    const [galleryItems, setGalleryItems] = useState([]);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                // Fetch featured images. 
                // Note: We filter by 'featured' == true.
                // We sort in-app to avoid needing a custom composite index immediately.
                const q = query(collection(db, "gallery"), where("featured", "==", true));
                const snapshot = await getDocs(q);
                let items = snapshot.docs.map(doc => ({
                    image: doc.data().image,
                    text: doc.data().text,
                    createdAt: doc.data().createdAt
                }));

                // Sort by createdAt desc in memory
                items.sort((a, b) => {
                    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
                    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
                    return dateB - dateA;
                });

                // Limit to 15
                if (items.length > 15) {
                    items = items.slice(0, 15);
                }

                if (items.length > 0) {
                    setGalleryItems(items);
                }
            } catch (error) {
                console.error("Error fetching gallery:", error);
            }
        };

        fetchGallery();
    }, []);
    return (
        <div className="relative overflow-hidden">

            {/* Hero Section */}
            <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:100px_100px]"></div>

                <div className="max-w-screen-xl mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-12 items-center h-full">
                    <div className="text-white space-y-8 pb-12 md:pb-0">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium">
                            <span>🎓</span> Transforming Skills Into Success
                        </div>
                        <h1 className="text-3xl md:text-6xl font-bold leading-tight">
                            <span className="text-xl md:text-4xl text-yellow-300">THE</span> LEADING&nbsp;COMPUTER <br /> INSTITUTE IN KESHOD.
                        </h1>
                        <p className="text-lg text-blue-100 max-w-lg">
                            Join a new era of education where innovation meets knowledge. Discover expert-led courses, practical skills, and limitless opportunities to achieve your goals.
                        </p>

                        <div className="flex flex-wrap gap-4 mt-8">
                            <Link
                                to="/courses"
                                className="inline-flex items-center px-8 py-4 text-base font-bold text-blue-600 bg-white rounded-full shadow-lg hover:bg-blue-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                Explore Courses <ArrowRight size={20} className="ml-2" />
                            </Link>
                        </div>

                        <div className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl max-w-lg mt-8">
                            <p className="text-blue-50 font-medium text-sm leading-relaxed">
                                <span className="text-yellow-300 font-bold">SINCE 2004</span>, VRUNDAVAN COMPUTERS IS WORKING AS COMPUTERS INSTITUTE IN KESHOD AND PROVIDE BEST KNOWLEDGE IN SOCIETY
                            </p>
                        </div>
                    </div>

                </div>
                <div className="absolute bottom-0 right-12 hidden md:block w-[45%] lg:w-[40%] xl:w-[35%] h-auto max-h-[90%] z-0 pointer-events-none">
                    <img
                        src="/assets/image-from-rawpixel-id-15542696-png.webp"
                        alt="Student"
                        className="w-full h-full object-contain object-bottom drop-shadow-2xl"
                    />
                    {/* Decorative elements - Adjusted Position */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/20 blur-[100px] -z-10 rounded-full"></div>
                </div>

            </section >

            {/* Preview Sections */}
            <div className="max-w-screen-xl mx-auto px-4 py-8 space-y-6">

                {/* Courses Preview */}
                {/* Courses Section - Premium Cards */}
                <section id="courses" className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Computer Basic */}
                    <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-blue-500 hover:-translate-y-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <LayoutGrid size={100} className="text-blue-500 transform rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <LayoutGrid size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">Computer Basic</h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                In this Course, we provide basic knowledge of computer to students. It very usefull to all students for its daily work and study.
                            </p>
                            <div className="flex items-center text-blue-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                Learn More <ArrowRight size={16} className="ml-2" />
                            </div>
                        </div>
                    </div>

                    {/* Govt. Approved CCC */}
                    <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-purple-500 hover:-translate-y-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Laptop size={100} className="text-purple-500 transform rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-50 text-purple-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Laptop size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-purple-600 transition-colors">Govt. Approved CCC</h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                CCC course is compulsory to all students who want to join Goverment Job. We provide Goverment approved Certificate.
                            </p>
                            <div className="flex items-center text-purple-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                Learn More <ArrowRight size={16} className="ml-2" />
                            </div>
                        </div>
                    </div>

                    {/* Tally Prime */}
                    <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-orange-500 hover:-translate-y-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Calculator size={100} className="text-orange-500 transform rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-50 text-orange-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Calculator size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">Tally Prime</h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                Tally is leading software in accounting industry. We provide deep knowledge of Tally to Our students. our Students can maintain Company Account.
                            </p>
                            <div className="flex items-center text-orange-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                Learn More <ArrowRight size={16} className="ml-2" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Management Preview */}
                <section className="grid md:grid-cols-2 gap-12 items-center bg-white/90 rounded-3xl p-8 md:p-12 shadow-sm">
                    <div className="space-y-6">
                        <div className="inline-block p-3 rounded-xl bg-purple-100 text-purple-600"><Briefcase size={24} /></div>
                        <h2 className="text-3xl font-bold text-slate-900">Meet Our Management</h2>
                        <p className="text-slate-600">
                            Our visionary leaders are dedicated to providing the best educational environment. Learn more about the minds behind SkillNest.
                        </p>
                        <Link to="/management" className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700">
                            Meet the Leaders <ArrowRight size={20} className="ml-2" />
                        </Link>
                    </div>
                    <div>
                        <img
                            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                            alt="Management"
                            className="rounded-2xl shadow-lg"
                            loading="lazy"
                        />
                    </div>
                </section>

                {/* Stats Section */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4 gap-y-8 py-4 animate-fade-in-up">
                    <div className="text-center space-y-2 md:border-r md:border-blue-900">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 mb-1 shadow-sm">
                            <Clock size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{stats.experience}</h3>
                        <p className="text-slate-600 font-medium text-xs">Years of Experience</p>
                    </div>
                    <div className="text-center space-y-2 md:border-r md:border-blue-900">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 mb-1 shadow-sm">
                            <Award size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{stats.events}</h3>
                        <p className="text-slate-600 font-medium text-xs">Events Completed</p>
                    </div>
                    <div className="text-center space-y-2 md:border-r md:border-blue-900">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 mb-1 shadow-sm">
                            <Users size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{stats.students}</h3>
                        <p className="text-slate-600 font-medium text-xs">Students</p>
                    </div>
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600 mb-1 shadow-sm">
                            <BookOpen size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{stats.courses}</h3>
                        <p className="text-slate-600 font-medium text-xs">Courses</p>
                    </div>
                </section>

                {/* Mission & Vision Section */}
                <section className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform"></div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 mb-4">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <Award size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
                            </div>
                            <p className="text-slate-600 leading-relaxed">
                                The mission of our institute is to provide all students with a high quality education that enables them to be contributing members of a multiethnic, multicultural, pluralistic society. We seek to create an environment that achieves equity for all students and ensure that each student is a successful learner, is fully respected, and learns to respect others.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform"></div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 mb-4">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                    <BookOpen size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Our Vision</h2>
                            </div>
                            <p className="text-slate-600 leading-relaxed">
                                We are a forward-thinking institute aiming to prepare our students for a rapidly changing world by equipping them with critical thinking skills, global perspective, and respect for core values of honesty, integrity, loyalty, and compassion.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Director Message Section */}
                <section className="relative">
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 relative overflow-hidden">
                        {/* Decorative Quote Mark */}
                        <div className="absolute top-6 right-6 text-blue-50 opacity-50 z-0">
                            <Quote size={100} />
                        </div>

                        <div className="relative z-10 grid md:grid-cols-[auto_1fr] gap-6 md:gap-10 items-start">
                            {/* Image Column */}
                            <div className="flex flex-col items-center md:items-start shrink-0">
                                <div className="w-48 h-56 md:w-56 md:h-64 rounded-2xl border-4 border-white shadow-lg overflow-hidden mb-4 relative z-10 ring-1 ring-slate-100">
                                    <img
                                        src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                        alt="Director"
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="text-center md:text-center w-full">
                                    <h3 className="text-xl font-bold text-slate-900">Dr. Robert Fox</h3>
                                    <p className="text-blue-600 font-medium text-sm">Director</p>
                                </div>
                            </div>

                            {/* Content Column */}
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="h-px w-8 bg-blue-600"></span>
                                        <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">Director's Message</span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Welcoming Future Leaders</h2>
                                </div>

                                <div className="space-y-3 text-slate-600 leading-relaxed text-lg font-serif">
                                    <p>
                                        Dear students,
                                    </p>
                                    <p>
                                        Congratulations on joining the <span className="text-blue-700 font-semibold bg-blue-50 px-1 rounded">VRUNDAVAN COMPUTERS FAMILY</span>. On behalf of the institute, I welcome you to Vrundavan Computers, a place where we celebrate youth and excellence and attempt to transform young persons into adults with a sense of social responsibility, human values and concern for environment.
                                    </p>
                                    <p>
                                        We not only strive to train the students to become excellent scientists, technologists, thinkers and leaders of the society, but also help them mould themselves into better human beings.
                                    </p>
                                </div>

                                <div className="pt-2 flex items-center gap-4">
                                    <div className="h-px flex-1 bg-slate-100"></div>
                                    <p className="font-dancing text-2xl text-slate-400 select-none transform -rotate-2">Robert Fox</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Gallery Preview */}
                <section className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white text-center space-y-8">
                    <div className="flex items-center justify-center gap-4">
                        <div className="p-3 rounded-xl bg-white/10 text-white"><ImageIcon size={24} /></div>
                        <h2 className="text-3xl font-bold">Campus Life Gallery</h2>
                    </div>
                    <p className="text-slate-300 max-w-2xl mx-auto">
                        Take a glimpse into the vibrant life at SkillNest. Our gallery showcases events, classrooms, and student activities.
                    </p>
                    <div style={{ height: '350px', position: 'relative', marginTop: '-30px', marginBottom: '-80px' }}>
                        {galleryItems.length > 0 && (
                            <CircularGallery
                                items={galleryItems}
                                bend={0.5}
                                textColor="#ffffff"
                                borderRadius={0.05}
                                scrollSpeed={1}
                                scrollEase={0.05}
                                planeScale={1}
                                yOffset={1.0}
                            />
                        )}
                    </div>
                    <Link to="/gallery" className="relative z-10 inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition-colors">
                        View Full Gallery
                    </Link>
                </section>

                {/* Team Preview */}
                <section className="grid md:grid-cols-2 gap-12 items-center bg-white/90 rounded-3xl p-8 md:p-12 shadow-sm">
                    <div className="order-2 md:order-1">
                        <img
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                            alt="Team"
                            className="rounded-2xl shadow-lg"
                            loading="lazy"
                        />
                    </div>
                    <div className="order-1 md:order-2 space-y-6">
                        <div className="inline-block p-3 rounded-xl bg-green-100 text-green-600"><Users size={24} /></div>
                        <h2 className="text-3xl font-bold text-slate-900">Our Expert Team</h2>
                        <p className="text-slate-600">
                            Our faculty comprises industry experts and passionate educators committed to your success. Get to know the people who will guide your journey.
                        </p>
                        <Link to="/team" className="inline-flex items-center text-green-600 font-semibold hover:text-green-700">
                            See All Members <ArrowRight size={20} className="ml-2" />
                        </Link>
                    </div>
                </section>

                {/* Contact Preview */}
                <section className="text-center space-y-8 bg-blue-50/60 backdrop-blur-sm rounded-3xl p-12">
                    <div className="flex items-center justify-center gap-3">
                        <div className="p-3 rounded-xl bg-blue-100 text-blue-600"><Phone size={24} /></div>
                        <h2 className="text-3xl font-bold text-slate-900">Get in Touch</h2>
                    </div>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Have questions? We're here to help! Reach out to us for admissions, course details, or any other inquiries.
                    </p>
                    <Link to="/contact" className="inline-block bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-full font-medium transition-colors">
                        Contact Us Now
                    </Link>
                </section>

            </div >
        </div >
    );
};

export default Home;
