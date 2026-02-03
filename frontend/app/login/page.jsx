"use client"
import { useAuth } from "@/context/AuthProvider";
import API from "@/utils/api"
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import "../register/register.css";
import "../button.css";

function ToastFunction(){
  const toastShown = useRef(false);
    const {logout} = useAuth();
    const searchParams = useSearchParams();
    useEffect(() => {
      if(JSON.parse(searchParams.get("unauthenticated"))&& !toastShown.current){
        toast.info("Please login first.");
        toastShown.current = true;
        logout();
      }
    },[searchParams]);
  return (
    <></>
  )
};

export default function LoginPage(){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const {login} = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        if(!username || !password){
          setLoading(false);
          toast.error("Please fill all the fields");
          return;
        }
        try {
            const res = await API.post('/auth/login', { username, password });
            login(res.data.user);
            router.push('/')
        } catch (err) {
            toast.error(err.response?.data?.error || 'Login failed');
        }finally{
            setLoading(false)
        }
    };

    return (
      <div className="h-screen overflow-y-auto relative">
        <Suspense fallback={null}>
          <ToastFunction />
        </Suspense>

        <img
          src={`Bert-Spider-Verse.webp`}
          alt="Background"
          className="fixed inset-0 w-full h-full -z-10 object-cover opacity-50 auth-bg-shift"
        />
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-white/20 via-gray-400/30 to-gray-600/50"></div>
        
        <div className="min-h-screen flex items-center justify-center p-4 py-8">
          <div className="w-[90vw] max-w-[500px] z-10 my-16">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white drop-shadow-[0_0_25px_rgba(220,38,38,0.6)]">Login</h1>
          
            <form onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="mb-4">
              <label className="block text-white text-xl font-semibold mb-2 ml-2 drop-shadow-lg">Username</label>
              <div className="input-wrapper relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400 text-xl z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mystic-input w-full p-4 pl-12 bg-slate-900 bg-opacity-60 text-white placeholder-slate-200 placeholder-opacity-60 rounded-full focus:outline-none text-lg"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <label className="block text-white text-xl font-semibold mb-2 ml-2 drop-shadow-lg">Password</label>
              <div className="input-wrapper relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400 text-xl z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mystic-input w-full p-4 pl-12 bg-slate-900 bg-opacity-60 text-white placeholder-slate-200 placeholder-opacity-60 rounded-full focus:outline-none text-lg"
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="cybr-btn w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}<span aria-hidden>_</span>
              <span aria-hidden className="cybr-btn__glitch">{loading ? 'Logging in..._' : 'Login_'}</span>
              <span aria-hidden className="cybr-btn__tag">NTH</span>
            </button>
          </form>
          <p className="mt-4 text-center text-white text-lg drop-shadow-lg">
            Not a user yet?{' '}
            <button
              onClick={() => router.push('/register')}
              className="text-red-400 hover:text-red-600 underline font-semibold"
            >
              Register here
            </button>
          </p>
          </div>
        </div>
      </div>
    );
}