import { api } from "./index";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchFloors = async ({
  pageNo,
  pageSize,
  companyId,
  branchId,
  buildingId,
  search,
}: {
  pageNo: number;
  pageSize: number;
  companyId: number;
  branchId?: number;
  buildingId?: number;
  search?: string;
}) => {
  const { data } = await api.get(
    `/floor/pageable/${companyId}?pageNo=${pageNo}&pageSize=${pageSize}${
      branchId !== undefined ? `&branchId=${branchId}` : ""
    }${buildingId !== undefined ? `&buildingId=${buildingId}` : ""}${
      search ? `&search=${encodeURIComponent(search)}` : ""
    }`
  );
  return data;
};

export const deleteFloor = async (id: number) => {
  return api.delete(`/floor/${id}`);
};

export const addFloor = async (floorData: any) => {
  return api.post("/floor", floorData);
};

export const editFloor = async (id: number, floorData: any) => {
  return api.put(`/floor/${id}`, floorData);
};

export const useFloorsQuery = (
  pageNo: number,
  pageSize: number,
  companyId: number,
  branchId?: number,
  buildingId?: number,
  search?: string
) =>
  useQuery({
    queryKey: [
      "floors",
      pageNo,
      pageSize,
      companyId,
      branchId,
      buildingId,
      search,
    ],
    queryFn: () =>
      fetchFloors({
        pageNo,
        pageSize,
        companyId,
        branchId,
        buildingId,
        search,
      }),
  });

export const useDeleteFloorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFloor,
    onSuccess: () => {
      toast.success("Floor deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["floors"] });
    },
    onError: () => toast.error("Failed to delete floor"),
  });
};

export const useAddFloorMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addFloor,
    onSuccess: () => {
      toast.success("Floor added successfully!");
      queryClient.invalidateQueries({ queryKey: ["floors"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to add floor";
      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};

export const useEditFloorMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, floorData }: { id: number; floorData: any }) =>
      editFloor(id, floorData),
    onSuccess: () => {
      toast.success("Floor updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["floors"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to update floor";
      if (message.length > 150) {
        message = "Failed to update floor";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};
