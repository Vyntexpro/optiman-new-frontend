import { api } from "./index";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchUsers = async ({
  pageNo,
  pageSize,
  search,
  type,
}: {
  pageNo: number;
  pageSize: number;
  search?: string;
  type?: "devices" | "users";
}) => {
  const { data } = await api.get(
    `/user?pageNo=${pageNo}&pageSize=${pageSize}${
      search ? `&search=${encodeURIComponent(search)}` : ""
    }${type ? `&type=${type}` : ""}`
  );
  return data;
};

export const deleteUser = async (id: number) => {
  return api.delete(`/user/${id}`);
};

export const addUser = async (deviceData: any) => {
  return api.post("/user/add", deviceData);
};

export const editUser = async (id: number, deviceData: any) => {
  return api.put(`/user/updateUser/${id}`, deviceData);
};

export const useUsersQuery = (
  pageNo: number,
  pageSize: number,
  search?: string,
  type?: "devices" | "users"
) =>
  useQuery({
    queryKey: ["users", pageNo, pageSize, search, type],
    queryFn: () => fetchUsers({ pageNo, pageSize, search, type }),
  });

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("User deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("Failed to delete user"),
  });
};

export const useAddUserMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addUser,
    onSuccess: () => {
      toast.success("User added successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to add user";
      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};

export const useEditUserMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userData }: { id: number; userData: any }) =>
      editUser(id, userData),
    onSuccess: () => {
      toast.success("User updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to update user";
      if (message.length > 150) {
        message = "Failed to update user";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};
