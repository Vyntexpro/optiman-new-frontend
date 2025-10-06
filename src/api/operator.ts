import { api } from "./index";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchOperators = async ({
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
    `/operator-card/pageable/${companyId}?pageNo=${pageNo}&pageSize=${pageSize}${
      search ? `&search=${encodeURIComponent(search)}` : ""
    }`
  );
  return data;
};

export const deleteOperator = async (id: number) => {
  return api.delete(`/operator-card/${id}`);
};

export const addOperator = async (operatorData: any) => {
  return api.post("/operator-card", operatorData);
};

export const editOperator = async (id: number, operatorData: any) => {
  return api.put(`/operator-card/${id}`, operatorData);
};
export const editOperatorStatus = async (id: number, operatorData: any) => {
  return api.patch(`/operator-card/${id}`, operatorData);
};

export const useOperatorsQuery = (
  pageNo: number,
  pageSize: number,
  companyId: number,
  search?: string
) =>
  useQuery({
    queryKey: ["operators", pageNo, pageSize, companyId, search],
    queryFn: () => fetchOperators({ pageNo, pageSize, companyId, search }),
  });

export const useDeleteOperatorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteOperator,
    onSuccess: () => {
      toast.success("Operator deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["operators"] });
    },
    onError: () => toast.error("Failed to delete operator"),
  });
};

export const useAddOperatorMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addOperator,
    onSuccess: () => {
      toast.success("Operator added successfully!");
      queryClient.invalidateQueries({ queryKey: ["operators"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to add operator";
      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};

export const useEditOperatorMutation = (
  setApiError?: (msg: string) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, operatorData }: { id: number; operatorData: any }) =>
      editOperator(id, operatorData),
    onSuccess: () => {
      toast.success("Operator updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["operators"] });
    },
    onError: (error: any) => {
      let message =
        error.response?.data?.message || "Failed to update operator";
      if (message.length > 150) {
        message = "Failed to update operator";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};

export const useEditOperatorStatusMutation = (
  setApiError?: (msg: string) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, operatorData }: { id: number; operatorData: any }) =>
      editOperatorStatus(id, operatorData),
    onSuccess: () => {
      toast.success("Status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["operators"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to update status";
      if (message.length > 150) {
        message = "Failed to update status";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};
