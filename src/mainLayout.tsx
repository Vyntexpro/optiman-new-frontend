import { useContext, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import SideBar from "./app-components/common/Sidebar";
import NotFound from "./pages/NotFound";
import {
  admin,
  subAdmin,
  supervisor,
  subSupervisor,
  dashBoard1,
  dashBoard2,
} from "./lib/userRoles";
import Logout from "./pages/auth/Logout";
import DashBoard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import SuperAdminDevices from "./pages/SuperAdminDevices";
import Users from "./pages/Users";
import Branches from "./pages/Branches";
import Libraries from "./pages/Libraries/Libraries";
import { isTokenValid } from "./lib/checkAuthentication";
import Machines from "./pages/Machines";
import DeviceBinding from "./pages/DeviceBinding/DeviceBindingPage";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import { toast } from "sonner";
import Operators from "./pages/Operators";
import Buildings from "./pages/Buildings";
import Halls from "./pages/Halls";
import Floors from "./pages/Floors";
import Bundles from "./pages/Bundles";
import Rows from "./pages/Rows";

const MainLayout = () => {
  const { userDetail, setUserDetail } = useContext(AuthContext);
  const role = userDetail?.role?.name || "";
  const navigate = useNavigate();

  useEffect(() => {
    if (!isTokenValid()) {
      const manuallyLoggedOut =
        localStorage.getItem("manual_logout") === "true";
      setUserDetail(null);
      localStorage.removeItem("userDetail");
      localStorage.removeItem("auth_token");

      if (!manuallyLoggedOut) {
        navigate("/");
        setTimeout(() => {
          toast.error("Your session has expired. Please log in again");
        }, 500);
      } else {
        localStorage.removeItem("manual_logout");
        navigate("/");
      }
    }
  }, [navigate]);
  return (
    <div className="flex fixed w-full h-full">
      <SideBar />
      <div className="w-full flex flex-col">
        <Routes>
          {/* Role-based routes */}
          {dashBoard1.includes(role) && (
            <>
              <Route path="dashboard" element={<DashBoard />} />
            </>
          )}
          {/* {dashBoard2.includes(role) && (
            <Route path="qualityInspection" element={<DetailDashBoard />} />
          )} */}
          {role === "ROLE_SUPERADMIN" && (
            <>
              <Route path="companies" element={<Companies />} />
              <Route path="manage-devices" element={<SuperAdminDevices />} />
              <Route path="users" element={<Users />} />
            </>
          )}
          {admin.includes(role) && <></>}
          {subAdmin.includes(role) && (
            <>
              <Route path="branches" element={<Branches />} />
              <Route path="buildings" element={<Buildings />} />

              {/* <Route path="operationBulletin" element={<OperationBulletin />} /> */}
            </>
          )}
          {supervisor.includes(role) && (
            <>
              <Route path="halls" element={<Halls />} />
              <Route path="floors" element={<Floors />} />
              <Route path="rows" element={<Rows />} />
              <Route path="orders" element={<Orders />} />
              <Route path="order-detail" element={<OrderDetail />} />
              {/* <Route path="reports" element={<Reports />} /> */}
            </>
          )}
          {subSupervisor.includes(role) && (
            <>
              <Route path="machines" element={<Machines />} />
              <Route path="devices" element={<DeviceBinding />} />
              <Route path="libraries" element={<Libraries />} />
              <Route path="bundles" element={<Bundles />} />
              <Route path="operators" element={<Operators />} />
              {/* <Route path="settings" element={<Settings />} /> */}
            </>
          )}
          <Route path="logout" element={<Logout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

export default MainLayout;
