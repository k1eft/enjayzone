import Link from "next/link";
import { Calendar as CalendarIcon, ArrowLeft } from "lucide-react";

export default function Calendar() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-3xl border border-pink-100 shadow-sm">
      
      <div className="w-24 h-24 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
        <CalendarIcon size={48} />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">NJZone Calendar 📅</h1>
      <p className="text-gray-500 max-w-md mb-8">
        We are still organizing the comeback schedule. Check back soon for tour dates, birthdays, and release events!
      </p>

      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-8 max-w-sm">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</span>
        <div className="text-purple-500 font-bold">⏳ Coming Soon</div>
      </div>

      <Link href="/">
        <button className="flex items-center gap-2 text-gray-500 hover:text-nj-pink font-bold transition-colors">
          <ArrowLeft size={20} /> Back Home
        </button>
      </Link>
    </div>
  );
}