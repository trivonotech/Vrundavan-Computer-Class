import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight, Filter, Loader2 } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const Gallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    // Map Firestore fields to expected props (src instead of image, title instead of text)
                    src: doc.data().image,
                    title: doc.data().text,
                    category: doc.data().category || 'General',
                    ...doc.data()
                }));
                // We map 'image' to 'src' and 'text' to 'title' to match existing UI code
                setImages(data);
            } catch (error) {
                console.error("Error fetching gallery:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGallery();
    }, []);

    // Dynamic Categories
    const categories = ['All', ...new Set(images.map(img => img.category).filter(Boolean))];

    useEffect(() => {
        if (selectedImage) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [selectedImage]);

    const filteredImages = activeCategory === 'All'
        ? images
        : images.filter(img => img.category === activeCategory);

    const openLightbox = (image) => setSelectedImage(image);
    const closeLightbox = () => setSelectedImage(null);

    const handlePrev = (e) => {
        e.stopPropagation();
        const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
        const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
        setSelectedImage(filteredImages[prevIndex]);
    };

    const handleNext = (e) => {
        e.stopPropagation();
        const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
        const nextIndex = (currentIndex + 1) % filteredImages.length;
        setSelectedImage(filteredImages[nextIndex]);
    };

    return (
        <div className="min-h-screen py-6 md:py-12">
            <div className="max-w-screen-xl mx-auto px-4">
                {loading ? (
                    <div className="flex items-center justify-center min-h-[50vh]">
                        <Loader2 className="animate-spin text-blue-600" size={40} />
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="text-center mb-8 md:mb-12 space-y-4">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Campus Gallery</h1>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                A visual journey through our campus, vibrant events, and student life. Experience the spirit of SkillNest.
                            </p>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap justify-center gap-3 mb-8 md:mb-12">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${activeCategory === cat
                                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                                        : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-blue-600 shadow-sm'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                            {filteredImages.map((image) => (
                                <div
                                    key={image.id}
                                    onClick={() => openLightbox(image)}
                                    className="group relative cursor-pointer overflow-hidden rounded-2xl shadow-md bg-slate-200 aspect-square"
                                >
                                    <img
                                        src={image.src}
                                        alt={image.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-blue-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <div className="text-center p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            <ZoomIn className="w-8 h-8 text-white mx-auto mb-2" />
                                            <h3 className="text-white font-bold text-lg">{image.title}</h3>
                                            <p className="text-blue-100 text-sm">{image.category}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Lightbox */}
                        {selectedImage && (
                            <div
                                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-fade-in"
                                onClick={closeLightbox}
                            >
                                <button
                                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                                    onClick={closeLightbox}
                                >
                                    <X size={40} />
                                </button>

                                <button
                                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm z-10"
                                    onClick={handlePrev}
                                >
                                    <ChevronLeft size={32} className="md:w-12 md:h-12" />
                                </button>

                                <div className="relative max-w-5xl max-h-[85vh] w-full" onClick={e => e.stopPropagation()}>
                                    <img
                                        src={selectedImage.src}
                                        alt={selectedImage.title}
                                        className="w-full h-full object-contain rounded-lg shadow-2xl"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white rounded-b-lg">
                                        <h3 className="text-xl font-bold">{selectedImage.title}</h3>
                                        <p className="text-gray-300">{selectedImage.category}</p>
                                    </div>
                                </div>

                                <button
                                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm z-10"
                                    onClick={handleNext}
                                >
                                    <ChevronRight size={32} className="md:w-12 md:h-12" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Gallery;
