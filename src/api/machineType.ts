import { api } from "./index";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchTypes = async ({
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
    `/machine-type-lib/pageable/${companyId}?pageNo=${pageNo}&pageSize=${pageSize}${
      search ? `&search=${encodeURIComponent(search)}` : ""
    }`
  );
  return data;
};

export const deleteType = async (id: number) => {
  return api.delete(`/machine-type-lib/${id}`);
};

export const addType = async (typeData: any) => {
  return api.post("/machine-type-lib", typeData);
};

export const editType = async (id: number, typeData: any) => {
  return api.put(`/machine-type-lib/${id}`, typeData);
};

export const useTypesQuery = (
  pageNo: number,
  pageSize: number,
  companyId: number,
  search?: string
) =>
  useQuery({
    queryKey: ["types", pageNo, pageSize, companyId, search],
    queryFn: () => fetchTypes({ pageNo, pageSize, companyId, search }),
  });

export const useDeleteTypeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteType,
    onSuccess: () => {
      toast.success("Type deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["types"] });
    },
    onError: () => toast.error("Failed to delete type"),
  });
};

export const useAddTypeMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addType,
    onSuccess: () => {
      toast.success("Type added successfully!");
      queryClient.invalidateQueries({ queryKey: ["types"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to add type";
      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};

export const useEditTypeMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, typeData }: { id: number; typeData: any }) =>
      editType(id, typeData),
    onSuccess: () => {
      toast.success("Type updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["types"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to update type";
      if (message.length > 150) {
        message = "Failed to update type";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};
