"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link"; // 👈 Don't forget this!
import { Loader2, Mail, Lock, Gamepad2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 📧 Email Login Only (Signup is handled elsewhere now)
  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back! 👋");
      router.refresh();
      router.push("/");
    }
    setLoading(false);
  };

  // 👾 DISCORD LOGIN
  const handleDiscord = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Toaster position="bottom-center" />
      
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">NJZone 🐰</h1>
          <p className="text-gray-500">Enter the YapZone.</p>
        </div>

        {/* 👾 DISCORD BUTTON */}
        <button 
          onClick={handleDiscord}
          disabled={loading}
          className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mb-6 shadow-md shadow-indigo-100"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Gamepad2 size={20} />}
          Continue with Discord
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-bold">Or use email</span></div>
        </div>

        {/* Email Form */}
        <div className="space-y-4">
          <div className="bg-gray-50 flex items-center gap-3 p-3 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-nj-pink/50">
            <Mail className="text-gray-400" size={20} />
            <input 
              type="email" placeholder="Email" className="bg-transparent outline-none flex-1 text-gray-900"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="bg-gray-50 flex items-center gap-3 p-3 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-nj-pink/50">
            <Lock className="text-gray-400" size={20} />
            <input 
              type="password" placeholder="Password" className="bg-transparent outline-none flex-1 text-gray-900"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            onClick={handleLogin} disabled={loading}
            className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Sign In"}
          </button>
        </div>

        {/* 👇 THE FIX: Actual Link to Signup Page */}
        <p className="text-center mt-6 text-sm text-gray-500">
          New to NJZone?
          <Link href="/signup" className="ml-2 text-nj-pink font-bold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}