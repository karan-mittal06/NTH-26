"use client"
import { useAuth } from "@/context/AuthProvider";
import API from "@/utils/api"
import { useRouter } from "next/navigation";
import { useState } from "react"
import { toast } from "react-toastify";
import "./register.css";
import "../button.css";

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const validateForm = () => {
    if (!username || !email || !phone || !password) {
      toast.error('All fields are required.');
      return false;
    }

    const usernameRegex = /^[a-zA-Z0-9]{1,16}$/;
    if (!usernameRegex.test(username)) {
      toast.error('Username should be alphanumeric and up to 15 characters long.');
      return false;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      toast.error('Phone number must be 10 digits.');
      return false;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Stop submission if validation fails

    setLoading(true);
    try {
      const res = await API.post('/auth/register', { username, password, phone, email });
      login(res.data.user);
    } catch (err) {

      if (err.response.status == 429) {
        toast.error(err.response.data)
        setLoading(false)
      }
      else {
        toast.error(err.response?.data?.error || 'Register failed');
        setLoading(false)
      }

    }
  };

  return (
    <div className="h-screen overflow-y-auto relative">
      <img
        src={`Bert-Spider-Verse.webp`}
        alt="Background"
        className="fixed inset-0 w-full h-full -z-10 object-cover opacity-50 auth-bg-shift"
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-white/20 via-gray-400/30 to-gray-600/50"></div>

      <div className="min-h-screen flex items-center justify-center p-4 py-8">
        <div className="w-[90vw] max-w-[700px] z-10 my-16">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white drop-shadow-[0_0_25px_rgba(220,38,38,0.6)]">Register</h1>

          <form onSubmit={handleSubmit}>
          {/* 2x2 Grid for input fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Username Field */}
            <div>
              <label className="block text-white text-xl font-semibold mb-2 ml-2 drop-shadow-lg">Username</label>
              <div className="input-wrapper relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400 text-xl z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="alphanumeric, <= 15 characters"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mystic-input w-full p-4 pl-12 bg-slate-900 bg-opacity-60 text-white placeholder-slate-200 placeholder-opacity-60 rounded-full focus:outline-none text-lg"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-white text-xl font-semibold mb-2 ml-2 drop-shadow-lg">Email</label>
              <div className="input-wrapper relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400 text-xl z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="emailid@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mystic-input w-full p-4 pl-12 bg-slate-900 bg-opacity-60 text-white placeholder-slate-200 placeholder-opacity-60 rounded-full focus:outline-none text-lg"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-white text-xl font-semibold mb-2 ml-2 drop-shadow-lg">Phone Number</label>
              <div className="input-wrapper relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400 text-xl z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  pattern="[0-9]{10}"
                  placeholder="10 digits"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mystic-input w-full p-4 pl-12 bg-slate-900 bg-opacity-60 text-white placeholder-slate-200 placeholder-opacity-60 rounded-full focus:outline-none text-lg"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-white text-xl font-semibold mb-2 ml-2 drop-shadow-lg">Password</label>
              <div className="input-wrapper relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400 text-xl z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="password"
                  placeholder=">= 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mystic-input w-full p-4 pl-12 bg-slate-900 bg-opacity-60 text-white placeholder-slate-200 placeholder-opacity-60 rounded-full focus:outline-none text-lg"
                />
              </div>
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="cybr-btn w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Register'}<span aria-hidden>_</span>
            <span aria-hidden className="cybr-btn__glitch">{loading ? 'Registering..._' : 'Register_'}</span>
            <span aria-hidden className="cybr-btn__tag">NTH</span>
          </button>
        </form>
        <p className="mt-4 text-center text-white text-lg drop-shadow-lg">
          Already registered?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-red-400 hover:text-red-600 underline font-semibold"
          >
            Login here
          </button>
        </p>
      </div>
      </div>
    </div>

  )
}