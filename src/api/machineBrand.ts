import { api } from "./index";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchBrands = async ({
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
    `/machine-brand-lib/pageable/${companyId}?pageNo=${pageNo}&pageSize=${pageSize}${
      search ? `&search=${encodeURIComponent(search)}` : ""
    }`
  );
  return data;
};

export const deleteBrand = async (id: number) => {
  return api.delete(`/machine-brand-lib/${id}`);
};

export const addBrand = async (brandData: any) => {
  return api.post("/machine-brand-lib", brandData);
};

export const editBrand = async (id: number, brandData: any) => {
  return api.put(`/machine-brand-lib/${id}`, brandData);
};

export const useBrandsQuery = (
  pageNo: number,
  pageSize: number,
  companyId: number,
  search?: string
) =>
  useQuery({
    queryKey: ["brands", pageNo, pageSize, companyId, search],
    queryFn: () => fetchBrands({ pageNo, pageSize, companyId, search }),
  });

export const useDeleteBrandMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      toast.success("Brand deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
    onError: () => toast.error("Failed to delete brand"),
  });
};

export const useAddBrandMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addBrand,
    onSuccess: () => {
      toast.success("Brand added successfully!");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to add brand";
      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};

export const useEditBrandMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, brandData }: { id: number; brandData: any }) =>
      editBrand(id, brandData),
    onSuccess: () => {
      toast.success("Brand updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to update brand";
      if (message.length > 150) {
        message = "Failed to update brand";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};
