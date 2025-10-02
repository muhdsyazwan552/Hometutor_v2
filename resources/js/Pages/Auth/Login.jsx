import React, { useState, useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import {AnimatePresence, motion } from 'framer-motion';
import RegisterForm from './Register';



const images = [
  "/images/swp.jpg",
  "/images/swp2.jpg", 
  "/images/swp3.jpg",
  "/images/swp4.jpg",
  "/images/swp5.jpg",
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

 


  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000); // Change slide every 3 seconds
    return () => clearInterval(interval);
  }, []);

    return (
        <>
            <Head title={isLogin ? "Log in" : "Register"} />

            <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
                {/* Left side image */}
                <div className="hidden lg:flex items-center justify-center bg-gray-100 p-3 h-100 overflow-hidden relative">
  <motion.div
    className="flex h-full w-full"
    animate={{ x: `-${currentIndex * 50}%` }}
    transition={{ duration: 0.8, ease: "easeInOut" }}
  >
    {/* Duplicate images untuk seamless loop */}
    {[...images, ...images].map((image, index) => (
      <motion.div
        key={index}
        className="flex-shrink-0 w-1/2 h-full px-2"
        whileHover={{ scale: 1.02 }}
      >
        <motion.img
          src={image}
          alt={`Slide ${(index % images.length) + 1}`}
          className="h-full w-full object-cover rounded-xl shadow-md"
          initial={{ opacity: 0.8 }}
          animate={{ 
            opacity: (currentIndex % images.length) === (index % images.length) ? 1 : 0.8,
            y: (currentIndex % images.length) === (index % images.length) ? 0 : 5
          }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>
    ))}
  </motion.div>

  {/* Indicators - hanya show original images */}
  <div className="absolute bottom-4 flex space-x-2">
    {images.map((_, index) => (
      <button
        key={index}
        onClick={() => setCurrentIndex(index)}
        className={`h-2 w-2 rounded-full transition-all ${
          (currentIndex % images.length) === index ? "bg-white w-4" : "bg-white/50"
        }`}
      />
    ))}
  </div>
</div>

                {/* Right Form */}
                <div className="flex items-center justify-center p-8 bg-white">
                    <div className="w-full max-w-md">

                        {/* Tabs */}
<div className="flex mb-6 justify-center gap-0 ">
    <button
        onClick={() => setIsLogin(true)}
        className={`px-4 py-1 text-md rounded-s-lg font-medium border transition-all duration-300 ${
            isLogin
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
        }`}
    >
        Login
    </button>
    <button
        onClick={() => setIsLogin(false)}
        className={`px-4 py-1 text-md rounded-e-lg font-medium border transition-all duration-300 ${
            !isLogin
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
        }`}
    >
        Register
    </button>
</div>


                        {status && (
                            <div className="mb-4 text-sm font-medium text-green-600">
                                {status}
                            </div>
                        )}

                        <AnimatePresence mode="wait">
    <motion.div
        key={isLogin ? 'login' : 'register'}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.4 }}
    >
        {isLogin ? (
            <form onSubmit={submit} className="space-y-4">
                {/* Login form fields */}
                <div>
    <InputLabel htmlFor="email" value="Email" />
    <TextInput
        id="email"
        type="email"
        name="email"
        value={data.email}
        className="mt-1 block w-full"
        autoComplete="username"
        onChange={(e) => setData('email', e.target.value)}
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
        className="mt-1 block w-full"
        autoComplete="current-password"
        onChange={(e) => setData('password', e.target.value)}
        required
    />
    <InputError message={errors.password} className="mt-2" />
</div>

<div className="block mt-4">
    <label className="flex items-center">
        <Checkbox
            name="remember"
            checked={data.remember}
            onChange={(e) => setData('remember', e.target.checked)}
        />
        <span className="ms-2 text-sm text-gray-600">Remember me</span>
    </label>
</div>

<div className="flex items-center justify-between mt-4">
    {canResetPassword && (
        <Link
            href={route('password.request')}
            className="underline text-sm text-gray-600 hover:text-gray-900"
        >
            Forgot your password?
        </Link>
    )}

    <PrimaryButton className="ml-4" disabled={processing}>
        Log in
    </PrimaryButton>
</div>

            </form>
        ) : (
            <RegisterForm />
        )}
    </motion.div>
</AnimatePresence>


                    </div>
                </div>
            </div>
        </>
    );
}
