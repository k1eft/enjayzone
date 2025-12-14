import Link from "next/link";
import { MessageCircle, Users } from "lucide-react";

export default function Chat() {
  // These IDs will be the URL: /chat/global, /chat/hanni, etc.
  const zones = [
    {
      id: "global",
      name: "Global Chat 🌍",
      desc: "General Yap Session",
      members: 1240,
      status: "LIVE",
      color: "bg-blue-100 text-blue-700"
    },
    {
      id: "hanni-yappers",
      name: "Hanni's Little Yappers 🐰",
      desc: "Don't tell her that her unicorn is pregnant",
      members: 850,
      status: "LIVE",
      color: "bg-pink-100 text-pink-700"
    },
    {
      id: "danielle-sunshine",
      name: "Danielle Enjoyers 🌻",
      desc: "Sunshine corner",
      members: 420,
      status: "LIVE",
      color: "bg-yellow-100 text-yellow-700"
    },
    {
      id: "haerin-frogs",
      name: "Haerin's Frogs 🐸",
      desc: "Kang Haerin supremacy",
      members: 600,
      status: "LIVE",
      color: "bg-green-100 text-green-700"
    },
    {
      id: "hyein-strawberries",
      name: "Hyein's Strawberries 🍓",
      desc: "Maknae on top",
      members: 300,
      status: "LIVE",
      color: "bg-purple-100 text-purple-700"
    },
    {
      id: "minji-cleaning",
      name: "Kim Minji & Friends 🐻",
      desc: "Cleaning patrol",
      members: 550,
      status: "LIVE",
      color: "bg-gray-100 text-gray-700"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">YapZones 💁‍♀️</h1>
        <p className="text-gray-500">Hop into a zone and start chatting with other Bunnies!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {zones.map((zone) => (
          <div key={zone.id} className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 hover:shadow-md transition-shadow">
            
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${zone.color}`}>
                #
              </div>
              <span className="bg-red-50 text-red-500 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> {zone.status}
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-1">{zone.name}</h3>
            <p className="text-sm text-gray-500 mb-6">{zone.desc}</p>

            <div className="flex items-center justify-between text-gray-500 text-sm mt-4 border-t border-gray-50 pt-4">
              <div className="flex items-center gap-1">
                <Users size={16} />
                {/* Now 'zone' is definitely defined! */}
                <span>{zone.members} Bunnies</span>
              </div>
              
              <Link href={`/chat/${zone.id}`}> 
                <button className="flex items-center gap-1 font-bold text-gray-900 hover:text-nj-pink transition-colors">
                  Join <MessageCircle size={16} />
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}