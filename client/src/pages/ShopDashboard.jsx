
import { useEffect, useState } from "react";
import axiosInstance from "../utility/baseURL";
import { toast } from "react-toastify";

const ShopDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [shopName, setShopName] = useState("");

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        // Get hostname, e.g., techhive.authentication.mernsolution.com
        let hostname = window.location.hostname;
        // Extract subdomain
        let subdomain = hostname.split('.')[0];

        // Call backend to verify session and if user owns this shop
        const res = await axiosInstance.get("/shop-name");

        if (res.data && res.data.data.shopName.includes(subdomain)) {
          setShopName(subdomain);
        } else {
          toast.error("Unauthorized or shop does not belong to you");
          // Redirect to login or main page
          window.location.href = "https://authentication.mernsolution.com";
        }
      } catch (err) {
        console.error(err);
        toast.error("Session expired or unauthorized");
        window.location.href = "https://authentication.mernsolution.com";
      } finally {
        setLoading(false);
      }
    };

    fetchAuth();
  }, []);

  if (loading) return <div className="p-6">Verifying session...</div>;

  return (
    <div className="p-10 text-2xl font-bold">
      Welcome to <span className="text-blue-600">{shopName}</span> shop dashboard!
    </div>
  );
};

export default ShopDashboard;


// import { useEffect, useState } from "react";
// import axiosInstance from "../utility/baseURL";
// import { useSearchParams } from "react-router-dom";
// import { toast } from "react-toastify";

// const ShopDashboard = () => {
//   const [loading, setLoading] = useState(true);
//   const [shopName, setShopName] = useState("");
//   const [searchParams] = useSearchParams();

// useEffect(() => {
//   const fetchAuth = async () => {
//     try {
//       let hostname = window.location.hostname;
//       let currentSubdomain = hostname.split(".")[0];

//       // Fallback for localhost testing
//       if (hostname === "localhost") {
//         const testShop = searchParams.get("shop");
//         currentSubdomain = testShop;
//       }

//       const res = await axiosInstance.get("/shop-name");
//       if (res.data && res.data.data.shopName.includes(currentSubdomain)) {
//         setShopName(currentSubdomain);
//       } else {
//         toast.error("Unauthorized access. Redirecting...");
//         window.location.href = isLocalhost
//           ? "http://localhost:5173"
//           : "https://authentication.mernsolution.com";
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Session expired. Redirecting...");
//       window.location.href = "https://authentication.mernsolution.com";
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchAuth();
// }, []);


//   if (loading) return <div className="p-6">Verifying session...</div>;

//   return (
//     <div className="p-10 text-2xl font-bold">
//       This is {shopName} shop
//     </div>
//   );
// };

// export default ShopDashboard;

