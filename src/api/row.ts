import { api } from "./index";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchRows = async ({
  pageNo,
  pageSize,
  companyId,
  branchId,
  buildingId,
  floorId,
  hallId,
  search,
}: {
  pageNo: number;
  pageSize: number;
  companyId: number;
  branchId?: number;
  buildingId?: number;
  floorId?: number;
  hallId?: number;
  search?: string;
}) => {
  const { data } = await api.get(
    `/row/allRows/${companyId}?pageNo=${pageNo}&pageSize=${pageSize}${
      branchId !== undefined ? `&branchId=${branchId}` : ""
    }${buildingId !== undefined ? `&buildingId=${buildingId}` : ""}${
      floorId !== undefined ? `&floorId=${floorId}` : ""
    }${hallId !== undefined ? `&hallId=${hallId}` : ""}${
      search ? `&search=${encodeURIComponent(search)}` : ""
    }`
  );
  return data;
};

export const deleteRow = async (id: number) => {
  return api.delete(`/row/delete/${id}`);
};

export const addRow = async (rowData: any) => {
  return api.post("/row/add", rowData);
};

export const editRow = async (id: number, rowData: any) => {
  return api.put(`/row/update/${id}`, rowData);
};

export const useRowsQuery = (
  pageNo: number,
  pageSize: number,
  companyId: number,
  branchId?: number,
  buildingId?: number,
  floorId?: number,
  hallId?: number,
  search?: string
) =>
  useQuery({
    queryKey: [
      "rows",
      pageNo,
      pageSize,
      branchId,
      companyId,
      buildingId,
      floorId,
      hallId,
      search,
    ],
    queryFn: () =>
      fetchRows({
        pageNo,
        pageSize,
        branchId,
        companyId,
        buildingId,
        floorId,
        hallId,
        search,
      }),
  });

export const useDeleteRowMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRow,
    onSuccess: () => {
      toast.success("Row deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["rows"] });
    },
    onError: () => toast.error("Failed to delete row"),
  });
};

export const useAddRowMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addRow,
    onSuccess: () => {
      toast.success("Row added successfully!");
      queryClient.invalidateQueries({ queryKey: ["rows"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to add row";
      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};

export const useEditRowMutation = (setApiError?: (msg: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rowData }: { id: number; rowData: any }) =>
      editRow(id, rowData),
    onSuccess: () => {
      toast.success("Row updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["rows"] });
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || "Failed to update row";
      if (message.length > 150) {
        message = "Failed to update row";
      }

      if (setApiError) setApiError(message);
      toast.error(message);
    },
  });
};
