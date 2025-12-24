import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink, Loader2, X, Upload, Edit2, ChevronDown, Star } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

const AdminGallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false); // Dropdown state
    const [activeCategory, setActiveCategory] = useState('All');
    const [editingImage, setEditingImage] = useState(null); // ID of image being edited

    // Form State
    const [formData, setFormData] = useState({
        text: '',
        category: ''
    });
    const [selectedFiles, setSelectedFiles] = useState([]); // Array of files
    const [previewUrls, setPreviewUrls] = useState([]);     // Array of preview strings

    useEffect(() => {
        const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const galleryData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setImages(galleryData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Extract unique categories for filter and suggestions
    const categories = ['All', ...new Set(images.map(img => img.category).filter(Boolean))];

    // Helper: Convert to WebP & Compress
    const optimizeImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800; // Resize to max 800px width
                    const scaleSize = MAX_WIDTH / img.width;
                    const width = (img.width > MAX_WIDTH) ? MAX_WIDTH : img.width;
                    const height = (img.width > MAX_WIDTH) ? (img.height * scaleSize) : img.height;

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to WebP with 0.7 quality
                    const compressedDataUrl = canvas.toDataURL('image/webp', 0.7);

                    // Check size (must be < 1MB for Firestore)
                    if (compressedDataUrl.length > 1000000) {
                        reject(new Error("Image is too large even after compression. Please pick a smaller image."));
                    } else {
                        resolve(compressedDataUrl);
                    }
                };
                img.onerror = (error) => reject(error);
            };
        });
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            // For Edit mode, we only allow one file replacement
            if (editingImage) {
                setSelectedFiles([files[0]]);
                const reader = new FileReader();
                reader.onloadend = () => setPreviewUrls([reader.result]);
                reader.readAsDataURL(files[0]);
            } else {
                // Add mode: Append new files (or replace? Let's generic append for now, or just replace set)
                // Replacing set is standard for input type=file unless we build a complex UI
                setSelectedFiles(files);

                const newPreviews = [];
                let loadedCount = 0;
                files.forEach(file => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        newPreviews.push(reader.result);
                        loadedCount++;
                        if (loadedCount === files.length) {
                            setPreviewUrls(newPreviews);
                        }
                    };
                    reader.readAsDataURL(file);
                });
            }
        }
    };

    const handleOpenModal = (image = null) => {
        if (image) {
            setEditingImage(image);
            setFormData({
                text: image.text,
                category: image.category || ''
            });
            setPreviewUrls([image.image]);
            setSelectedFiles([]);
        } else {
            setEditingImage(null);
            setFormData({ text: '', category: '' });
            setPreviewUrls([]);
            setSelectedFiles([]);
        }
        setShowModal(true);
        setShowSuggestions(false);
    };

    const toggleFeatured = async (image) => {
        try {
            const newStatus = !image.featured;
            await updateDoc(doc(db, "gallery", image.id), {
                featured: newStatus
            });
        } catch (error) {
            console.error("Error updating featured status:", error);
            alert("Failed to update status");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // if (!formData.text) return; // Validation removed

        setIsUploading(true);
        try {
            const category = formData.category || 'General';

            if (editingImage) {
                // EDIT MODE (Single logic)
                let imageUrl = previewUrls[0]; // Default to existing image if no new file selected
                if (selectedFiles.length > 0) {
                    imageUrl = await optimizeImage(selectedFiles[0]);
                }

                await updateDoc(doc(db, "gallery", editingImage.id), {
                    text: '',
                    category: category,
                    image: imageUrl,
                    updatedAt: new Date()
                });

            } else {
                // ADD MODE (Batch Upload)
                if (selectedFiles.length === 0) {
                    alert("Please select at least one image");
                    setIsUploading(false);
                    return;
                }

                // Process all files in parallel
                const uploadPromises = selectedFiles.map(async (file) => {
                    const imageUrl = await optimizeImage(file);
                    return addDoc(collection(db, "gallery"), {
                        text: '',
                        category: category,
                        image: imageUrl,
                        featured: false, // Default to not featured
                        createdAt: new Date()
                    });
                });

                await Promise.all(uploadPromises);
            }

            setShowModal(false);
            setFormData({ text: '', category: '' });
            setSelectedFiles([]);
            setPreviewUrls([]);
        } catch (error) {
            console.error("Error saving image:", error);
            alert(error.message || "Failed to save image(s). Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const [deleteTarget, setDeleteTarget] = useState(null); // Image to delete

    const handleDelete = (image) => {
        setDeleteTarget(image);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteDoc(doc(db, "gallery", deleteTarget.id));
            setDeleteTarget(null);
        } catch (error) {
            console.error("Error deleting image:", error);
            alert("Failed to delete image.");
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
    }

    const filteredImages = activeCategory === 'All'
        ? images
        : images.filter(img => img.category === activeCategory);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Campus Life Gallery</h1>
                    <p className="text-slate-500">Manage images shown in the circular gallery on home page.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                    <Plus size={20} />
                    Add New Image
                </button>
            </div>

            {/* Filter Tabs */}
            {categories.length > 1 && (
                <div className="flex flex-wrap gap-2 pb-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredImages.length > 0 ? (
                    filteredImages.map((img) => (
                        <div key={img.id} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all">
                            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                                <img
                                    src={img.image}
                                    alt={img.text}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-xs font-medium text-white">
                                    {img.category || 'General'}
                                </div>
                                {/* Featured Badge/Indicator if needed, or primarily reliance on the button state */}
                                {img.featured && (
                                    <div className="absolute top-2 right-2 bg-yellow-400 text-white p-1 rounded-full shadow-lg z-10">
                                        <Star size={12} fill="currentColor" />
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex items-center justify-between">
                                <span className="font-medium text-slate-700 truncate pr-2"></span>
                                <div className="flex gap-2 w-full justify-between">
                                    <button
                                        onClick={() => toggleFeatured(img)}
                                        className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-all ${img.featured
                                            ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                            }`}
                                    >
                                        <Star size={18} fill={img.featured ? "currentColor" : "none"} className={img.featured ? "text-yellow-500" : ""} />
                                        {img.featured ? 'Featured' : 'Feature'}
                                    </button>

                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleOpenModal(img)}
                                            className="text-slate-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                                            title="Edit"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(img)}
                                            className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <p>No images found in this category.</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="text-red-600" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Image?</h3>
                            <p className="text-slate-500 text-sm mb-6">
                                Are you sure you want to delete this image? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-md hover:shadow-lg"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-900">{editingImage ? 'Edit Image' : 'Add New Image'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Image Upload Area */}
                            <div className="relative">
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    accept="image/*"
                                    multiple // Allow multiple selection
                                    onChange={handleFileSelect}
                                />
                                <label
                                    htmlFor="file-upload"
                                    className={`flex flex-col items-center justify-center w-full min-h-[160px] rounded-xl cursor-pointer transition-all overflow-hidden ${previewUrls.length > 0 ? 'border-2 border-blue-500 bg-slate-50 relative' : 'border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                                        }`}
                                >
                                    {previewUrls.length > 0 ? (
                                        <div className="w-full h-full">
                                            {previewUrls.length === 1 ? (
                                                <div className="relative w-full aspect-video">
                                                    <img src={previewUrls[0]} alt="Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center group">
                                                        <span className="bg-black/50 text-white px-3 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Change Image</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-2 p-2 w-full">
                                                    {previewUrls.map((url, idx) => (
                                                        <img key={idx} src={url} alt={`Preview ${idx}`} className="w-full h-32 object-cover rounded-lg shadow-sm" />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center text-slate-500 p-4">
                                            <Upload className="mx-auto mb-2 text-slate-400" size={32} />
                                            <span className="text-sm font-medium">Click to select 1 or more images</span>
                                            <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG</p>
                                        </div>
                                    )}
                                </label>
                            </div>

                            {/* Category Input - Custom Dropdown */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Event / Category</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => {
                                            setFormData({ ...formData, category: e.target.value });
                                            setShowSuggestions(true);
                                        }}
                                        onFocus={() => setShowSuggestions(true)}
                                        placeholder="Type or select an event..."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        onClick={() => setShowSuggestions(!showSuggestions)}
                                    >
                                        <ChevronDown size={20} />
                                    </button>
                                </div>

                                {showSuggestions && categories.length > 1 && (
                                    <>
                                        {/* Backdrop to close on click outside */}
                                        <div className="fixed inset-0 z-10" onClick={() => setShowSuggestions(false)} />

                                        <ul className="absolute z-20 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                            {categories.filter(c => c !== 'All').map((cat) => (
                                                <li
                                                    key={cat}
                                                    onClick={() => {
                                                        setFormData({ ...formData, category: cat });
                                                        setShowSuggestions(false);
                                                    }}
                                                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-slate-600 font-medium transition-colors flex items-center gap-2"
                                                >
                                                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                                    {cat}
                                                </li>
                                            ))}
                                            <li className="px-4 py-3 text-xs text-slate-400 border-t border-slate-50 bg-slate-50/50">
                                                Type above to add a new category...
                                            </li>
                                        </ul>
                                    </>
                                )}
                            </div>

                            <div className="flex gap-3">
                                {editingImage && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // Handle delete from modal (optional, but consistent)
                                            setDeleteTarget(editingImage);
                                            setShowModal(false);
                                        }}
                                        className="px-4 py-3 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold transition-all"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={isUploading || (previewUrls.length === 0 && selectedFiles.length === 0)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isUploading ? <Loader2 className="animate-spin" /> : (editingImage ? 'Update Image' : `Upload ${selectedFiles.length > 0 ? selectedFiles.length : ''} Image${selectedFiles.length !== 1 ? 's' : ''}`)}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminGallery;
