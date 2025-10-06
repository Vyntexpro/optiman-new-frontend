import { api } from "./index";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchOperations = async ({
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
    `/operationCard/allOperationCardByCompanyId/${companyId}?pageNo=${pageNo}&pageSize=${pageSize}${
      search ? `&search=${encodeURIComponent(search)}` : ""
    }`
  );
  return data;
};

export const deleteOperation = async (id: number) => {
  return api.delete(`/operationCard/delete/${id}`);
};

export const addOperation = async (operationData: any) => {
  return api.post("/operationCard/add", operationData);
};

export const editOperation = async (id: number, operationData: any) => {
  return api.put(`/operationCard/update/${id}`, operationData);
};

export const useOperationsQuery = (
  pageNo: number,
  pageSize: number,
  companyId: number,
  search?: string
) =>
  useQuery({
    queryKey: ["operations", pageNo, pageSize, companyId, search],
    queryFn: () => fetchOperations({ pageNo, pageSize, companyId, search }),
  });

export const useDeleteOperationMutation = (
  setApiError?: (msg: string) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteOperation,
    onSuccess: () => {
      toast.success("Operation deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["operations"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to add operation";
      if (message.length > 150) {
        message = "Failed. This operation might be using in any article";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};

export const useAddOperationMutation = (
  setApiError?: (msg: string) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addOperation,
    onSuccess: () => {
      toast.success("Operation added successfully!");
      queryClient.invalidateQueries({ queryKey: ["operations"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to add operation";
      if (message.length > 150) {
        message = "Failed to add operation";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};

export const useEditOperationMutation = (
  setApiError?: (msg: string) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, operationData }: { id: number; operationData: any }) =>
      editOperation(id, operationData),
    onSuccess: () => {
      toast.success("Operation updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["operations"] });
    },
    onError: (error: any) => {
      let message =
        error.response?.data?.message || "Failed to update operation";
      if (message.length > 150) {
        message = "Failed to update operation";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};
