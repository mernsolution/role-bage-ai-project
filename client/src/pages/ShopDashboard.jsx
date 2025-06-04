
import { useEffect, useState } from "react";
import axiosInstance from "../utility/baseURL";
import { toast } from "react-toastify";

const ShopDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [shopName, setShopName] = useState("");

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        let hostname = window.location.hostname;

        let subdomain = hostname.split('.')[0];
        const res = await axiosInstance.get("/shop-name");

        if (res.data && res.data.data.shopName.includes(subdomain)) {
          setShopName(subdomain);
        } else {
          toast.error("Unauthorized or shop does not belong to you");
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
