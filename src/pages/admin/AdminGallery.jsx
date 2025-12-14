import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink, Loader2, X, Upload } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

const AdminGallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form State
    const [newImageTitle, setNewImageTitle] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

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
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile || !newImageTitle) return;

        setIsUploading(true);
        try {
            // 1. Optimize Image (WebP + Resize)
            const updatedImageBase64 = await optimizeImage(selectedFile);

            // 2. Save DIRECTLY to Firestore (No Storage needed)
            await addDoc(collection(db, "gallery"), {
                text: newImageTitle,
                image: updatedImageBase64, // Storing Base64 string
                createdAt: new Date()
            });

            setShowAddModal(false);
            setNewImageTitle('');
            setSelectedFile(null);
            setPreviewUrl('');
        } catch (error) {
            console.error("Error uploading image:", error);
            alert(error.message || "Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (image) => {
        if (!window.confirm("Are you sure you want to delete this image?")) return;

        try {
            // Delete from Firestore only
            await deleteDoc(doc(db, "gallery", image.id));
        } catch (error) {
            console.error("Error deleting image:", error);
            alert("Failed to delete image.");
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Campus Life Gallery</h1>
                    <p className="text-slate-500">Manage images shown in the circular gallery on home page.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                    <Plus size={20} />
                    Add New Image
                </button>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images.length > 0 ? (
                    images.map((img) => (
                        <div key={img.id} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all">
                            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                                <img
                                    src={img.image}
                                    alt={img.text}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <a
                                        href={img.image}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20 transition-colors"
                                    >
                                        <ExternalLink size={20} />
                                    </a>
                                </div>
                            </div>
                            <div className="p-4 flex items-center justify-between">
                                <span className="font-medium text-slate-700 truncate pr-2">{img.text}</span>
                                <button
                                    onClick={() => handleDelete(img)}
                                    className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <p>No images in gallery yet.</p>
                    </div>
                )}
            </div>

            {/* Add Image Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-900">Add New Image</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="p-6 space-y-4">
                            {/* Image Upload Area */}
                            <div className="relative">
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                />
                                <label
                                    htmlFor="file-upload"
                                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all ${previewUrl ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                                        }`}
                                >
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg p-2" />
                                    ) : (
                                        <div className="text-center text-slate-500">
                                            <Upload className="mx-auto mb-2 text-slate-400" size={32} />
                                            <span className="text-sm font-medium">Click to upload image</span>
                                        </div>
                                    )}
                                </label>
                            </div>

                            {/* Title Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Image Title / Caption</label>
                                <input
                                    type="text"
                                    value={newImageTitle}
                                    onChange={(e) => setNewImageTitle(e.target.value)}
                                    placeholder="e.g. Annual Function 2024"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isUploading || !selectedFile}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isUploading ? <Loader2 className="animate-spin" /> : 'Upload Image'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminGallery;
