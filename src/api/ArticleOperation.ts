import { api } from "./index";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchOrderArticleOprations = async ({
  articleId,
}: {
  articleId: number;
  search?: string;
}) => {
  const { data } = await api.get(`/makeOrderArticleOperation/${articleId}`);
  return data;
};

const fetchMachinesOprations = async ({
  orderId,
}: {
  orderId: number;
  search?: string;
}) => {
  const { data } = await api.get(`/machine/summary/${orderId}`);
  return data;
};

export const assignMachines = async (id: number, machineData: any) => {
  return api.put(`/makeOrderArticleOperation/update/${id}`, machineData);
};

export const useOrderArticlesOperationsQuery = (articleId: number) =>
  useQuery({
    queryKey: ["articleOperations", articleId],
    queryFn: () => fetchOrderArticleOprations({ articleId }),
  });

export const useaMachineOperationsQuery = (orderId: number) =>
  useQuery({
    queryKey: ["operationMachines", orderId],
    queryFn: () => fetchMachinesOprations({ orderId }),
  });

export const useAssignMachinesMutation = (
  setApiError?: (msg: string) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, machineData }: { id: number; machineData: any }) =>
      assignMachines(id, machineData),
    onSuccess: () => {
      toast.success("Machines assigned successfully!");
      queryClient.invalidateQueries({ queryKey: ["operationMachines"] });
    },
    onError: (error: any) => {
      let message =
        error.response?.data?.message || "Failed to assign machines";
      if (message.length > 150) {
        message = "Failed to assign machines";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};
