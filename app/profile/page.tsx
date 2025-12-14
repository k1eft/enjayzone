"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, LogOut, Upload, Loader2, Save } from "lucide-react";

export default function Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({});

  // Fetch Profile on Load
  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(data || {});
      setLoading(false);
    };
    getProfile();
  }, [router]);

  // 📤 Upload Helper Function
  const uploadImage = async (event: any, column: 'avatar_url' | 'banner_url') => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Supabase Storage (using 'avatars' bucket for everything)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update Profile Database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [column]: publicUrl }) // Dynamic update (banner or avatar)
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 4. Update Local State
      setProfile({ ...profile, [column]: publicUrl });
      alert("Upload successful! ✨");

    } catch (error: any) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  if (loading) return <div className="p-10 text-center">Loading Profile... 🐇</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-[80vh] rounded-3xl shadow-sm border border-pink-100 overflow-hidden relative">
      
      {/* 🖼️ BANNER AREA */}
      <div className="h-48 bg-gray-200 relative group">
        {profile.banner_url ? (
          <Image src={profile.banner_url} alt="Banner" fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-nj-pink to-purple-400"></div>
        )}
        
        {/* Banner Upload Button (Hidden until hover) */}
        <label className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          <div className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 border border-white/30">
             <Camera size={20} /> Change Banner
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={(e) => uploadImage(e, 'banner_url')}
            disabled={uploading}
          />
        </label>
      </div>

      {/* 👤 AVATAR & INFO */}
      <div className="px-8 pb-8">
        <div className="relative -mt-16 mb-4 flex justify-between items-end">
          
{/* Avatar Circle */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-md">
              {profile.avatar_url ? (
                <Image 
                  src={profile.avatar_url} 
                  alt="Avatar" 
                  fill 
                  // 👇 ADD 'rounded-full' HERE
                  className="object-cover rounded-full" 
                />
              ) : (
                <div className="w-full h-full bg-nj-pink flex items-center justify-center text-4xl font-bold text-white">
                  {profile.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Avatar Upload Button */}
            <label className="absolute bottom-0 right-0 bg-gray-900 text-white p-2 rounded-full cursor-pointer hover:bg-gray-700 transition-colors shadow-lg border-2 border-white">
              <Camera size={16} />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => uploadImage(e, 'avatar_url')}
                disabled={uploading}
              />
            </label>
          </div>

          {/* Edit Profile Button (Placeholder) */}
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-full font-bold hover:bg-gray-50 text-sm">
            Edit Profile
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">@{profile.username}</h1>
        <div className="flex items-center gap-2 mt-1 mb-6">
          <span className="bg-pink-100 text-nj-pink px-2 py-0.5 rounded-full text-xs font-bold border border-pink-200">
            {profile.bias} Stan
          </span>
          <span className="text-gray-500 text-sm">Joined {new Date().getFullYear()}</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
            <div className="text-xl font-bold text-gray-900">{profile.tokki_points || 0}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-bold">TokkiPoints</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
             <div className="text-xl font-bold text-gray-900">0</div>
             <div className="text-xs text-gray-500 uppercase tracking-wide font-bold">Friends</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
             <div className="text-xl font-bold text-gray-900">12</div>
             <div className="text-xs text-gray-500 uppercase tracking-wide font-bold">Yaps</div>
          </div>
        </div>

        <button 
          onClick={handleSignOut}
          className="w-full border border-red-100 bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={18} /> Sign Out
        </button>

      </div>

      {uploading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
             <Loader2 className="animate-spin text-nj-pink" size={48} />
             <p className="font-bold text-gray-600">Uploading...</p>
          </div>
        </div>
      )}

    </div>
  );
}