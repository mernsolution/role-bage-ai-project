
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utility/baseURL";

const Dashboard = () => {
  const [shopNames, setShopName] = useState([]);
  const [userName, setUserName] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/");
    }
  };

  const fetchShopNames = async () => {
    try {
      const response = await axiosInstance.get("/shop-name");
      if (response.status === 200) {
        setShopName(response.data.data.shopName);
        setUserName(response.data.data.userName);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Failed to fetch shop names:", error);
    }
  };

  useEffect(() => {
    fetchShopNames();
  }, []);


const handleClick = (shopName) => {
   window.location.href = `http://${shopName}.localhost:5173/`;
  // window.location.href = `https://${shopName.toLowerCase()}.mernsolution.com`;
};


  // const handleClick = (shop) => {
  //   // ✅ For local testing (no subdomain):
  //    window.location.href = `/shop-dashboard?shop=${shop}`;
  //   // const token = localStorage.getItem('authToken');
  //   // if (token) {
  //   //   // Pass token as URL parameter for initial authentication
  //   //   window.location.href = `http://${shop}.localhost:5173/?token=${encodeURIComponent(token)}`;
  //   // } else {
  //   //   window.location.href = `http://${shop}.localhost:5173/`;
  //   // }
  // };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome, {userName}</h2>

        <div className="relative">
          <img
            src="https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg"
            alt="Profile"
            className="w-10 h-10 rounded-full cursor-pointer"
            onClick={() => setShowDropdown(!showDropdown)}
          />

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-50">
              <h4 className="text-gray-700 font-semibold mb-2">Your Shops</h4>
              {shopNames.length > 0 ? (
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  {shopNames.map((shop, index) => (
                    <li key={index} className="cursor-pointer hover:underline" onClick={() => handleClick(shop)}>
                      {shop}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No shops found</p>
              )}
              <button
                onClick={handleLogout}
                className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow text-gray-700">
        <p>This is your dashboard. You can add more content here.</p>
      </div>
    </div>
  );
};

export default Dashboard;
