import { useState } from "react";
import {
    User,
    Mail,
    Lock,
    Phone,
    Calendar,
    Plane
} from "lucide-react";
import { toast } from 'react-hot-toast';
import api from './Api';
import { useNavigate } from 'react-router';

export default function Auth() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);

    const [form, setForm] = useState({
        username: "",
        email: "",
        mobile: "",
        gender: "male",
        date_of_birth: "",
        password: ""
    });

    const handleSignUp = async () => {
        try {
            // Mapping frontend "username" state parameter to backend "name" parameter expected by MongoDB signup route
            const payload = {
                name: form.username,
                email: form.email,
                mobile: form.mobile || undefined, // prevents sending empty strings over to unique database indices
                gender: form.gender,
                date_of_birth: form.date_of_birth || undefined,
                password: form.password
            };

            const response = await api.post('/auth/signup', payload);
            if (response.status === 201) {
                toast.success("User created. Please log in.");
                setIsLogin(true); // Toggle to login view on successful registration
            }
        } catch (e: any) {
            console.error("Signup Error: ", e);
            toast.error(e.response?.data?.msg || "Failed to create account.");
        }
    };

    const handleLogIn = async () => {
        try {
            const { email, password } = form;
            const response = await api.post('/auth/login', { email, password });
            
            if (response.status === 200) {
                toast.success("Logged in successfully.");
                
                // Fix: Axios wraps the API body response object inside `.data`
                const token = response.data.key; 
                localStorage.setItem('token', token);
                
                navigate('/home');
            }
        } catch (e: any) {
            console.error("Login Error: ", e);
            toast.error(e.response?.data?.msg || "Incorrect credentials.");
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >
    ) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-primary text-primary-content p-4 rounded-2xl shadow-lg">
                        <Plane size={32} />
                    </div>
                    <h1 className="text-3xl font-bold mt-4">Book My Flight</h1>
                    <p className="text-base-content/60 mt-2 text-center">
                        Find, book and manage your flights
                    </p>
                </div>

                {/* Card */}
                <div className="card bg-base-200 shadow-2xl border border-base-300">
                    <div className="card-body">
                        {/* Signup Fields */}
                        {!isLogin && (
                            <>
                                <label className="input input-bordered flex items-center gap-2 mb-3">
                                    <User size={18} />
                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="Username"
                                        className="grow"
                                        value={form.username}
                                        onChange={handleChange}
                                    />
                                </label>

                                <label className="input input-bordered flex items-center gap-2 mb-3">
                                    <Phone size={18} />
                                    <input
                                        type="text"
                                        name="mobile"
                                        placeholder="Mobile Number"
                                        className="grow"
                                        value={form.mobile}
                                        onChange={handleChange}
                                    />
                                </label>

                                <select
                                    className="select select-bordered w-full mb-3"
                                    name="gender"
                                    value={form.gender}
                                    onChange={handleChange}
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>

                                <label className="input input-bordered flex items-center gap-2 mb-3">
                                    <Calendar size={18} />
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        className="grow"
                                        value={form.date_of_birth}
                                        onChange={handleChange}
                                    />
                                </label>
                            </>
                        )}

                        {/* Email */}
                        <label className="input input-bordered flex items-center gap-2 mb-3">
                            <Mail size={18} />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                className="grow"
                                value={form.email}
                                onChange={handleChange}
                            />
                        </label>

                        {/* Password */}
                        <label className="input input-bordered flex items-center gap-2 mb-5">
                            <Lock size={18} />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                className="grow"
                                value={form.password}
                                onChange={handleChange}
                            />
                        </label>

                        {/* Button (Fix: Function execution handles explicitly now) */}
                        <button
                            className="btn btn-primary w-full"
                            onClick={() => { isLogin ? handleLogIn() : handleSignUp() }}
                        >
                            {isLogin ? "Login" : "Create Account"}
                        </button>

                        {/* Footer */}
                        <div className="divider">OR</div>
                        <p className="text-center text-sm text-base-content/60">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-2 text-primary font-semibold hover:underline"
                            >
                                {isLogin ? "Signup" : "Login"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}