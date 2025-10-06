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

export const deleteDevice = async (id: number) => {
  return api.delete(`/user/${id}`);
};

export const addDevice = async (deviceData: any) => {
  return api.post("/user/addDevice", deviceData);
};

export const editDevice = async (id: number, deviceData: any) => {
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
    mutationFn: deleteDevice,
    onSuccess: () => {
      toast.success("Device deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("Failed to delete device"),
  });
};

export const useAddUserMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addDevice,
    onSuccess: () => {
      toast.success("Device added successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to add device";
      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};

export const useEditUserMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, deviceData }: { id: number; deviceData: any }) =>
      editDevice(id, deviceData),
    onSuccess: () => {
      toast.success("Device updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to update device";
      if (message.length > 150) {
        message = "Failed to update device";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};
