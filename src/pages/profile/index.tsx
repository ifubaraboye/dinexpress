import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function Profile() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const convexUser = useQuery(api.users.current);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const userData = {
    name: user?.fullName || convexUser?.name || "User",
    email: user?.primaryEmailAddress?.emailAddress || "No email",
    avatar: user?.imageUrl || "/profilephoto.svg"
  };

  const menuItems = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Change Name", to: "change-username" },
        { icon: Mail, label: "Change Email Address", to: "change-email" },
        // { icon: MapPin, label: "Change Delivery Addresses", to: "change-address" },
        { icon: Lock, label: "Change Password", to: "change-password" },
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
              src={userData.avatar}
              alt={userData.name}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{userData.name}</h1>
          <p className="text-gray-500 mt-1">{userData.email}</p>
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
            onClick={handleSignOut}
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
