import React, { createContext, useEffect, useState, ReactNode } from "react";
import { UserDetail } from "@/types/auth";
import { isTokenValid } from "@/lib/checkAuthentication";

interface AuthContextType {
  userDetail: UserDetail | null;
  setUserDetail: (data: UserDetail | null) => void;
  isLoggedIn: boolean;
  companyId: number | null;
}

export const AuthContext = createContext<AuthContextType>({
  userDetail: null,
  setUserDetail: () => {},
  isLoggedIn: false,
  companyId: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userDetail");
    const token = localStorage.getItem("auth_token");

    if (storedUser && token && isTokenValid()) {
      setUserDetail(JSON.parse(storedUser));
    } else {
      localStorage.removeItem("userDetail");
      localStorage.removeItem("auth_token");
      setUserDetail(null);
    }
  }, []);

  const companyId = userDetail?.user?.company?.id ?? null;

  return (
    <AuthContext.Provider
      value={{
        userDetail,
        setUserDetail,
        isLoggedIn: !!userDetail?.token,
        companyId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
