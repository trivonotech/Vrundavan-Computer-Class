import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Search, Loader2, X, Upload, BookOpen } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase';

const AdminCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    // Form State
    const initialFormState = {
        title: '',
        category: 'Technology',
        description: '',
        duration: '',
        fees: '',
        image: ''
    };
    const [formData, setFormData] = useState(initialFormState);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const courseData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCourses(courseData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

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

    const handleOpenModal = (course = null) => {
        if (course) {
            setEditingCourse(course);
            setFormData({
                title: course.title,
                category: course.category,
                description: course.description,
                duration: course.duration || '',
                fees: course.fees || '',
                image: course.image
            });
            setPreviewUrl(course.image);
        } else {
            setEditingCourse(null);
            setFormData(initialFormState);
            setPreviewUrl('');
        }
        setSelectedFile(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            let imageUrl = formData.image;
            let storagePath = editingCourse?.storagePath || '';

            // Handle Image Upload if new file selected
            if (selectedFile) {
                const newStoragePath = `courses/${Date.now()}_${selectedFile.name}`;
                const storageRef = ref(storage, newStoragePath);
                const snapshot = await uploadBytes(storageRef, selectedFile);
                imageUrl = await getDownloadURL(snapshot.ref);
                storagePath = snapshot.metadata.fullPath;
            }

            const courseData = {
                ...formData,
                image: imageUrl,
                storagePath,
                updatedAt: new Date()
            };

            if (editingCourse) {
                // Update
                await updateDoc(doc(db, "courses", editingCourse.id), courseData);
            } else {
                // Create
                await addDoc(collection(db, "courses"), {
                    ...courseData,
                    createdAt: new Date()
                });
            }

            setShowModal(false);
        } catch (error) {
            console.error("Error saving course:", error);
            alert("Failed to save course. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (course) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;

        try {
            await deleteDoc(doc(db, "courses", course.id));
            if (course.storagePath) {
                const storageRef = ref(storage, course.storagePath);
                await deleteObject(storageRef);
            }
        } catch (error) {
            console.error("Error deleting course:", error);
            alert("Failed to delete course.");
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manage Courses</h1>
                    <p className="text-slate-500">Add, edit, or remove courses offered by the institute.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                    <Plus size={20} />
                    Add New Course
                </button>
            </div>

            {/* Courses List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length > 0 ? (
                    courses.map((course) => (
                        <div key={course.id} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all flex flex-col">
                            <div className="relative h-48 bg-slate-100 overflow-hidden">
                                <img
                                    src={course.image}
                                    alt={course.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-blue-600">
                                    {course.category}
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{course.title}</h3>
                                <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">{course.description}</p>

                                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-50">
                                    <button
                                        onClick={() => handleOpenModal(course)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
                                    >
                                        <Edit2 size={16} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(course)}
                                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-16 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <BookOpen size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No Courses Found</h3>
                        <p className="text-slate-500 mb-6">Get started by adding your first course.</p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="text-blue-600 font-semibold hover:underline"
                        >
                            Add Course Now
                        </button>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h3 className="font-bold text-xl text-slate-900">
                                {editingCourse ? 'Edit Course' : 'Add New Course'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Image Upload */}
                                <div className="w-full md:w-1/3">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Course Image</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="course-image"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                        />
                                        <label
                                            htmlFor="course-image"
                                            className={`flex flex-col items-center justify-center w-full aspect-[4/3] border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden ${previewUrl ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                                                }`}
                                        >
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center text-slate-500 p-4">
                                                    <Upload className="mx-auto mb-2 text-slate-400" size={24} />
                                                    <span className="text-xs font-medium">Upload Image</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                {/* Main Fields */}
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Course Title</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g. Web Development Bootcamp"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        >
                                            <option>Technology</option>
                                            <option>Design</option>
                                            <option>Marketing</option>
                                            <option>Business</option>
                                            <option>Data</option>
                                            <option>Arts</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    rows="4"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Course details, learning outcomes..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    required
                                ></textarea>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Duration (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        placeholder="e.g. 3 Months"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Fees (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.fees}
                                        onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                                        placeholder="e.g. ₹5000"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading || (!selectedFile && !editingCourse?.image)}
                                    className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isUploading ? <Loader2 className="animate-spin" /> : (editingCourse ? 'Save Changes' : 'Create Course')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCourses;
