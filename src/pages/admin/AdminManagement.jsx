import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X, Loader2, Upload } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

const AdminManagement = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [editingMember, setEditingMember] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        role: '',
        bio: '',
        image: '' // Will store Base64
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        const q = query(collection(db, "management"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMembers(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Helper: Optimize Image
    const optimizeImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 500; // Smaller for profile pics
                    const scaleSize = MAX_WIDTH / img.width;
                    const width = (img.width > MAX_WIDTH) ? MAX_WIDTH : img.width;
                    const height = (img.width > MAX_WIDTH) ? (img.height * scaleSize) : img.height;

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressedDataUrl = canvas.toDataURL('image/webp', 0.8);

                    if (compressedDataUrl.length > 1000000) {
                        reject(new Error("Image too large."));
                    } else {
                        resolve(compressedDataUrl);
                    }
                };
            };
        });
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleOpenModal = (member = null) => {
        if (member) {
            setEditingMember(member);
            setFormData({ name: member.name, role: member.role, bio: member.bio });
            setPreviewUrl(member.image);
        } else {
            setEditingMember(null);
            setFormData({ name: '', role: '', bio: '' });
            setPreviewUrl('');
        }
        setSelectedFile(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            let imageUrl = previewUrl;
            if (selectedFile) {
                imageUrl = await optimizeImage(selectedFile);
            }

            const dataToSave = {
                ...formData,
                image: imageUrl,
                updatedAt: new Date()
            };

            if (editingMember) {
                await updateDoc(doc(db, "management", editingMember.id), dataToSave);
            } else {
                if (!selectedFile) {
                    alert("Image is required");
                    setIsUploading(false);
                    return;
                }
                await addDoc(collection(db, "management"), {
                    ...dataToSave,
                    createdAt: new Date()
                });
            }
            setShowModal(false);
        } catch (error) {
            console.error(error);
            alert("Error saving member");
        }
        setIsUploading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this member?")) {
            await deleteDoc(doc(db, "management", id));
        }
    };

    if (loading) return <Loader2 className="animate-spin mx-auto mt-10" />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Management Team</h1>
                <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={20} /> Add Member
                </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map(member => (
                    <div key={member.id} className="bg-white p-4 rounded-xl shadow border flex gap-4 items-start relative group">
                        <img src={member.image} alt={member.name} className="w-16 h-16 rounded-full object-cover bg-slate-100" />
                        <div className="flex-1">
                            <h3 className="font-bold">{member.name}</h3>
                            <p className="text-sm text-blue-600 font-medium">{member.role}</p>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{member.bio}</p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 bg-white/90 p-1 rounded-lg shadow-sm">
                            <button onClick={() => handleOpenModal(member)} className="text-blue-500 hover:bg-blue-50 p-1 rounded"><Edit size={16} /></button>
                            <button onClick={() => handleDelete(member.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{editingMember ? 'Edit' : 'Add'} Member</h2>
                            <button onClick={() => setShowModal(false)}><X className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex justify-center mb-4">
                                <label className="cursor-pointer relative group">
                                    <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden border-2 border-dashed border-slate-300 flex items-center justify-center">
                                        {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <Upload className="text-slate-400" />}
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                                </label>
                            </div>
                            <input
                                placeholder="Name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-3 border rounded-lg"
                                required
                            />
                            <input
                                placeholder="Role (e.g. Director)"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="w-full p-3 border rounded-lg"
                                required
                            />
                            <textarea
                                placeholder="Bio"
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full p-3 border rounded-lg text-sm"
                                rows="3"
                                required
                            ></textarea>
                            <button type="submit" disabled={isUploading} className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold flex justify-center">
                                {isUploading ? <Loader2 className="animate-spin" /> : 'Save Member'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManagement;
