import React from 'react';

const courses = [
    { id: 1, title: 'Web Development Bootcamp', category: 'Technology', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1744&q=80', description: 'Master full-stack web development with React, Node.js, and more.' },
    { id: 2, title: 'Digital Marketing Mastery', category: 'Marketing', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2015&q=80', description: 'Learn SEO, social media marketing, and content strategy.' },
    { id: 3, title: 'Graphic Design Essentials', category: 'Design', image: 'https://images.unsplash.com/photo-1626785774573-4b7993125651?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80', description: 'Create stunning visuals using Photoshop, Illustrator, and Figma.' },
    { id: 4, title: 'Data Science Fundamentals', category: 'Data', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80', description: 'Analyze data and build predictive models with Python.' },
    { id: 5, title: 'Business Management', category: 'Business', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80', description: 'Develop leadership skills and understand business operations.' },
    { id: 6, title: 'Photography Basics', category: 'Arts', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', description: 'Capture the world with professional photography techniques.' },
];

const Courses = () => {
    return (
        <div className="min-h-screen py-12">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="text-center mb-12 space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Our Courses</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">Explore our diverse range of courses designed to empower you with the skills needed for today's competitive world.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                    {courses.map((course) => (
                        <div key={course.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-slate-100">
                            <img src={course.image} alt={course.title} className="w-full h-32 md:h-48 object-cover" />
                            <div className="p-4 md:p-6">
                                <span className="text-[10px] md:text-xs font-semibold text-blue-600 bg-blue-50 px-2 md:px-3 py-1 rounded-full">{course.category}</span>
                                <h3 className="text-sm md:text-xl font-bold text-slate-900 mt-2 md:mt-3 mb-1 md:mb-2 line-clamp-2 md:line-clamp-none leading-tight">{course.title}</h3>
                                <p className="text-slate-600 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2 md:line-clamp-none">{course.description}</p>
                                <button className="w-full py-1.5 md:py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-xs md:text-base font-medium transition-colors">
                                    Learn More
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Courses;
