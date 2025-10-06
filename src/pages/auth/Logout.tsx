import { useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const { setUserDetail } = useContext(AuthContext);
  const navigate = useNavigate();
  const logout = () => {
    localStorage.setItem("manual_logout", "true");
    setUserDetail(null);
    localStorage.removeItem("userDetail");
    localStorage.removeItem("auth_token");
    navigate("/", { replace: true });
  };

  useEffect(() => {
    logout();
  }, []);

  return null;
};

export default Logout;
