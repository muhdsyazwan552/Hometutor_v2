import { Head, Link, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, DevicePhoneMobileIcon, LockClosedIcon, MapPinIcon, SparklesIcon, UserIcon } from '@heroicons/react/24/outline';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import RegisterForm from './Register';

<<<<<<< HEAD
const images = [
    "/images/swp.png",
    "/images/swp2.png",
    "/images/swp3.png",
=======
const benefits = [
    'Digital learning content for every stage',
    'Practice built around mastery',
    'A clearer view of learning progress',
>>>>>>> 917d4bb (Initial project commit)
];

export default function Login({ status, canResetPassword }) {
    const [isLogin, setIsLogin] = useState(true);
<<<<<<< HEAD
    const [currentSlide, setCurrentSlide] = useState(0);

=======
    const [locationStatus, setLocationStatus] = useState('idle');
    const [locationRequested, setLocationRequested] = useState(false);
>>>>>>> 917d4bb (Initial project commit)
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
        location: null,
    });

<<<<<<< HEAD
    const submit = (e) => {
        e.preventDefault();
        if (isLogin) {
            post(route('login'), { onFinish: () => reset('password') });
        } else {
            post(route('register'));
=======
    useEffect(() => {
        setLocationRequested(window.localStorage.getItem('hometutor-location-requested') === 'true');
    }, []);

    const requestLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus('unsupported');
            return;
>>>>>>> 917d4bb (Initial project commit)
        }

        setLocationStatus('requesting');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setData('location', {
                    latitude: Number(position.coords.latitude.toFixed(3)),
                    longitude: Number(position.coords.longitude.toFixed(3)),
                    accuracy: Math.round(position.coords.accuracy),
                });
                window.localStorage.setItem('hometutor-location-requested', 'true');
                setLocationRequested(true);
                setLocationStatus('shared');
            },
            () => {
                window.localStorage.setItem('hometutor-location-requested', 'true');
                setLocationRequested(true);
                setLocationStatus('unavailable');
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
        );
    };

<<<<<<< HEAD
    const slides = [
        {
            title: "Welcome to DJATI",
            text: "DJATI helps developers to build organized and well-coded dashboards full of beautiful and rich modules. Join us and start building your application today.",
            footer: "More than 17k people joined us, it's your turn.",
        },
        {
            title: "Build Faster, Smarter",
            text: "Use our prebuilt templates and components to launch your product in record time. Save months of design and development.",
            footer: "Trusted by professionals worldwide.",
        },
        {
            title: "Collaborate Seamlessly",
            text: "Invite your team, assign roles, and manage your project effortlessly — all within one integrated platform.",
            footer: "Join thousands of teams using DJATI every day.",
        },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);
=======
    const submit = (event) => {
        event.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };
