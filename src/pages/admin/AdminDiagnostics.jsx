import React, { useState, useEffect } from 'react';
import { Activity, Wifi, Server, Database, Info, ExternalLink } from 'lucide-react';
import { doc, getDoc, collection, getCountFromServer, limit, query, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

// Helper to calculate byte size of a string/object
const calculateSize = (obj) => new Blob([JSON.stringify(obj)]).size;

const AdminDiagnostics = () => {
    const [stats, setStats] = useState({
        status: 'checking',
        latency: 0,
        recordCount: 0,
        dbUsage: '0.00 MB',
        breakdown: []
    });
    const [loading, setLoading] = useState(false);
    // Removed showDetails state as per request

    const checkHealth = async () => {
        setLoading(true);
        console.log("Starting System Health Check...");
        const start = performance.now();

        let newStats = {
            status: 'online',
            latency: 0,
            recordCount: 0,
            dbUsage: '0.00 MB',
            breakdown: []
        };

        try {
            // 1. Connectivity & Latency
            const pingPromise = getDoc(doc(db, "settings", "security"));
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Ping timeout")), 5000));
            await Promise.race([pingPromise, timeoutPromise]);
            const end = performance.now();
            newStats.latency = Math.round(end - start);

            // 2. Database Usage: Detailed Estimation
            console.log("Estimating Database Size...");
            const collectionsToCheck = ['gallery', 'team', 'management', 'enquiries'];
            let totalRecords = 0;
            let totalBytes = 0;
            let collectionStats = [];

            // Analyze each collection
            for (const colName of collectionsToCheck) {
                try {
                    const coll = collection(db, colName);

                    // A. Get Total Count
                    const countSnapshot = await getCountFromServer(coll);
                    const count = countSnapshot.data().count;

                    // B. Estimate Size via Sampling
                    let avgSize = 0;
                    if (count > 0) {
                        // Sample up to 5 documents
                        const sampleQuery = query(coll, limit(5));
                        const sampleDocs = await getDocs(sampleQuery);
                        let sampleTotalSize = 0;

                        sampleDocs.forEach(d => {
                            sampleTotalSize += calculateSize(d.data());
                        });

                        avgSize = sampleDocs.empty ? 0 : (sampleTotalSize / sampleDocs.size);
                    }

                    const estimatedSizeBytes = avgSize * count;
                    const estimatedSizeMB = (estimatedSizeBytes / (1024 * 1024)).toFixed(2);

                    collectionStats.push({
                        name: colName.charAt(0).toUpperCase() + colName.slice(1),
                        count: count,
                        sizeMB: estimatedSizeMB
                    });

                    totalRecords += count;
                    totalBytes += estimatedSizeBytes;

                } catch (e) {
                    console.warn(`Failed to analyze ${colName}`, e);
                }
            }

            newStats.recordCount = totalRecords;
            newStats.dbUsage = (totalBytes / (1024 * 1024)).toFixed(2) + ' MB';
            newStats.breakdown = collectionStats;

            setStats(newStats);

        } catch (error) {
            console.error("Health check failed:", error);
            setStats(prev => ({ ...prev, status: 'offline' }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkHealth();
    }, []);

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="text-center space-y-2 mb-10">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
                    <Activity className="text-blue-600" size={32} />
                    System Diagnostics
                </h1>
                <p className="text-slate-500 max-w-lg mx-auto">Real-time system health, database usage estimates, and operational metrics.</p>
            </div>

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Activity size={24} className="text-blue-600" />
                    Live Metrics
                </h2>
                <div className="flex gap-3">
                    <a
                        href="https://console.firebase.google.com/u/0/project/_/usage"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-slate-500 hover:text-blue-600 flex items-center gap-2 px-3 py-1.5 transition-colors"
                    >
                        Daily Usage <ExternalLink size={14} />
                    </a>
                    <button
                        onClick={checkHealth}
                        disabled={loading}
                        className="text-sm font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Analyzing...' : 'Refresh Diagnostics'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* API Latency */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Response Time</p>
                        <p className="text-lg font-bold text-slate-700">
                            {loading ? '...' : `${stats.latency} ms`}
                        </p>
                        <span className="text-xs text-slate-400">Read Latency</span>
                    </div>
                    <div className={`p-3 rounded-full ${stats.latency < 200 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                        <Server size={20} />
                    </div>
                </div>

                {/* Database Usage */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Storage</p>
                        <p className="text-lg font-bold text-slate-700">
                            {loading ? '...' : stats.dbUsage}
                        </p>
                        <span className="text-xs text-slate-400">{stats.recordCount} Total Records</span>
                    </div>
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
                        <Database size={20} />
                    </div>
                </div>
            </div>

            {/* Detailed Breakdown (Always Visible) */}
            <div className="space-y-6 animate-fade-in-up">
                {/* Storage Details */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Storage Breakdown</h3>
                        <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded-md">
                            Plan: Free Tier (Spark)
                        </span>
                    </div>

                    {/* Progress Bar for 1GB Limit */}
                    <div className="mb-6">
                        <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-slate-600 font-medium">Estimated Usage</span>
                            <span className="text-slate-500">{stats.dbUsage} / 1024 MB</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min((parseFloat(stats.dbUsage) / 1024) * 100, 100)}%` }}
                            ></div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 text-right">~{(parseFloat(stats.dbUsage) / 1024 * 100).toFixed(2)}% of 1GB Quota</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.breakdown.map((item) => (
                            <div key={item.name} className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Database size={40} />
                                </div>
                                <p className="text-sm font-semibold text-slate-600">{item.name}</p>
                                <p className="text-2xl font-bold text-slate-800 mt-1">{item.sizeMB} <span className="text-sm font-normal text-slate-400">MB</span></p>
                                <p className="text-xs text-slate-400 mt-1">{item.count} Records</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDiagnostics;
