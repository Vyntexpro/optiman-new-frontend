import { api } from "./index";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchMachines = async ({
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
    `/machine/pageable/${companyId}?pageNo=${pageNo}&pageSize=${pageSize}${
      branchId !== undefined ? `&branchId=${branchId}` : ""
    }${buildingId !== undefined ? `&buildingId=${buildingId}` : ""}${
      floorId !== undefined ? `&floorId=${floorId}` : ""
    }${hallId !== undefined ? `&hallId=${hallId}` : ""}${
      rowId !== undefined ? `&rowId=${rowId}` : ""
    }${search ? `&search=${encodeURIComponent(search)}` : ""}`
  );
  return data;
};

export const deleteMachine = async (id: number) => {
  return api.delete(`/machine/${id}`);
};

export const addMachine = async (machineData: any) => {
  return api.post("/machine", machineData);
};

export const editMachine = async (id: number, machineData: any) => {
  return api.put(`/machine/${id}`, machineData);
};

export const useMachinesQuery = (
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
      "machines",
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
      fetchMachines({
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

export const useDeleteMachineMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMachine,
    onSuccess: () => {
      toast.success("Machine deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["machines"] });
    },
    onError: () => toast.error("Failed to delete machine"),
  });
};

export const useAddMachineMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addMachine,
    onSuccess: () => {
      toast.success("Machine added successfully!");
      queryClient.invalidateQueries({ queryKey: ["machines"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to add machine";
      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};

export const useEditMachineMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, machineData }: { id: number; machineData: any }) =>
      editMachine(id, machineData),
    onSuccess: () => {
      toast.success("Machine updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["machines"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to update machine";
      if (message.length > 150) {
        message = "Failed to update machine";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};
