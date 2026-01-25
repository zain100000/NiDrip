import React, {useState, useEffect} from "react";
import { useLocation } from "react-router-dom";

const UserDetails = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
      const timer = setTimeout(() => {
        const data = location.state?.user || null;
        setUser(data);
        if (data?.productImages?.length > 0)
          setActiveImage(data.productImages[0]);
        setLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }, [location.state]);

  console.log('USER DEtails', user)

  return <div>User Details</div>;
};

export default UserDetails;
