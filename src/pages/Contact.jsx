import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, Globe, ChevronDown, ChevronUp, Twitter, Linkedin, Facebook, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const Contact = () => {
    const [activeLocation, setActiveLocation] = useState(0);

    const offices = [
        {
            id: 'keshod',
            name: 'Keshod Office',
            address: 'Amrutnagar Main Road, Keshod',
            mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14876.107050212041!2d70.252083!3d21.297597!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bf7ff0000000001%3A0x0!2zMjHCsDE3JzUxLjQiTiA3MMKwMTUnMDcuNSJF!5e0!3m2!1sen!2sin!4v1650000000000!5m2!1sen!2sin', // Approximate
            phone: ['+91 (2871) 234-567', '+91 98765 43210'],
            email: 'keshod@skillnest.com'
        },
        {
            id: 'vapi',
            name: 'Vapi Office',
            address: '134, Tirupati Plaza, Daman Road, Chala',
            mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3740.730302484218!2d72.930000!3d20.350000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be0ce0000000001%3A0x0!2zMjDCsDIxJzAwLjAiTiA3MsKwNTUnNDguMCJF!5e0!3m2!1sen!2sin!4v1650000000000!5m2!1sen!2sin', // Approximate
            phone: ['+91 (260) 234-5678', '+91 98765 43211'],
            email: 'vapi@skillnest.com'
        },
        {
            id: 'junagadh',
            name: 'Junagadh Office',
            address: '4th floor, Kunj Square, Vishnu Colony, Zanzard Road',
            mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3711.200000000000!2d70.460000!3d21.520000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3958000000000001%3A0x0!2zMjHCsDMxJzEyLjAiTiA3MMKwMjcnMzYuMCJF!5e0!3m2!1sen!2sin!4v1650000000000!5m2!1sen!2sin', // Approximate
            phone: ['+91 (285) 234-5678', '+91 98765 43212'],
            email: 'junagadh@skillnest.com'
        }
    ];

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-screen-xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12 space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Get in Touch</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        We have three convenient centers to serve you. Visit the one nearest to you or send us a message online.
                    </p>
                </div>

                {/* Office Type Selection - Tabs */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {offices.map((office, index) => (
                        <button
                            key={office.id}
                            onClick={() => setActiveLocation(index)}
                            className={`px-8 py-3 rounded-full font-bold text-sm md:text-base transition-all duration-300 shadow-sm
                                ${activeLocation === index
                                    ? 'bg-blue-600 text-white shadow-lg scale-105 ring-2 ring-blue-600 ring-offset-2'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            {office.name}
                        </button>
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-12 mb-20">
                    {/* Left Column: Details, Map & Hours */}
                    <div className="space-y-8">

                        {/* Selected Office Details Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 animate-fade-in relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <MapPin size={120} className="text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">{offices[activeLocation].name}</h3>

                            <div className="space-y-4 relative z-10">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">Address</p>
                                        <p className="text-slate-600 leading-relaxed">{offices[activeLocation].address}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">Phone</p>
                                        <div className="space-y-1">
                                            {offices[activeLocation].phone.map((ph, i) => (
                                                <p key={i} className="text-slate-600">{ph}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">Email</p>
                                        <p className="text-slate-600">{offices[activeLocation].email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map Section */}
                        <div className="rounded-2xl overflow-hidden shadow-md h-64 md:h-80 border border-slate-200 relative bg-slate-100">
                            <iframe
                                key={activeLocation}
                                src={offices[activeLocation].mapUrl}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title={`${offices[activeLocation].name} Location`}
                                className="opacity-0 animate-fade-in"
                                onLoad={(e) => e.target.classList.remove('opacity-0')}
                            ></iframe>
                        </div>

                        {/* Office Hours */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Clock className="text-blue-600" /> Office Hours
                            </h3>
                            <ul className="space-y-3 text-slate-600">
                                <li className="flex justify-between border-b border-slate-50 pb-2">
                                    <span>Monday - Friday</span>
                                    <span className="font-medium text-slate-900">9:30 AM - 6:30 PM</span>
                                </li>
                                <li className="flex justify-between border-b border-slate-50 pb-2">
                                    <span>Saturday</span>
                                    <span className="font-medium text-slate-900">10:00 AM - 2:00 PM</span>
                                </li>
                                <li className="flex justify-between text-slate-400">
                                    <span>Sunday</span>
                                    <span>Closed</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Contact Form */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-blue-600 h-fit">
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Send us a Message</h3>
                        <p className="text-slate-600 mb-8">Have a general query? Fill out the form below and we'll route it to the right team.</p>
                        <ContactForm />
                        {/* Social Links */}
                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <p className="text-sm font-semibold text-slate-500 mb-4 text-center">Connect with us on</p>
                            <div className="flex gap-4 justify-center">
                                <SocialButton icon={Twitter} label="Twitter" />
                                <SocialButton icon={Linkedin} label="LinkedIn" />
                                <SocialButton icon={Facebook} label="Facebook" />
                                <SocialButton icon={Globe} label="Website" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
                        <p className="text-slate-600 mt-2">Common questions about admissions and our centers.</p>
                    </div>
                    <div className="space-y-4">
                        <FAQItem
                            question="Which center should I visit?"
                            answer="You can visit any center that is convenient for you. All our centers offer the same high-quality counseling and admission services."
                        />
                        <FAQItem
                            question="Are the office hours the same for all locations?"
                            answer="Yes, generally our offices operate from 9:30 AM to 6:30 PM on weekdays. However, it's always good to call ahead on public holidays."
                        />
                        <FAQItem
                            question="Can I apply online instead of visiting?"
                            answer="Absolutely! You can use the 'Register Now' button in the menu to start your application process online from anywhere."
                        />
                        <FAQItem
                            question="Do I need an appointment?"
                            answer="Walk-ins are welcome! However, for detailed counseling sessions, we recommend booking an appointment to avoid waiting times."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const SocialButton = ({ icon: Icon, label }) => (
    <button
        className="p-3 bg-white text-slate-500 rounded-full shadow-sm border border-slate-200 hover:text-blue-600 hover:border-blue-200 hover:scale-110 transition-all"
        aria-label={label}
    >
        <Icon size={20} />
    </button>
);

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
            <button
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-semibold text-slate-900">{question}</span>
                {isOpen ? <ChevronUp className="text-blue-600" /> : <ChevronDown className="text-slate-400" />}
            </button>
            <div
                className={`px-6 transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 py-4 opacity-100' : 'max-h-0 py-0 opacity-0'
                    }`}
            >
                <p className="text-slate-600">{answer}</p>
            </div>
        </div>
    );
};



const ContactForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState('idle');

    const checkSpam = async () => {
        let settings = { spamProtection: true, maxRequestsPerMinute: 5 };

        try {
            // 1. Get Security Settings (try-catch isolated to fetch)
            const settingsDoc = await getDoc(doc(db, "settings", "security"));
            if (settingsDoc.exists()) {
                settings = settingsDoc.data();
            }
        } catch (error) {
            console.warn("Could not fetch security settings, using defaults:", error);
            // Continue using default settings
        }

        if (!settings.spamProtection) return true;

        try {
            // 2. Check Local History
            const now = Date.now();
            const oneMinuteAgo = now - 60000;
            const requestLog = JSON.parse(localStorage.getItem('contact_requests') || '[]');

            // Filter requests from last minute
            const recentRequests = requestLog.filter(time => time > oneMinuteAgo);

            if (recentRequests.length >= settings.maxRequestsPerMinute) {
                return false; // Spam detected
            }

            // 3. Update Log
            recentRequests.push(now);
            localStorage.setItem('contact_requests', JSON.stringify(recentRequests));
            return true;

        } catch (error) {
            console.error("Local spam check failed:", error);
            return true; // Use basic fail-safe only for local storage errors
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Anti-Spam Check
        const isSafe = await checkSpam();
        if (!isSafe) {
            navigate('/access-denied');
            return;
        }

        setStatus('submitting');
        try {
            await addDoc(collection(db, "enquiries"), {
                ...formData,
                createdAt: new Date(),
                status: 'new' // standard status for admin
            });

            setStatus('success');
            setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
            setTimeout(() => setStatus('idle'), 5000);
        } catch (error) {
            console.error("Error submitting enquiry:", error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="John"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                    <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Doe"
                    />
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="john@example.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="+91 98765 43210"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea
                    rows="4"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="How can we help?"
                ></textarea>
            </div>

            {status === 'success' && (
                <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm text-center">
                    Message sent successfully!
                </div>
            )}
            {status === 'error' && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
                    Failed to send message. Try again.
                </div>
            )}

            <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform active:scale-95 duration-200"
            >
                {status === 'submitting' ? 'Sending...' : 'Send Message'} <Send size={18} />
            </button>
        </form>
    );
};

export default Contact;
