import { api } from "./index";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchArticles = async ({
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
    `/article/allArticle/${companyId}?pageNo=${pageNo}&pageSize=${pageSize}
    ${search ? `&search=${encodeURIComponent(search)}` : ""}`
  );
  return data;
};

export const deleteArticle = async (id: number) => {
  return api.delete(`/article/${id}`);
};

export const addArticle = async (articleData: any) => {
  return api.post("/article", articleData);
};

export const editArticle = async (id: number, articleData: any) => {
  return api.put(`/article/${id}`, articleData);
};

export const useArticlesQuery = (
  pageNo: number,
  pageSize: number,
  companyId: number,
  search?: string
) =>
  useQuery({
    queryKey: ["articles", pageNo, pageSize, companyId, search],
    queryFn: () => fetchArticles({ pageNo, pageSize, companyId, search }),
  });

export const useDeleteArticleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      toast.success("Article deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: () => toast.error("Failed to delete article"),
  });
};

export const useAddArticleMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addArticle,
    onSuccess: () => {
      toast.success("Article added successfully!");
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to add article";
      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};

export const useEditArticleMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, articleData }: { id: number; articleData: any }) =>
      editArticle(id, articleData),
    onSuccess: () => {
      toast.success("Article updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to update article";
      if (message.length > 150) {
        message = "Failed to update article";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};
