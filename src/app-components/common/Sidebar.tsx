import { Fragment, useContext } from "react";
import { NavLink } from "react-router-dom";
import {
  AiOutlineDashboard,
  AiOutlineLogout,
  AiOutlineIdcard,
  AiOutlineOrderedList,
  AiOutlineSetting,
  AiOutlineShoppingCart,
  AiOutlineDatabase,
  AiOutlineFileText,
  AiOutlinePieChart,
} from "react-icons/ai";
import { RiCommunityLine, RiLayoutGridLine, RiStackLine } from "react-icons/ri";
import { Gi3dStairs, GiSewingMachine } from "react-icons/gi";
import { TbDeviceGamepad } from "react-icons/tb";
import { BiBuilding, BiUser } from "react-icons/bi";
import { AuthContext } from "@/context/AuthContext";

const SideBar = () => {
  const { userDetail } = useContext(AuthContext);
  const navItems = [
    {
      role: [
        "ROLE_ADMIN",
        "ROLE_SUPERADMIN",
        "ROLE_SUBADMIN",
        "ROLE_SUPERVISOR",
      ],
      title: "Dashboard",
      to: "/dashboard",
      icon: <AiOutlineDashboard size={14} />,
    },
    {
      role: ["ROLE_SUPERADMIN"],
      title: "Manage Company",
      to: "/companies",
      icon: <BiBuilding size={14} />,
    },
    {
      role: ["ROLE_ADMIN", "ROLE_SUBADMIN"],
      title: "Manage Branches",
      to: "/branches",
      icon: <RiCommunityLine size={14} />,
    },
    {
      role: ["ROLE_ADMIN", "ROLE_SUBADMIN"],
      title: "Manage Buildings",
      to: "/buildings",
      icon: <BiBuilding size={14} />,
    },
    {
      role: ["ROLE_ADMIN", "ROLE_SUBADMIN", "ROLE_SUPERVISOR"],
      title: "Manage Floors",
      to: "/floors",
      icon: <Gi3dStairs size={14} />,
    },
    {
      role: ["ROLE_ADMIN", "ROLE_SUBADMIN", "ROLE_SUPERVISOR"],
      title: "Manage Halls",
      to: "/halls",
      icon: <RiLayoutGridLine size={14} />,
    },
    {
      role: ["ROLE_ADMIN", "ROLE_SUBADMIN", "ROLE_SUPERVISOR"],
      title: "Manage Rows",
      to: "/rows",
      icon: <AiOutlineOrderedList size={14} />,
    },
    {
      role: ["ROLE_ADMIN", "ROLE_SUBADMIN", "ROLE_SUPERVISOR"],
      title: "Manage Libraries",
      to: "/libraries",
      icon: <AiOutlineDatabase size={14} />,
    },
    {
      role: ["ROLE_ADMIN", "ROLE_SUBADMIN", "ROLE_SUPERVISOR"],
      title: "Manage Machines",
      to: "/machines",
      icon: <GiSewingMachine size={14} />,
    },
    {
      role: ["ROLE_SUPERADMIN"],
      title: "Manage Devices",
      to: "/manage-devices",
      icon: <TbDeviceGamepad size={16} />,
    },
    {
      role: ["ROLE_ADMIN", "ROLE_SUPERVISOR"],
      title: "Manage Devices",
      to: "/devices",
      icon: <TbDeviceGamepad size={16} />,
    },
    {
      role: ["ROLE_ADMIN", "ROLE_SUPERVISOR"],
      title: "Manage Orders",
      to: "/orders",
      icon: <AiOutlineShoppingCart size={14} />,
    },
    {
      role: ["ROLE_ADMIN", "ROLE_SUPERVISOR"],
      title: "Manage Bundles",
      to: "/bundles",
      icon: <RiStackLine size={14} />,
    },
    {
      role: ["ROLE_ADMIN", "ROLE_SUBADMIN", "ROLE_SUPERVISOR"],
      title: "Manage Operators",
      to: "/operators",
      icon: <AiOutlineIdcard size={14} />,
    },
    {
      role: ["ROLE_SUPERADMIN"],
      title: "Manage Users",
      to: "/users",
      icon: <BiUser size={14} />,
    },
    {
      role: [
        "ROLE_ADMIN",
        "ROLE_SUBADMIN",
        "ROLE_SUPERVISOR",
        "ROLE_SUBUSUPERVISOR",
      ],
      title: "Reports",
      to: "/reports",
      icon: <AiOutlinePieChart size={14} />,
    },
    // {
    //   role: [
    //     "ROLE_ADMIN",
    //     "ROLE_SUBADMIN",
    //     "ROLE_SUPERVISOR",
    //     "ROLE_SUBUSUPERVISOR",
    //   ],
    //   title: "Operation Bulletin",
    //   to: "/operationBulletin",
    //   icon: <AiOutlineFileText size={14} />,
    // },
    // {
    //   role: [
    //     "ROLE_ADMIN",
    //     "ROLE_SUBADMIN",
    //     "ROLE_SUPERVISOR",
    //     "ROLE_SUBUSUPERVISOR",
    //     "ROLE_USER",
    //   ],
    //   title: "Setting",
    //   to: "/settings",
    //   icon: <AiOutlineSetting size={14} />,
    // },
    {
      role: [
        "ROLE_SUPERADMIN",
        "ROLE_ADMIN",
        "ROLE_SUBADMIN",
        "ROLE_SUPERVISOR",
        "ROLE_SUBUSUPERVISOR",
        "ROLE_USER",
      ],
      title: "Logout",
      to: "/logout",
      icon: <AiOutlineLogout size={14} />,
    },
  ];

  return (
    <div className="w-[210px] h-screen bg-white border-r border-gray/10 fixed left-0 top-0 flex flex-col">
      <div className="flex items-center bg-white justify-between px-4 py-2 border-b border-gray/10">
        {" "}
        <img
          src="/src/assets/images/optiman-logo.png"
          alt="Optiman Logo"
          className="w-[90px] h-[15px] ml-1 object-cover"
        />
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {navItems.map((item, i) => (
          <Fragment key={i}>
            {item.role?.includes(userDetail?.role?.name || "") || !item.role ? (
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-[9px] rounded-lg w-[190px] transition-colors ${
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-slate-100 backdrop-blur-lg"
                      : "text-gray/80 hover:text-primary"
                  }`
                }
              >
                {item.icon}
                <span className="text-[11px] font-semibold">{item.title}</span>
              </NavLink>
            ) : null}
          </Fragment>
        ))}
      </nav>
    </div>
  );
};

export default SideBar;
