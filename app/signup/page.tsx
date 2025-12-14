"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // To change pages
import { supabase } from "@/lib/supabase"; // The helper we made
import { ArrowRight, Heart, Loader2 } from "lucide-react";

export default function SignUp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: ""
  });

  const handleSignUp = async () => {
    if (!form.email || !form.password || !form.username) {
      alert("Please fill in all fields! 🐰");
      return;
    }

    setLoading(true);

    // 1. Create the user in Supabase
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        // We save the username here so it goes into your profile table automatically
        data: {
          username: form.username,
          avatar_url: "", // Empty for now
        }
      }
    });

    if (error) {
      alert("Error: " + error.message);
      setLoading(false);
    } else {
      // 2. If successful, go to Bias Picker!
      router.push("/signup/bias");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-pink-100">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Join NJZone 🎀</h1>
          <p className="text-gray-500 mt-2">Setup your account to get into the zone!</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-400 font-bold">@</span>
              <input 
                type="text" 
                placeholder="njzoneofficial"
                value={form.username}
                onChange={(e) => setForm({...form, username: e.target.value})}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-nj-pink/50 focus:border-nj-pink transition-all"
              />
            </div>
          </div>

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

          <button 
            onClick={handleSignUp}
            disabled={loading}
            className="w-full bg-nj-pink text-white font-bold py-3 rounded-xl shadow-lg shadow-pink-200 hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Next: Choose Bias <Heart size={20} className="fill-white" /></>}
          </button>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          Already a Bunny?{" "}
          <Link href="/login" className="text-nj-pink font-bold hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}