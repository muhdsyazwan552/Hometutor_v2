// resources/js/Pages/Auth/RegisterForm.jsx
import React from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';

export default function RegisterForm({ onSubmit }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        reference_code: '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(data); // pass data up to parent
        } else {
            post(route('register'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <InputLabel htmlFor="name" value="Name" />
                <TextInput
                    id="name"
                    name="name"
                    value={data.name}
                    className="mt-1 block w-full"
                    autoComplete="name"
                    isFocused={true}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                />
                <InputError message={errors.name} className="mt-2" />
            </div>

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
                    autoComplete="new-password"
                    onChange={(e) => setData('password', e.target.value)}
                    required
                />
                <InputError message={errors.password} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="reference_code" value="Reference code (optional)" />
                <TextInput
                    id="reference_code"
                    name="reference_code"
                    value={data.reference_code}
                    className="mt-1 block w-full uppercase"
                    autoComplete="off"
                    onChange={(e) => setData('reference_code', e.target.value.toUpperCase())}
                />
                {/* <p className="mt-1 text-xs text-slate-500">Leave blank if you are registering directly with Dasar Jati.</p> */}
                <InputError message={errors.reference_code} className="mt-2" />
            </div>

            <div className="flex justify-end">
                <PrimaryButton disabled={processing}>
                    Create parent account
                </PrimaryButton>
            </div>
        </form>
    );
}
