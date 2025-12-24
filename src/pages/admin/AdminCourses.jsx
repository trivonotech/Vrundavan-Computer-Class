import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Search, Loader2, X, Upload, BookOpen, PlusCircle, MinusCircle } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

// Helper Component for List Inputs
const ListInput = ({ label, items = [], onChange, placeholder }) => {
    const handleAdd = () => {
        onChange([...items, '']);
    };

    const handleRemove = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(newItems);
    };

    const handleChange = (index, value) => {
        const newItems = [...items];
        newItems[index] = value;
        onChange(newItems);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={index} className="flex gap-2">
                        <input
                            type="text"
                            value={item}
                            onChange={(e) => handleChange(index, e.target.value)}
                            placeholder={placeholder}
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                        <button
                            type="button"
                            onClick={() => handleRemove(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={handleAdd}
                    className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700 px-2 py-1"
                >
                    <PlusCircle size={16} /> Add Item
                </button>
            </div>
        </div>
    );
};

const AdminCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Form State
    const initialFormState = {
        title: '',
        category: 'Technology',
        description: '', // Short description
        fullDescription: '',
        whyChoose: '',
        objective: '',
        whyUs: [''],
        whatLearn: [''],
        whoEnroll: [''],
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
                ...doc.data(),
                id: doc.id
            }));
            setCourses(courseData);
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
                    const MAX_WIDTH = 800;
                    const scaleSize = MAX_WIDTH / img.width;
                    const width = (img.width > MAX_WIDTH) ? MAX_WIDTH : img.width;
                    const height = (img.width > MAX_WIDTH) ? (img.height * scaleSize) : img.height;

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const compressedDataUrl = canvas.toDataURL('image/webp', 0.7);

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

    const handleOpenModal = (course = null) => {
        if (course) {
            setEditingCourse(course);
            setFormData({
                title: course.title || '',
                category: course.category || 'Technology',
                description: course.description || '', // Short
                fullDescription: course.fullDescription || '',
                whyChoose: course.whyChoose || '',
                objective: course.objective || '',
                whyUs: course.whyUs || [''],
                whatLearn: course.whatLearn || [''],
                whoEnroll: course.whoEnroll || [''],
                duration: course.duration || '',
                fees: course.fees || '',
                image: course.image || ''
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

            // Handle Image Upload if new file selected
            if (selectedFile) {
                // Convert to WebP Base64
                imageUrl = await optimizeImage(selectedFile);
            }

            const courseData = {
                ...formData,
                image: imageUrl,
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
            alert(error.message || "Failed to save course. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = (course) => {
        setDeleteTarget(course);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            await deleteDoc(doc(db, "courses", deleteTarget.id));
            setDeleteTarget(null);
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

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="text-red-600" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Course?</h3>
                            <p className="text-slate-500 text-sm mb-6">
                                Are you sure you want to delete <strong>{deleteTarget.title}</strong>? This action cannot be undone.
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                            >
                                                <option>Technology</option>
                                                <option>Accounting & Finance</option>
                                                <option>Communication Skills</option>
                                                <option>Design</option>
                                                <option>Marketing</option>
                                                <option>Business</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                                            <input
                                                type="text"
                                                value={formData.duration}
                                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                placeholder="e.g. 3 Months"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
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
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Short Description (Card View)</label>
                                    <textarea
                                        rows="2"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief summary for the course card..."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                        required
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Description (Detail Page)</label>
                                    <textarea
                                        rows="4"
                                        value={formData.fullDescription}
                                        onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                                        placeholder="Detailed course introduction..."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    ></textarea>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Objective</label>
                                        <textarea
                                            rows="3"
                                            value={formData.objective}
                                            onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                                            placeholder="Course objective..."
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Why Choose This Course?</label>
                                        <textarea
                                            rows="3"
                                            value={formData.whyChoose}
                                            onChange={(e) => setFormData({ ...formData, whyChoose: e.target.value })}
                                            placeholder="Why should students pick this?"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl">
                                    <ListInput
                                        label="What Will You Learn? (Syllabus)"
                                        items={formData.whatLearn}
                                        onChange={(newItems) => setFormData({ ...formData, whatLearn: newItems })}
                                        placeholder="e.g. Basic Computer Concepts"
                                    />
                                    <ListInput
                                        label="Why Us? (Benefits)"
                                        items={formData.whyUs}
                                        onChange={(newItems) => setFormData({ ...formData, whyUs: newItems })}
                                        placeholder="e.g. Experienced Faculty"
                                    />
                                    <div className="md:col-span-2">
                                        <ListInput
                                            label="Who Should Enroll? (Target Audience)"
                                            items={formData.whoEnroll}
                                            onChange={(newItems) => setFormData({ ...formData, whoEnroll: newItems })}
                                            placeholder="e.g. Students, Professionals"
                                        />
                                    </div>
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
