import { api } from "./index";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchBuildings = async ({
  pageNo,
  pageSize,
  companyId,
  branchId,
  search,
}: {
  pageNo: number;
  pageSize: number;
  companyId: number;
  branchId?: number;
  search?: string;
}) => {
  const { data } = await api.get(
    `/building/pageable/${companyId}?pageNo=${pageNo}&pageSize=${pageSize}${
      branchId !== undefined ? `&branchId=${branchId}` : ""
    }${search ? `&search=${encodeURIComponent(search)}` : ""}`
  );
  return data;
};

export const deleteBuilding = async (id: number) => {
  return api.delete(`/building/${id}`);
};

export const addBuilding = async (buildingData: any) => {
  return api.post("/building", buildingData);
};

export const editBuilding = async (id: number, buildingData: any) => {
  return api.put(`/building/${id}`, buildingData);
};

export const useBuildingsQuery = (
  pageNo: number,
  pageSize: number,
  companyId: number,
  branchId?: number,
  search?: string
) =>
  useQuery({
    queryKey: ["buildings", pageNo, pageSize, companyId, branchId, search],
    queryFn: () =>
      fetchBuildings({ pageNo, pageSize, companyId, branchId, search }),
  });

export const useDeleteBuildingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBuilding,
    onSuccess: () => {
      toast.success("Building deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
    },
    onError: () => toast.error("Failed to delete building"),
  });
};

export const useAddBuildingMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addBuilding,
    onSuccess: () => {
      toast.success("Building added successfully!");
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to add building";
      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};

export const useEditBuildingMutation = (
  setApiError?: (msg: string) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, buildingData }: { id: number; buildingData: any }) =>
      editBuilding(id, buildingData),
    onSuccess: () => {
      toast.success("Building updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
    },
    onError: (error: any) => {
      let message =
        error.response?.data?.message || "Failed to update building";
      if (message.length > 150) {
        message = "Failed to update building";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};
