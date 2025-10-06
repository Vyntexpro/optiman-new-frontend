import { api } from "./index";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchBranches = async ({
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
    `/branch/pageable/${companyId}?pageNo=${pageNo}&pageSize=${pageSize}${
      search ? `&search=${encodeURIComponent(search)}` : ""
    }`
  );
  return data;
};

export const deleteBranch = async (id: number) => {
  return api.delete(`/branch/${id}`);
};

export const addBranch = async (branchData: any) => {
  return api.post("/branch", branchData);
};

export const editBranch = async (id: number, branchData: any) => {
  return api.put(`/branch/${id}`, branchData);
};

export const useBranchesQuery = (
  pageNo: number,
  pageSize: number,
  companyId: number,
  search?: string
) =>
  useQuery({
    queryKey: ["branches", pageNo, pageSize, companyId, search],
    queryFn: () => fetchBranches({ pageNo, pageSize, companyId, search }),
  });

export const useDeleteBranchMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => {
      toast.success("Branch deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: () => toast.error("Failed to delete branch"),
  });
};

export const useAddBranchMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addBranch,
    onSuccess: () => {
      toast.success("Branch added successfully!");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to add branch";
      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};

export const useEditBranchMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, branchData }: { id: number; branchData: any }) =>
      editBranch(id, branchData),
    onSuccess: () => {
      toast.success("Branch updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to update branch";
      if (message.length > 150) {
        message = "Failed to update branch";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};
