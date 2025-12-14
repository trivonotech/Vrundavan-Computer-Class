import React from 'react';
import { Plus, Trash2, ExternalLink } from 'lucide-react';

const AdminGallery = () => {
    // Mock data matching the implementation in CircularGallery
    const images = [
        { image: 'https://picsum.photos/seed/1/800/600', text: 'Bridge' },
        { image: 'https://picsum.photos/seed/2/800/600', text: 'Desk Setup' },
        { image: 'https://picsum.photos/seed/3/800/600', text: 'Waterfall' },
        { image: 'https://picsum.photos/seed/4/800/600', text: 'Strawberries' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Campus Life Gallery</h1>
                    <p className="text-slate-500">Manage images shown in the circular gallery on home page.</p>
                </div>
                <button className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg">
                    <Plus size={20} />
                    Add New Image
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images.map((img, i) => (
                    <div key={i} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all">
                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                            <img
                                src={img.image}
                                alt={img.text}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20 transition-colors">
                                    <ExternalLink size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <span className="font-medium text-slate-700">{img.text}</span>
                            <button className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminGallery;
