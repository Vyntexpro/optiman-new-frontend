import { api } from "./index";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchOrders = async ({
  pageNo,
  pageSize,
  companyId,
  status,
  customerId,
  search,
}: {
  pageNo: number;
  pageSize: number;
  companyId: number;
  customerId?: number;
  status?: number;
  search?: string;
}) => {
  const { data } = await api.get(
    `/makeOrder/allOrder/${companyId}?pageNo=${pageNo}&pageSize=${pageSize}${
      status !== undefined ? `&status=${status}` : ""
    }${customerId !== undefined ? `&customerId=${customerId}` : ""}${
      search ? `&search=${encodeURIComponent(search)}` : ""
    }`
  );
  return data;
};
const fetchActiveOrders = async ({ companyId }: { companyId: number }) => {
  const { data } = await api.get(`/makeOrder/active-order/${companyId}`);
  return data;
};
const fetchOrderArticles = async ({ orderId }: { orderId: number }) => {
  const { data } = await api.get(`/makeOrderArticle/order-article/${orderId}`);
  return data;
};

export const deleteOrder = async (id: number) => {
  return api.delete(`/makeOrder/delete/${id}`);
};

export const addOrder = async (orderData: any) => {
  return api.post("/makeOrder/add", orderData);
};

export const editOrder = async (id: number, orderData: any) => {
  return api.put(`/makeOrder/update/${id}`, orderData);
};
export const editOrderStatus = async (id: number, orderData: any) => {
  return api.put(`/makeOrder/updateJobDashBoardControl/${id}`, orderData);
};

export const useOrdersQuery = (
  pageNo: number,
  pageSize: number,
  companyId: number,
  status?: number,
  customerId?: number,
  search?: string
) =>
  useQuery({
    queryKey: [
      "orders",
      pageNo,
      pageSize,
      companyId,
      status,
      customerId,
      search,
    ],
    queryFn: () =>
      fetchOrders({ pageNo, pageSize, companyId, status, customerId, search }),
  });

export const useActiveOrdersQuery = (companyId: number) =>
  useQuery({
    queryKey: ["activeorders", companyId],
    queryFn: () => fetchActiveOrders({ companyId }),
  });

export const useOrderArticlesQuery = (orderId: number) =>
  useQuery({
    queryKey: ["orderarticles", orderId],
    queryFn: () => fetchOrderArticles({ orderId }),
  });

export const useDeleteOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      toast.success("Order deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => toast.error("Failed to delete order"),
  });
};

export const useAddOrderMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addOrder,
    onSuccess: () => {
      toast.success("Order added successfully!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to add order";
      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};

export const useEditOrderMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, orderData }: { id: number; orderData: any }) =>
      editOrder(id, orderData),
    onSuccess: () => {
      toast.success("Order updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to update order";
      if (message.length > 150) {
        message = "Failed to update order";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};

export const useEditOrderStatusMutation = (
  setApiError?: (msg: string) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, orderData }: { id: number; orderData: any }) =>
      editOrderStatus(id, orderData),
    onSuccess: () => {
      toast.success("Status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
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
