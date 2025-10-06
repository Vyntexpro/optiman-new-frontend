import { api } from "./index";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchDevices = async ({
  pageNo,
  pageSize,
  companyId,
  branchId,
  buildingId,
  floorId,
  hallId,
  rowId,
  search,
}: {
  pageNo: number;
  pageSize: number;
  companyId: number;
  branchId?: number;
  buildingId?: number;
  floorId?: number;
  hallId?: number;
  rowId?: number;

  search?: string;
}) => {
  const { data } = await api.get(
    `/device/pageable/${companyId}?pageNo=${pageNo}&pageSize=${pageSize}${
      branchId !== undefined ? `&branchId=${branchId}` : ""
    }${buildingId !== undefined ? `&buildingId=${buildingId}` : ""}${
      floorId !== undefined ? `&floorId=${floorId}` : ""
    }${hallId !== undefined ? `&hallId=${hallId}` : ""}${
      rowId !== undefined ? `&rowId=${rowId}` : ""
    }${search ? `&search=${encodeURIComponent(search)}` : ""}`
  );
  return data;
};

export const deleteDevice = async (id: number) => {
  return api.delete(`/device/${id}`);
};

export const addDevice = async (deviceData: any) => {
  return api.post("/device", deviceData);
};

export const editDevice = async (id: number, deviceData: any) => {
  return api.put(`/device/${id}`, deviceData);
};

export const useDevicesQuery = (
  pageNo: number,
  pageSize: number,
  companyId: number,
  branchId?: number,
  buildingId?: number,
  floorId?: number,
  hallId?: number,
  rowId?: number,
  search?: string
) =>
  useQuery({
    queryKey: [
      "devices",
      pageNo,
      pageSize,
      branchId,
      companyId,
      buildingId,
      floorId,
      hallId,
      rowId,
      search,
    ],
    queryFn: () =>
      fetchDevices({
        pageNo,
        pageSize,
        branchId,
        companyId,
        buildingId,
        floorId,
        hallId,
        rowId,
        search,
      }),
  });

export const useDeleteDeviceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDevice,
    onSuccess: () => {
      toast.success("Device binding deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: () => toast.error("Failed to delete device binding"),
  });
};

export const useAddDeviceMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addDevice,
    onSuccess: () => {
      toast.success("Device binded successfully!");
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to bind device";
      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};

export const useEditDeviceMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, deviceData }: { id: number; deviceData: any }) =>
      editDevice(id, deviceData),
    onSuccess: () => {
      toast.success("Device binding updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (error: any) => {
      let message =
        error.response?.data?.message || "Failed to update device binding";
      if (message.length > 150) {
        message = "Failed to update device binding";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};
