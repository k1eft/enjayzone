"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, BarChart2, Smile, Send, Loader2, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import imageCompression from 'browser-image-compression'; // 👈 Don't forget this!

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  
  // 📸 Image State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const router = useRouter();

  // 1. Handle Image Selection
  const handleImageSelect = async (e: any) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setImageFile(file);
  };

  // 2. Handle Posting
  const handlePost = async () => {
    if (!content.trim() && !imageFile) return; // Allow image-only posts too!

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You need to login to yap! 🐰");
      setLoading(false);
      return;
    }

    let finalImageUrl = null;

    // A. Upload Image (If exists)
    if (imageFile) {
        try {
            const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
            const compressedFile = await imageCompression(imageFile, options);
            
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`; // Simple path

            const { error: uploadError } = await supabase.storage
                .from('post_images') // ⚠️ Ensure this bucket exists!
                .upload(filePath, compressedFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('post_images')
                .getPublicUrl(filePath);
            
            finalImageUrl = publicUrl;
        } catch (error: any) {
            toast.error("Image upload failed: " + error.message);
            setLoading(false);
            return;
        }
    }

    // B. Insert Post
    const { error } = await supabase
      .from('posts')
      .insert({ 
        content: content,
        user_id: user.id,
        image_url: finalImageUrl // 👈 Saving the link
      });

    if (error) {
      toast.error("Failed to post: " + error.message);
    } else {
      // C. SUCCESS!
      setContent("");
      setImageFile(null);
      setPreviewUrl(null);
      
      toast.success(
        "Yapped successfully! 🗣️\n(You earn +5 Tokkins every 5 mins!)", 
        {
          duration: 4000,
          icon: '💸',
          style: { borderRadius: '12px', background: '#333', color: '#fff', fontWeight: 'bold' },
        }
      );
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100 mb-6 relative overflow-hidden">
      <Toaster position="bottom-center" />

      {/* Input Area */}
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0 border border-pink-100">
          <span className="text-2xl">🐰</span>
        </div>
        <div className="w-full">
            <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? 🥕"
            className="w-full h-24 p-3 bg-gray-50 rounded-2xl border-none resize-none focus:ring-2 focus:ring-nj-pink/50 focus:bg-white transition-all outline-none text-gray-700 placeholder:text-gray-400 mb-2"
            />
            
            {/* 🖼️ PREVIEW AREA */}
            {previewUrl && (
                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 mb-2 group">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                        onClick={() => { setPreviewUrl(null); setImageFile(null); }}
                        className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center mt-2 pl-16">
        <div className="flex gap-4 text-gray-400">
          
          {/* 📸 REAL IMAGE BUTTON */}
          <label className="hover:text-nj-pink transition-colors p-2 hover:bg-pink-50 rounded-full cursor-pointer">
            <ImageIcon size={20} />
            <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageSelect}
            />
          </label>

          <button className="hover:text-nj-pink transition-colors p-2 hover:bg-pink-50 rounded-full">
            <BarChart2 size={20} />
          </button>
          <button className="hover:text-nj-pink transition-colors p-2 hover:bg-pink-50 rounded-full">
            <Smile size={20} />
          </button>
        </div>

        <button 
          onClick={handlePost}
          disabled={loading || (!content.trim() && !imageFile)} // Allow post if image exists even if no text
          className="bg-nj-pink text-white px-6 py-2.5 rounded-full font-bold hover:bg-pink-400 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-pink-200"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              Post <Send size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
