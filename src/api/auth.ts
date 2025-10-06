import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "./index";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { LoginCredentials, LoginResponse } from "@/types/auth";
import { UserDetail } from "@/types/auth";

const loginUser = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const response = await api.post("/user/login", credentials);
  return response.data;
};

export const useLoginMutation = (setApiError?: (msg: string) => void) => {
  const navigate = useNavigate();
  const { setUserDetail } = useContext(AuthContext);

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      const userDetail: UserDetail = {
        allRole: data.allRole ?? [],
        allowedRole: data.allowedRole ?? [],
        company: data.company ?? null,
        role: data.role,
        token: data.token,
        user: data.user,
      };
      setUserDetail(userDetail);
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("userDetail", JSON.stringify(data));

      toast.success("Logged in successfully!");
      navigate("/dashboard");
    },
    onError: (error: any) => {
      let message = error?.message || "Login failed";
      if (message === "Network Error") {
        message = "Server is not responding. Try again";
      } else if (message === "No value present" || "Bad credentials") {
        message = "Invalid username or password";
      }
      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};
