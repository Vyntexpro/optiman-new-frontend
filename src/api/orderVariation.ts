import { api } from "./index";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchVariations = async ({
  orderId,
  search,
}: {
  orderId: number;
  search?: string;
}) => {
  const { data } = await api.get(
    `/makeOrderArticleDetail/suborder/${orderId}${
      search ? `&search=${encodeURIComponent(search)}` : ""
    }`
  );
  return data;
};
const fetchOrderArticles = async ({ orderId }: { orderId: number }) => {
  const { data } = await api.get(`/makeOrderArticle/order-article/${orderId}`);
  return data;
};

export const deleteVariation = async (id: number) => {
  return api.delete(`/makeOrderArticleDetail/delete/${id}`);
};
export const addVariation = async (variationData: any) => {
  return api.post("/makeOrderArticleDetail/add", variationData);
};

export const editVariation = async (id: number, variationData: any) => {
  return api.put(`/makeOrderArticleDetail/update/${id}`, variationData);
};

export const useVariationsQuery = (orderId: number, search?: string) =>
  useQuery({
    queryKey: ["variations", orderId, search],
    queryFn: () => fetchVariations({ orderId, search }),
  });
export const useOrderArticlesQuery = (orderId: number) =>
  useQuery({
    queryKey: ["orderArticles", orderId],
    queryFn: () => fetchOrderArticles({ orderId }),
  });

export const useDeleteVariationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVariation,
    onSuccess: () => {
      toast.success("Variation deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["variations"] });
    },
    onError: () => toast.error("Failed to delete variation"),
  });
};

export const useAddVariationMutation = (
  setApiError?: (msg: string) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addVariation,
    onSuccess: () => {
      toast.success("Variation added successfully!");
      queryClient.invalidateQueries({ queryKey: ["variations"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to add variation";
      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};

export const useEditVariationMutation = (
  setApiError?: (msg: string) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, variationData }: { id: number; variationData: any }) =>
      editVariation(id, variationData),
    onSuccess: () => {
      toast.success("Variation updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["variations"] });
    },
    onError: (error: any) => {
      let message =
        error.response?.data?.message || "Failed to update variation";
      if (message.length > 150) {
        message = "Failed to update variation";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};
