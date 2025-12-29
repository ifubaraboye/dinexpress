import { Link } from "react-router-dom";
import {
  User,
  Mail,
  MapPin,
  Lock,
  ChevronRight,
  LogOut,
  ShoppingBag,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const user = {
    name: "Oribi",
    email: "oribi@example.com",
    avatar: "/profilephoto.svg"
  };

  const menuItems = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Change Name", to: "/profile/change-username" },
        { icon: Mail, label: "Change Email Address", to: "/profile/change-email" },
        { icon: MapPin, label: "Change Delivery Addresses", to: "/profile/change-address" },
        { icon: Lock, label: "Change Password", to: "/profile/change-password" },
      ]
    },
  ];

  return (
    <div className="bg-white min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Minimal Header */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-6 ring-1 ring-gray-100 p-1 shadow-sm">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${user.name}&background=f3f4f6&color=374151`;
              }}
            />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{user.name}</h1>
          <p className="text-gray-500 mt-1">{user.email}</p>
        </div>

        {/* Menu Groups */}
        <div className="space-y-10">
          {menuItems.map((section, idx) => (
            <div key={idx}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 px-2">
                {section.title}
              </h2>
              <div className="space-y-1">
                {section.items.map((item, itemIdx) => (
                  <Link
                    key={itemIdx}
                    to={item.to}
                    className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-gray-400 group-hover:text-gray-900 transition-colors">
                        <item.icon size={20} strokeWidth={1.5} />
                      </div>
                      <span className="text-gray-700 font-medium group-hover:text-gray-900">{item.label}</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col items-center">
          <Button 
            variant="ghost" 
            className="w-full h-12 rounded-xl text-red-500 hover:text-white hover:bg-red-600 font-semibold gap-3 cursor-pointer"
          >
            <LogOut size={20} strokeWidth={2} />
            <span>Sign Out</span>
          </Button>
        </div>

      </div>
    </div>
  );
}
