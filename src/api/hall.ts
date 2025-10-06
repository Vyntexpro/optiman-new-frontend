import { api } from "./index";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchHalls = async ({
  pageNo,
  pageSize,
  companyId,
  branchId,
  buildingId,
  floorId,
  search,
}: {
  pageNo: number;
  pageSize: number;
  companyId: number;
  branchId?: number;
  buildingId?: number;
  floorId?: number;
  search?: string;
}) => {
  const { data } = await api.get(
    `/hall/pageable/${companyId}?pageNo=${pageNo}&pageSize=${pageSize}${
      branchId !== undefined ? `&branchId=${branchId}` : ""
    }${buildingId !== undefined ? `&buildingId=${buildingId}` : ""}${
      floorId !== undefined ? `&floorId=${floorId}` : ""
    }${search ? `&search=${encodeURIComponent(search)}` : ""}`
  );
  return data;
};

export const deleteHall = async (id: number) => {
  return api.delete(`/hall/${id}`);
};

export const addHall = async (hallData: any) => {
  return api.post("/hall", hallData);
};

export const editHall = async (id: number, hallData: any) => {
  return api.put(`/hall/${id}`, hallData);
};

export const useHallsQuery = (
  pageNo: number,
  pageSize: number,
  companyId: number,
  branchId?: number,
  buildingId?: number,
  floorId?: number,
  search?: string
) =>
  useQuery({
    queryKey: [
      "halls",
      pageNo,
      pageSize,
      branchId,
      companyId,
      buildingId,
      floorId,
      search,
    ],
    queryFn: () =>
      fetchHalls({
        pageNo,
        pageSize,
        companyId,
        branchId,
        buildingId,
        floorId,
        search,
      }),
  });

export const useDeleteHallMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteHall,
    onSuccess: () => {
      toast.success("Hall deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["halls"] });
    },
    onError: () => toast.error("Failed to delete hall"),
  });
};

export const useAddHallMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addHall,
    onSuccess: () => {
      toast.success("Hall added successfully!");
      queryClient.invalidateQueries({ queryKey: ["halls"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to add hall";
      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};

export const useEditHallMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, hallData }: { id: number; hallData: any }) =>
      editHall(id, hallData),
    onSuccess: () => {
      toast.success("Hall updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["halls"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to update hall";
      if (message.length > 150) {
        message = "Failed to update hall";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};
