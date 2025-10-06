import { api } from "./index";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchColors = async ({
  pageNo,
  pageSize,
  companyId,
  search,
}: {
  pageNo: number;
  pageSize: number;
  companyId: number;
  search?: string;
}) => {
  const { data } = await api.get(
    `/orderColorLib/allOrderColorLibByCompanyId/${companyId}?pageNo=${pageNo}&pageSize=${pageSize}${
      search ? `&search=${encodeURIComponent(search)}` : ""
    }`
  );
  return data;
};

export const deleteColor = async (id: number) => {
  return api.delete(`/orderColorLib/delete/${id}`);
};

export const addColor = async (colorData: any) => {
  return api.post("/orderColorLib/add", colorData);
};

export const editColor = async (id: number, colorData: any) => {
  return api.put(`/orderColorLib/update/${id}`, colorData);
};

export const useColorsQuery = (
  pageNo: number,
  pageSize: number,
  companyId: number,
  search?: string
) =>
  useQuery({
    queryKey: ["colors", pageNo, pageSize, companyId, search],
    queryFn: () => fetchColors({ pageNo, pageSize, companyId, search }),
  });

export const useDeleteColorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteColor,
    onSuccess: () => {
      toast.success("Color deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["colors"] });
    },
    onError: () => toast.error("Failed to delete color"),
  });
};

export const useAddColorMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addColor,
    onSuccess: () => {
      toast.success("Color added successfully!");
      queryClient.invalidateQueries({ queryKey: ["colors"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to add color";
      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};

export const useEditColorMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, colorData }: { id: number; colorData: any }) =>
      editColor(id, colorData),
    onSuccess: () => {
      toast.success("Color updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["colors"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to update color";
      if (message.length > 150) {
        message = "Failed to update color";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};
