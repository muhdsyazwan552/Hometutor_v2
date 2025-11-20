import React, { useState, useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import RegisterForm from './Register';



const images = [
    "/images/swp.jpg",
    "/images/swp2.jpg",
    "/images/swp3.jpg",
];

export default function Login({ status, canResetPassword }) {
    const [isLogin, setIsLogin] = useState(true); // Toggle Login/Register

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        if (isLogin) {
            post(route('login'), {
                onFinish: () => reset('password'),
            });
        } else {
            post(route('register'));
        }
    };

    const slides = [
        {
            title: "Welcome to Arcana",
            text: "Arcana helps developers to build organized and well-coded dashboards full of beautiful and rich modules. Join us and start building your application today.",
            footer: "More than 17k people joined us, it’s your turn.",
        },
        {
            title: "Build Faster, Smarter",
            text: "Use our prebuilt templates and components to launch your product in record time. Save months of design and development.",
            footer: "Trusted by professionals worldwide.",
        },
        {
            title: "Collaborate Seamlessly",
            text: "Invite your team, assign roles, and manage your project effortlessly — all within one integrated platform.",
            footer: "Join thousands of teams using Arcana every day.",
        },
    ];



    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000); // change every 4 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Head title={isLogin ? "Sign in" : "Register"} />

            <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans bg-gray-100 p-6">
                {/* Left - Login form */}
                <div className="flex flex-col justify-center px-10 lg:px-20 bg-transparent">
                    <div className="max-w-md w-full mx-auto">
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h1>
                            <p className="text-gray-500 text-sm">
                                Welcome back! Please sign in to your account
                            </p>
                        </div>

                        {/* Login/Register Tabs */}
                        <div className="flex justify-center mb-6">
                            <button
                                onClick={() => setIsLogin(true)}
                                className={`px-5 py-2 rounded-l-lg font-medium transition-all ${isLogin
                                        ? "bg-black text-white"
                                        : "bg-white text-gray-600 border border-gray-300"
                                    }`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => setIsLogin(false)}
                                className={`px-5 py-2 rounded-r-lg font-medium transition-all ${!isLogin
                                        ? "bg-black text-white"
                                        : "bg-white text-gray-600 border border-gray-300"
                                    }`}
                            >
                                Register
                            </button>
                        </div>

                        {/* Login Form */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? "login" : "register"}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                            >
                                {isLogin ? (
                                    <form onSubmit={submit} className="space-y-5">
                                        <div>
                                            <InputLabel htmlFor="email" value="Email Address" />
                                            <TextInput
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={data.email}
                                                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-black focus:border-black"
                                                onChange={(e) => setData("email", e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.email} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="password" value="Password" />
                                            <TextInput
                                                id="password"
                                                type="password"
                                                name="password"
                                                value={data.password}
                                                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-black focus:border-black"
                                                onChange={(e) => setData("password", e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.password} className="mt-2" />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center text-sm text-gray-600">
                                                <Checkbox
                                                    name="remember"
                                                    checked={data.remember}
                                                    onChange={(e) =>
                                                        setData("remember", e.target.checked)
                                                    }
                                                />
                                                <span className="ml-2">Remember me</span>
                                            </label>

                                            {canResetPassword && (
                                                <Link
                                                    href={route("password.request")}
                                                    className="text-sm text-gray-600 hover:text-black"
                                                >
                                                    Forgot password?
                                                </Link>
                                            )}
                                        </div>

                                        <PrimaryButton
                                            className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-2 rounded-lg flex justify-center items-center"
                                            disabled={processing}
                                        >
                                            Sign in
                                        </PrimaryButton>


                                        <div className="text-center text-sm text-gray-500 mt-4">
                                            Don’t have an account?{" "}
                                            <button
                                                type="button"
                                                onClick={() => setIsLogin(false)}
                                                className="text-black font-medium hover:underline"
                                            >
                                                Sign up
                                            </button>
                                        </div>

                                        <div className="flex justify-center space-x-4 mt-6">
                                            <button className="p-2 rounded-full border hover:bg-gray-100">
                                                <img src="https://i.pinimg.com/736x/e1/0e/3f/e10e3f21d3b4e0f40b04b8fee7f40da4.jpg" className="w-5 h-5" />
                                            </button>
                                            <button className="p-2 rounded-full border hover:bg-gray-100">
                                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png" className="w-5 h-5" />
                                            </button>
                                            <button className="p-2 rounded-full border hover:bg-gray-100">
                                                <img src="https://img.freepik.com/premium-vector/instagram-vector-logo-icon-social-media-logotype_901408-392.jpg?semt=ais_hybrid&w=740&q=80" className="w-5 h-5" />
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

                {/* Right - Dark Welcome Section */}
                {/* Right - Auto Sliding Section */}
                <div
                    className="hidden lg:flex items-center justify-center text-white relative p-12 transition-all duration-1000 ease-in-out"
                    style={{
                        backgroundImage: `url(${images[currentSlide]})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                >

                    <div className="absolute inset-0 bg-black/60"></div> {/* dark overlay */}

                    <div className="max-w-md relative z-10">
                        <h2 className="text-2xl font-bold mb-4">Welcome to Arcana</h2>
                        <p className="text-gray-300 mb-6">
                            Arcana helps developers to build organized and well-coded dashboards full of beautiful and rich modules.
                            Join us and start building your application today.
                        </p>
                        <p className="text-gray-300">More than 17k people joined us, it’s your turn.</p>

                        <div className="mt-10 bg-gray-900/80 rounded-2xl p-6 shadow-lg">
                            <h3 className="text-lg font-semibold mb-2">
                                Get your right job and right place — apply now
                            </h3>
                            <p className="text-gray-300 text-sm">
                                Be among the first founders to experience the easiest way to start a business.
                            </p>
                            <div className="flex items-center mt-4 space-x-2">
                                <img src="https://i.pinimg.com/736x/e1/0e/3f/e10e3f21d3b4e0f40b04b8fee7f40da4.jpg" className="w-8 h-8 rounded-full border" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png" className="w-8 h-8 rounded-full border" />
                                <img src="https://img.freepik.com/premium-vector/instagram-vector-logo-icon-social-media-logotype_901408-392.jpg?semt=ais_hybrid&w=740&q=80" className="w-8 h-8 rounded-full border" />
                            </div>
                        </div>
                    </div>

                    {/* Gradient overlay right side */}
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gray-900/40 to-transparent"></div>
                </div>

            </div>
        </>
    );

}