>>>>>>> 917d4bb (Initial project commit)

    return (
        <>
            <Head title={isLogin ? 'Log in' : 'Create an account'} />

<<<<<<< HEAD
            <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 font-sans">
                {/* Left - Login form */}
                <div className="flex flex-col justify-center px-6 lg:px-16 py-12 relative overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
                    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />

                    <div className="max-w-md w-full mx-auto relative z-10">
                        {/* Logo area */}
                        <div className="mb-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg mb-4 transform hover:scale-105 transition-transform duration-300">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                {isLogin ? "Welcome Back!" : "Join the Club"}
                            </h1>
                            <p className="text-gray-600 text-sm font-medium">
                                {isLogin ? "Ready to continue your journey?" : "Start your adventure today"}
                            </p>
                        </div>

                        {/* Modern Toggle Switch */}
                        <div className="flex justify-center mb-8">
                            <div className="bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-lg border border-gray-200/50 flex">
                                <button
                                    onClick={() => setIsLogin(true)}
                                    className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                                        isLogin
                                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                                            : "text-gray-600 hover:text-indigo-600"
                                    }`}
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => setIsLogin(false)}
                                    className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                                        !isLogin
                                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                                            : "text-gray-600 hover:text-indigo-600"
                                    }`}
                                >
                                    Register
                                </button>
                            </div>
                        </div>

                        {/* Form Container with Glassmorphism */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? "login" : "register"}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-8"
                            >
                                {isLogin ? (
                                    <form onSubmit={submit} className="space-y-5">
                                        <div className="group">
                                            <InputLabel htmlFor="email" value="Email Address" className="text-gray-700 font-semibold text-sm mb-2" />
                                            <div className="relative">
                                                <TextInput
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    value={data.email}
                                                    className="mt-1 block w-full bg-gray-50/50 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 pl-10"
                                                    onChange={(e) => setData("email", e.target.value)}
                                                    required
                                                    placeholder="student@university.edu"
                                                />
                                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                                </svg>
                                            </div>
                                            <InputError message={errors.email} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="password" value="Password" className="text-gray-700 font-semibold text-sm mb-2" />
                                            <div className="relative">
                                                <TextInput
                                                    id="password"
                                                    type="password"
                                                    name="password"
                                                    value={data.password}
                                                    className="mt-1 block w-full bg-gray-50/50 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 pl-10"
                                                    onChange={(e) => setData("password", e.target.value)}
                                                    required
                                                    placeholder="••••••••"
                                                />
                                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>
                                            <InputError message={errors.password} className="mt-2" />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center text-sm text-gray-600 cursor-pointer group">
                                                <Checkbox
                                                    name="remember"
                                                    checked={data.remember}
                                                    onChange={(e) => setData("remember", e.target.checked)}
                                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-colors"
                                                />
                                                <span className="ml-2 group-hover:text-indigo-600 transition-colors">Remember me</span>
                                            </label>

                                            {canResetPassword && (
                                                <Link
                                                    href={route("password.request")}
                                                    className="text-sm font-semibold text-indigo-600 hover:text-purple-600 transition-colors"
                                                >
                                                    Forgot password?
                                                </Link>
                                            )}
                                        </div>

                                        <PrimaryButton
                                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center gap-2"
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <>
                                                    Sign In
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                </>
                                            )}
                                        </PrimaryButton>

                                        <div className="relative my-6">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-gray-300"></div>
                                            </div>
                                            <div className="relative flex justify-center text-sm">
                                                <span className="px-2 bg-white/70 text-gray-500">Or continue with</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-center space-x-4">
                                            {[
                                                { src: "https://www.svgrepo.com/show/475656/google-color.svg", alt: "Google" },
                                                { src: "https://www.svgrepo.com/show/475647/facebook-color.svg", alt: "Facebook" },
                                                { src: "https://www.svgrepo.com/show/475654/github-color.svg", alt: "GitHub" }
                                            ].map((social, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    className="p-3 rounded-xl bg-white shadow-md hover:shadow-lg border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-1 transition-all duration-200 group"
                                                >
                                                    <img src={social.src} alt={social.alt} className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                </button>
                                            ))}
                                        </div>

                                        <div className="text-center text-sm text-gray-600 mt-6">
                                            Don't have an account?{" "}
                                            <button
                                                type="button"
                                                onClick={() => setIsLogin(false)}
                                                className="font-bold text-indigo-600 hover:text-purple-600 transition-colors underline decoration-2 underline-offset-2"
                                            >
                                                Create one now
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <RegisterForm />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right - Image Slider with Modern Overlay */}
                <div className="hidden lg:flex items-center justify-center relative overflow-hidden">
                    {/* Background Images with Ken Burns effect */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ scale: 1.1, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `url(${images[currentSlide]})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                            }}
                        />
                    </AnimatePresence>

                    {/* Gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-purple-900/70 to-pink-900/80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Content */}
                    <div className="relative z-10 max-w-lg px-12 text-white">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-sm font-medium">Live Community</span>
                            </div>

                            <h2 className="text-5xl font-bold mb-6 leading-tight">
                                {slides[currentSlide].title}
                            </h2>
                            <p className="text-lg text-gray-200 mb-8 leading-relaxed">
                                {slides[currentSlide].text}
                            </p>

                            {/* Stats */}
                            <div className="flex items-center gap-6 mb-8">
                                <div>
                                    <div className="text-3xl font-bold text-white">17k+</div>
                                    <div className="text-sm text-gray-300">Active Students</div>
                                </div>
                                <div className="w-px h-12 bg-white/20" />
                                <div>
                                    <div className="text-3xl font-bold text-white">4.9</div>
                                    <div className="text-sm text-gray-300">App Rating</div>
                                </div>
                            </div>

                            {/* Testimonial Card */}
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex -space-x-3">
                                        {[1,2,3,4].map((i) => (
                                            <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 border-2 border-white flex items-center justify-center text-xs font-bold text-white">
                                                {String.fromCharCode(64 + i)}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-sm text-gray-300">
                                        Join <span className="text-white font-semibold">2,000+</span> students today
                                    </div>
                                </div>
                                <p className="text-sm text-gray-200 italic">"{slides[currentSlide].footer}"</p>
                            </div>
                        </motion.div>

                        {/* Slide indicators */}
                        <div className="flex gap-2 mt-8">
                            {slides.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        idx === currentSlide ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Decorative floating elements */}
                    <div className="absolute top-20 right-20 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />
                    <div className="absolute bottom-32 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />
                </div>
            </div>

            {/* Add this to your CSS/tailwind config */}
            <style>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </>
    );
}
=======
            <main className="min-h-screen bg-[#061f42] p-3 sm:p-5 lg:p-7">
                <div className="relative mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1500px] overflow-hidden rounded-[2rem] bg-white shadow-2xl lg:grid-cols-[1.05fr_.95fr]">
                    <section className="relative hidden overflow-hidden bg-[#082c58] px-10 py-10 text-white lg:flex lg:flex-col xl:px-16 xl:py-14">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(36,190,241,.35),transparent_26%),radial-gradient(circle_at_90%_85%,rgba(242,194,55,.23),transparent_30%)]" />
                        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.4)_1px,transparent_1px)] [background-size:38px_38px]" />

                        <Link href="/" className="relative z-10 inline-flex w-fit items-center gap-2 text-sm font-semibold text-blue-100 transition hover:text-white"><ArrowLeftIcon className="h-4 w-4" /> Back to home</Link>
                        <div className="relative z-10 mt-12"><img src="/images/HT_Rectangle_3D.png" alt="HomeTutor" className="h-20 w-auto rounded-xl bg-white p-2 object-contain" /></div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 my-auto max-w-xl pt-16">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-cyan-100 backdrop-blur"><SparklesIcon className="h-4 w-4 text-[#ffdc50]" /> Your learning space</div>
                            <h1 className="mt-6 text-4xl font-bold leading-tight xl:text-5xl">Keep your learning moving forward.</h1>
                            <p className="mt-5 max-w-lg text-lg leading-8 text-blue-100">Access focused lessons, purposeful practice and a clearer picture of your progress in one place.</p>
                            <ul className="mt-9 space-y-4">
                                {benefits.map((benefit, index) => (
                                    <motion.li key={benefit} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + index * 0.1 }} className="flex items-center gap-3 text-blue-50">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f2c237] text-[#082c58]"><CheckCircleIcon className="h-4 w-4" /></span>
                                        {benefit}
                                    </motion.li>
                                ))}
                            </ul>
                            <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-100"><DevicePhoneMobileIcon className="h-5 w-5 text-[#ffdc50]" /> Ready on phone, tablet and desktop</div>
                        </motion.div>

                        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }} className="relative z-10 mt-10 w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
                            <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">Today’s focus</p><p className="mt-1 font-bold">Make progress, one topic at a time.</p></div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-[#ffdc50]"><SparklesIcon className="h-6 w-6" /></div></div>
                            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20"><motion.div animate={{ width: ['18%', '72%', '46%'] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="h-full rounded-full bg-[#ffdc50]" /></div>
                        </motion.div>
                    </section>

                    <section className="relative flex min-h-full items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
                        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#e8f7ff] blur-3xl" />
                        <div className="relative w-full max-w-md">
                            <Link href="/" className="mb-10 flex items-center gap-2 text-sm font-semibold text-[#087bb8] lg:hidden"><ArrowLeftIcon className="h-4 w-4" /> Back to HomeTutor</Link>
                            <img src="/images/HT_Rectangle_3D.png" alt="HomeTutor" className="mb-10 h-14 w-auto object-contain lg:hidden" />

                            <div className="mb-8"><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#0788c9]">HomeTutor account</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-[#082c58]">{isLogin ? 'Welcome back.' : 'Create a parent account.'}</h2><p className="mt-3 leading-7 text-slate-500">{isLogin ? 'Parents and children use the same secure login.' : 'Parents register first, choose a package, then create child logins.'}</p></div>

                            <div className="mb-8 grid grid-cols-2 rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => setIsLogin(true)} className={`rounded-lg px-4 py-2.5 text-sm font-bold transition ${isLogin ? 'bg-white text-[#082c58] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Log in</button><button type="button" onClick={() => setIsLogin(false)} className={`rounded-lg px-4 py-2.5 text-sm font-bold transition ${!isLogin ? 'bg-white text-[#082c58] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Register</button></div>

                            <AnimatePresence mode="wait">
                                <motion.div key={isLogin ? 'login' : 'register'} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.25 }}>
                                    {isLogin ? (
                                        <form onSubmit={submit} className="space-y-5">
                                            {status && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{status}</div>}
                                            <div><InputLabel htmlFor="username" value="Email or username" className="font-semibold text-slate-700" /><div className="relative mt-2"><UserIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><TextInput id="username" type="text" name="username" value={data.username} className="block w-full rounded-xl border-slate-200 py-3 pl-11 pr-4 text-slate-800 shadow-sm transition focus:border-[#0788c9] focus:ring-[#0788c9]" autoComplete="username" onChange={(event) => setData('username', event.target.value)} required autoFocus /></div><InputError message={errors.username} className="mt-2" /></div>
                                            <div><InputLabel htmlFor="password" value="Password" className="font-semibold text-slate-700" /><div className="relative mt-2"><LockClosedIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><TextInput id="password" type="password" name="password" value={data.password} className="block w-full rounded-xl border-slate-200 py-3 pl-11 pr-4 text-slate-800 shadow-sm transition focus:border-[#0788c9] focus:ring-[#0788c9]" autoComplete="current-password" onChange={(event) => setData('password', event.target.value)} required /></div><InputError message={errors.password} className="mt-2" /></div>
                                            <div className="flex items-center justify-between"><label className="flex items-center text-sm font-medium text-slate-600"><Checkbox name="remember" checked={data.remember} onChange={(event) => setData('remember', event.target.checked)} /><span className="ml-2">Remember me</span></label>{canResetPassword && <Link href={route('password.request')} className="text-sm font-bold text-[#0788c9] hover:text-[#082c58]">Forgot password?</Link>}</div>
                                            <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-3">
                                                {locationStatus === 'shared' ? <p className="flex items-center gap-2 text-xs font-semibold text-emerald-700"><CheckCircleIcon className="h-4 w-4" /> Approximate location shared for this sign-in.</p> : locationRequested ? <p className="text-xs leading-5 text-slate-500">Location permission was already requested on this device. You can still sign in safely without it.</p> : <div className="flex flex-wrap items-center justify-between gap-2"><p className="max-w-[220px] text-xs leading-5 text-slate-500">Optional: share your approximate location once to help protect your account.</p><button type="button" onClick={requestLocation} disabled={locationStatus === 'requesting'} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#087bb8] shadow-sm ring-1 ring-sky-100 transition hover:bg-sky-50 disabled:cursor-wait"><MapPinIcon className="h-4 w-4" />{locationStatus === 'requesting' ? 'Requesting…' : 'Share once'}</button></div>}
                                                {locationStatus === 'unsupported' && <p className="mt-2 text-xs font-medium text-amber-700">This browser does not support location sharing.</p>}
                                                {locationStatus === 'unavailable' && <p className="mt-2 text-xs font-medium text-slate-500">Location was not shared. You can continue signing in.</p>}
                                            </div>
                                            <PrimaryButton disabled={processing} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#0788c9] py-3.5 text-sm font-bold shadow-[0_12px_24px_rgba(7,136,201,.2)] transition hover:bg-[#056fa7] focus:bg-[#056fa7] active:bg-[#056fa7]">{processing ? 'Signing in…' : 'Sign in to HomeTutor'}<ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" /></PrimaryButton>
                                            <p className="pt-1 text-center text-sm text-slate-500">New to HomeTutor? <button type="button" onClick={() => setIsLogin(false)} className="font-bold text-[#0788c9] hover:text-[#082c58]">Create an account</button></p>
                                        </form>
                                    ) : <RegisterForm />}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
>>>>>>> 917d4bb (Initial project commit)
