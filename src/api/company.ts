import { api } from "./index";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const fetchCompanies = async () => {
  const { data } = await api.get("/company/allCompanies");
  return data;
};

export const deleteCompany = async (id: number) => {
  return api.delete(`/company/delete/${id}`);
};

export const addCompany = async (companyData: any) => {
  return api.post("/company/add", companyData);
};

export const editCompany = async (id: number, companyData: any) => {
  return api.put(`/company/update/${id}`, companyData);
};

export const useCompaniesQuery = () =>
  useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
  });

export const useDeleteCompanyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      toast.success("Company deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
    onError: () => toast.error("Failed to delete company"),
  });
};

export const useAddCompanyMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addCompany,
    onSuccess: () => {
      toast.success("Company added successfully!");
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to add company";
      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};

export const useEditCompanyMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, companyData }: { id: number; companyData: any }) =>
      editCompany(id, companyData),
    onSuccess: () => {
      toast.success("Company updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to update company";
      if (message.length > 150) {
        message = "Failed to update company";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};
