import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { 
  ArrowRightOnRectangleIcon, 
  UserCircleIcon, 
  BellIcon,
  ChevronDownIcon,
  BuildingOfficeIcon
} from "@heroicons/react/24/outline";
import { getMyBranch } from "../../api/staff"; // Import the API call

export default function StaffHeader() {
  const { user, logout } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const [branchName, setBranchName] = useState(""); // State for branch name
  const menuRef = useRef(null);

  // Fetch branch info from the API when the component mounts
  useEffect(() => {
    const fetchBranchInfo = async () => {
      try {
        const res = await getMyBranch();
        if (res.data && res.data.result) {
          setBranchName(res.data.result.branchName); // Set the branch name
        }
      } catch (error) {
        console.error("Failed to load branch info", error);
      }
    };

    fetchBranchInfo();

    // Close menu when clicked outside
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex justify-between items-center sticky top-0 z-20">
      {/* Left side: Role & Branch info */}
      <div className="hidden md:flex items-center gap-2">
        <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          {branchName ? `${branchName} - Hệ thống nhân viên khách sạn` : "Hệ thống nhân viên khách sạn"}
        </h2>

      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications */}
        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative">
          <BellIcon className="w-6 h-6" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-6 w-[1px] bg-gray-200 mx-2"></div>

        {/* User Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
            onClick={() => setShowMenu(!showMenu)}
          >
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.fullName}&background=2563eb&color=fff`}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover border border-blue-200"
            />
            <div className="hidden md:flex flex-col items-start leading-none">
              <span className="text-sm font-bold text-gray-700">{user?.fullName || "Nhân viên"}</span>
              <span className="text-[10px] text-gray-400 font-medium uppercase">Staff Member</span>
            </div>
            <ChevronDownIcon 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showMenu ? "rotate-180" : ""}`} 
            />
          </button>

          {/* Dropdown Content */}
          {showMenu && (
            <div className="absolute right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl w-52 py-2 animate-in fade-in zoom-in duration-150">
              <div className="px-4 py-2 border-b border-gray-50 mb-1">
                <p className="text-xs text-gray-400 italic">Đang làm việc tại</p>
                <p className="text-sm font-semibold text-blue-600 truncate">
                  {branchName || "Chi nhánh chính"} {/* Display branch name here */}
                </p>
              </div>
              
              <button className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors">
                <UserCircleIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium">Hồ sơ cá nhân</span>
              </button>

              <div className="border-t border-gray-50 mt-1 pt-1">
                <button
                  className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 text-red-500 transition-colors"
                  onClick={logout}
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span className="text-sm font-bold">Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
