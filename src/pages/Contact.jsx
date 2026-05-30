import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Clock, Globe, ChevronDown, ChevronUp, Twitter, Linkedin, Facebook, Loader2 } from 'lucide-react';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const defaultData = {
    header: {
        title: 'Get in Touch',
        description: 'We have convenient centers to serve you. Visit the one nearest to you or send us a message online.',
    },
    offices: [
        {
            id: 'keshod',
            name: 'Keshod Office',
            address: 'Amrutnagar Main Road, Keshod',
            mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14876.107050212041!2d70.252083!3d21.297597!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bf7ff0000000001%3A0x0!2zMjHCsDE3JzUxLjQiTiA3MMKwMTUnMDcuNSJF!5e0!3m2!1sen!2sin!4v1650000000000!5m2!1sen!2sin',
            phone: ['+91 98765 43210'],
            email: 'keshod@vrundavancomputers.com',
        },
    ],
    hours: [
        { day: 'Monday - Friday', time: '9:30 AM - 6:30 PM' },
        { day: 'Saturday', time: '10:00 AM - 2:00 PM' },
        { day: 'Sunday', time: 'Closed' },
    ],
    faqs: [
        { question: 'Which center should I visit?', answer: 'You can visit any center that is convenient for you. All our centers offer the same high-quality services.' },
        { question: 'Are the office hours the same for all locations?', answer: 'Yes, generally our offices operate from 9:30 AM to 6:30 PM on weekdays.' },
        { question: 'Can I apply online instead of visiting?', answer: "Absolutely! You can use the 'Register Now' button to start your application process online." },
        { question: 'Do I need an appointment?', answer: "Walk-ins are welcome! However, for detailed counseling sessions, we recommend booking an appointment." },
    ],
};

const Contact = () => {
    const [activeLocation, setActiveLocation] = useState(0);
    const [data, setData] = useState(defaultData);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const snap = await getDoc(doc(db, 'settings', 'contact'));
                if (snap.exists()) {
                    setData(prev => ({ ...prev, ...snap.data() }));
                }
            } catch (e) {
                console.error('Error fetching contact settings:', e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const { header, offices, hours, faqs } = data;

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
    );

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-screen-xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12 space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{header.title}</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">{header.description}</p>
                </div>

                {/* Office Tabs - only show if more than 1 */}
                {offices.length > 1 && (
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {offices.map((office, index) => (
                            <button
                                key={office.id || index}
                                onClick={() => setActiveLocation(index)}
                                className={`px-8 py-3 rounded-full font-bold text-sm md:text-base transition-all duration-300 shadow-sm ${activeLocation === index
                                    ? 'bg-blue-600 text-white shadow-lg scale-105 ring-2 ring-blue-600 ring-offset-2'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
                            >
                                {office.name}
                            </button>
                        ))}
                    </div>
                )}

                {offices.length > 0 && (
                    <div className="grid lg:grid-cols-2 gap-12 mb-20">
                        {/* Left Column */}
                        <div className="space-y-8">
                            {/* Office Details */}
                            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 animate-fade-in relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <MapPin size={120} className="text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">{offices[activeLocation]?.name}</h3>
                                <div className="space-y-4 relative z-10">
                                    {offices[activeLocation]?.address && (
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0"><MapPin size={20} /></div>
                                            <div>
                                                <p className="font-semibold text-slate-900">Address</p>
                                                <p className="text-slate-600 leading-relaxed">{offices[activeLocation].address}</p>
                                            </div>
                                        </div>
                                    )}
                                    {offices[activeLocation]?.phone?.length > 0 && (
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0"><Phone size={20} /></div>
                                            <div>
                                                <p className="font-semibold text-slate-900">Phone</p>
                                                {offices[activeLocation].phone.map((ph, i) => (
                                                    <p key={i} className="text-slate-600">{ph}</p>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {offices[activeLocation]?.email && (
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0"><Mail size={20} /></div>
                                            <div>
                                                <p className="font-semibold text-slate-900">Email</p>
                                                <p className="text-slate-600">{offices[activeLocation].email}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Map */}
                            {offices[activeLocation]?.mapUrl && (
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
                                    />
                                </div>
                            )}

                            {/* Office Hours */}
                            {hours.length > 0 && (
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <Clock className="text-blue-600" /> Office Hours
                                    </h3>
                                    <ul className="space-y-3 text-slate-600">
                                        {hours.map((h, i) => (
                                            <li key={i} className={`flex justify-between pb-2 ${i < hours.length - 1 ? 'border-b border-slate-50' : ''}`}>
                                                <span>{h.day}</span>
                                                <span className="font-medium text-slate-900">{h.time}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Contact Form */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-blue-600 h-fit">
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Send us a Message</h3>
                            <p className="text-slate-600 mb-8">Have a query? Fill out the form below and we'll get back to you.</p>
                            <ContactForm />
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
                )}

                {/* FAQ */}
                {faqs.length > 0 && (
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
                            <p className="text-slate-600 mt-2">Common questions about admissions and our centers.</p>
                        </div>
                        <div className="space-y-4">
                            {faqs.map((faq, i) => (
                                <FAQItem key={i} question={faq.question} answer={faq.answer} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SocialButton = ({ icon: Icon, label }) => (
    <button className="p-3 bg-white text-slate-500 rounded-full shadow-sm border border-slate-200 hover:text-blue-600 hover:border-blue-200 hover:scale-110 transition-all" aria-label={label}>
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
            <div className={`px-6 transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 py-4 opacity-100' : 'max-h-0 py-0 opacity-0'}`}>
                <p className="text-slate-600">{answer}</p>
            </div>
        </div>
    );
};

const ContactForm = () => {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '', email: '', message: '' });
    const [status, setStatus] = useState('idle');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        try {
            await addDoc(collection(db, 'enquiries'), { ...formData, createdAt: new Date(), status: 'new' });
            setStatus('success');
            setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
            setTimeout(() => setStatus('idle'), 5000);
        } catch (error) {
            console.error('Error submitting enquiry:', error);
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
                    <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                    <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Doe" />
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="john@example.com" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+91 98765 43210" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea rows="4" name="message" required value={formData.message} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="How can we help?" />
            </div>
            {status === 'success' && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm text-center">Message sent successfully!</div>}
            {status === 'error' && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">Failed to send message. Try again.</div>}
            <button type="submit" disabled={status === 'submitting'} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-md">
                {status === 'submitting' ? 'Sending...' : <><Send size={18} /> Send Message</>}
            </button>
        </form>
    );
};

export default Contact;
