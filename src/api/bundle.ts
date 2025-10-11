import { api } from "./index";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchBundles = async ({
  pageNo,
  pageSize,
  companyId,
  orderId,
  article,
  variationId,
  rowId,
  search,
}: {
  pageNo: number;
  pageSize: number;
  companyId: number;
  orderId?: number;
  article?: number;
  variationId?: number;
  rowId?: number;
  search?: string;
}) => {
  const { data } = await api.get(
    `/unit-card/pageable/${companyId}?pageNo=${pageNo}&pageSize=${pageSize}${
      orderId !== undefined ? `&orderId=${orderId}` : ""
    }${article !== undefined ? `&article=${article}` : ""}${
      variationId !== undefined ? `&variationId=${variationId}` : ""
    }${rowId !== undefined ? `&rowId=${rowId}` : ""}${
      search ? `&search=${encodeURIComponent(search)}` : ""
    }`
  );
  return data;
};

export const deleteBundle = async (id: number) => {
  return api.delete(`/unit-card/${id}`);
};

export const addBundle = async (bundleData: any) => {
  return api.post("/unit-card", bundleData);
};

export const editBundle = async (id: number, bundleData: any) => {
  return api.put(`/unit-card/${id}`, bundleData);
};
export const editBundleStatus = async (id: number, bundleData: any) => {
  return api.patch(`/unit-card/${id}`, bundleData);
};

export const useBundlesQuery = (
  pageNo: number,
  pageSize: number,
  companyId: number,
  orderId?: number,
  article?: number,
  variationId?: number,
  rowId?: number,
  search?: string
) =>
  useQuery({
    queryKey: [
      "bundles",
      pageNo,
      pageSize,
      companyId,
      orderId,
      article,
      variationId,
      rowId,
      search,
    ],
    queryFn: () =>
      fetchBundles({
        pageNo,
        pageSize,
        companyId,
        orderId,
        article,
        variationId,
        rowId,
        search,
      }),
  });

export const useDeleteBundleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBundle,
    onSuccess: () => {
      toast.success("Bundle deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["bundles"] });
    },
    onError: () => toast.error("Failed to delete bundle"),
  });
};

export const useAddBundleMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addBundle,
    onSuccess: () => {
      toast.success("Bundle added successfully!");
      queryClient.invalidateQueries({ queryKey: ["bundles"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to add bundle";
      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};

export const useEditBundleMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, bundleData }: { id: number; bundleData: any }) =>
      editBundle(id, bundleData),
    onSuccess: () => {
      toast.success("Bundle updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["bundles"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to update bundle";
      if (message.length > 150) {
        message = "Failed to update bundle";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};

export const useEditBundleStatusMutation = (
  setApiError?: (msg: string) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, bundleData }: { id: number; bundleData: any }) =>
      editBundleStatus(id, bundleData),
    onSuccess: () => {
      toast.success("Status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["bundles"] });
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
