import React, { useEffect, useState } from 'react';
import { MessageSquare, Clock, Mail, User, Trash2, Loader2, Phone, AlertTriangle } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

const Enquiries = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        const q = query(collection(db, "enquiries"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEnquiries(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = (id) => {
        setDeleteTarget(id);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteDoc(doc(db, "enquiries", deleteTarget));
            setDeleteTarget(null);
        } catch (error) {
            console.error("Error deleting enquiry:", error);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Enquiries</h1>
                    <p className="text-slate-500">View and manage messages from the contact form.</p>
                </div>
                <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium text-sm">
                    {enquiries.length} Total Messages
                </div>
            </div>

            <div className="space-y-4">
                {enquiries.length > 0 ? (
                    enquiries.map((enq) => (
                        <div key={enq.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative group">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Sender Info */}
                                <div className="md:w-1/4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{enq.firstName} {enq.lastName}</h3>
                                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                                <Clock size={12} />
                                                {enq.createdAt?.toDate ? enq.createdAt.toDate().toLocaleString() : 'Date unknown'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg break-all">
                                        <Mail size={14} className="shrink-0" />
                                        {enq.email}
                                    </div>
                                    {enq.phone && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg break-all">
                                            <Phone size={14} className="shrink-0" />
                                            {enq.phone}
                                        </div>
                                    )}
                                </div>

                                {/* Message Content */}
                                <div className="flex-1 border-l border-slate-100 md:pl-6 pt-4 md:pt-0">
                                    <h4 className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">Message</h4>
                                    <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{enq.message}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <button
                                onClick={() => handleDelete(enq.id)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete Enquiry"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <MessageSquare size={48} className="mx-auto mb-4 text-slate-300" />
                        <p className="text-lg font-medium">No enquiries yet</p>
                        <p className="text-sm">Messages sent from the Contact page will appear here.</p>
                    </div>
                )}
            </div>


            {/* Delete Confirmation Modal */}
            {
                deleteTarget && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
                                    <AlertTriangle size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Delete Enquiry?</h3>
                                <p className="text-slate-500">
                                    This action cannot be undone. This message will be permanently removed.
                                </p>
                                <div className="flex w-full gap-3 pt-4">
                                    <button
                                        onClick={() => setDeleteTarget(null)}
                                        className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-shadow shadow-md hover:shadow-lg"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Enquiries;
