import { api } from "./index";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchSizes = async ({
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
    `/orderSizeLib/allOrderSizeLibByCompanyId/${companyId}?pageNo=${pageNo}&pageSize=${pageSize}${
      search ? `&search=${encodeURIComponent(search)}` : ""
    }`
  );
  return data;
};

export const deleteSize = async (id: number) => {
  return api.delete(`/orderSizeLib/delete/${id}`);
};

export const addSize = async (SizeData: any) => {
  return api.post("/orderSizeLib/add", SizeData);
};

export const editSize = async (id: number, SizeData: any) => {
  return api.put(`/orderSizeLib/update/${id}`, SizeData);
};

export const useSizesQuery = (
  pageNo: number,
  pageSize: number,
  companyId: number,
  search?: string
) =>
  useQuery({
    queryKey: ["sizes", pageNo, pageSize, companyId, search],
    queryFn: () => fetchSizes({ pageNo, pageSize, companyId, search }),
  });

export const useDeleteSizeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSize,
    onSuccess: () => {
      toast.success("Size deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["sizes"] });
    },
    onError: () => toast.error("Failed to delete size"),
  });
};

export const useAddSizeMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addSize,
    onSuccess: () => {
      toast.success("Size added successfully!");
      queryClient.invalidateQueries({ queryKey: ["sizes"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to add size";
      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};

export const useEditSizeMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, sizeData }: { id: number; sizeData: any }) =>
      editSize(id, sizeData),
    onSuccess: () => {
      toast.success("Size updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["sizes"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to update size";
      if (message.length > 150) {
        message = "Failed to update size";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};
