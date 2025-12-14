"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // The key to the engine
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Stop the form from refreshing the page
    setLoading(true);
    setErrorMsg("");

    // 1. Ask Supabase to check the credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setErrorMsg(error.message); // Wrong password? User not found?
      setLoading(false);
    } else {
      // 2. Success! Unlock the door.
      router.push("/"); 
      router.refresh(); // Force the app to realize we are logged in
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-pink-100">
        
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-nj-pink rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-bold mb-4 rotate-3 shadow-lg shadow-pink-200">
            NJ
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back! 🐰</h1>
          <p className="text-gray-500 mt-2">Enter your credentials to hop back in.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Error Message Box */}
          {errorMsg && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              placeholder="bunnies@njzone.com" 
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-nj-pink/50 focus:border-nj-pink transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-nj-pink/50 focus:border-nj-pink transition-all"
            />
          </div>

          <div className="flex justify-end">
            <a href="#" className="text-sm text-nj-pink font-bold hover:underline">Forgot password?</a>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-nj-pink text-white font-bold py-3 rounded-xl shadow-lg shadow-pink-200 hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight size={20} /></>}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          Don't have an account?{" "}
          <Link href="/signup" className="text-nj-pink font-bold hover:underline">
            Join the club
          </Link>
        </div>
      </div>
    </div>
  );
}