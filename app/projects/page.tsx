import Link from "next/link";
import { Hammer, ArrowLeft } from "lucide-react";

export default function Projects() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-3xl border border-pink-100 shadow-sm">
      
      <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <Hammer size={48} />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects Area 📂</h1>
      <p className="text-gray-500 max-w-md mb-8">
        The Bunnies are currently building this feature. We are cooking up a way for you to showcase your fan projects to other Bunnies.
      </p>

      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-8 max-w-sm">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</span>
        <div className="text-nj-pink font-bold">🚧 Under Construction</div>
      </div>

      <Link href="/">
        <button className="flex items-center gap-2 text-gray-500 hover:text-nj-pink font-bold transition-colors">
          <ArrowLeft size={20} /> Back Home
        </button>
      </Link>
    </div>
  );
}