
import { useEffect, useState } from "react";
import axiosInstance from "../utility/baseURL";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const ShopDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [shopName, setShopName] = useState("");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        let hostname = window.location.hostname;
        let currentSubdomain = hostname.split(".")[0];

        if (hostname === "localhost") {
          const testShop = searchParams.get("shop");
          currentSubdomain = testShop;
        }

        const res = await axiosInstance.get("/shop-name");
        if (res.data && res.data.data.shopName.includes(currentSubdomain)) {
          setShopName(currentSubdomain);
        } else {
          toast.error("Unauthorized or shop does not belong to you");
          window.location.href = "http://localhost:5173";
        }
      } catch (err) {
        console.error(err);
        toast.error("Session expired or unauthorized");
        window.location.href = "http://localhost:5173";
      } finally {
        setLoading(false);
      }
    };

    fetchAuth();
  }, []);

  if (loading) return <div className="p-6">Verifying session...</div>;

  return (
    <div className="p-10 text-2xl font-bold">
      This is {shopName} shop
    </div>
  );
};

export default ShopDashboard;

