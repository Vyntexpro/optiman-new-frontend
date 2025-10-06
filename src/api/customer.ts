import { api } from "./index";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchCustomers = async ({
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
    `/customer-lib/allCustomerLibByCompanyId/${companyId}?pageNo=${pageNo}&pageSize=${pageSize}${
      search ? `&search=${encodeURIComponent(search)}` : ""
    }`
  );
  return data;
};

export const deleteCustomer = async (id: number) => {
  return api.delete(`/customer-lib/${id}`);
};

export const addCustomer = async (customerData: any) => {
  return api.post("/customer-lib", customerData);
};

export const editCustomer = async (id: number, customerData: any) => {
  return api.put(`/customer-lib/${id}`, customerData);
};

export const useCustomersQuery = (
  pageNo: number,
  pageSize: number,
  companyId: number,
  search?: string
) =>
  useQuery({
    queryKey: ["customers", pageNo, pageSize, companyId, search],
    queryFn: () => fetchCustomers({ pageNo, pageSize, companyId, search }),
  });

export const useDeleteCustomerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      toast.success("Customer deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: () => toast.error("Failed to delete customer"),
  });
};

export const useAddCustomerMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addCustomer,
    onSuccess: () => {
      toast.success("Customer added successfully!");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to add customer";
      if (message.length > 150) {
        message = "Email already in use";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};

export const useEditCustomerMutation = (
  setApiError?: (msg: string) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, customerData }: { id: number; customerData: any }) =>
      editCustomer(id, customerData),
    onSuccess: () => {
      toast.success("Customer updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error: any) => {
      let message =
        error.response?.data?.message || "Failed to update customer";
      if (message.length > 150) {
        message = "Failed. Make sure name,email or contact not already in use";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};
