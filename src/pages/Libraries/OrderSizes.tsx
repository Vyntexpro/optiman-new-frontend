import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSizesQuery, useDeleteSizeMutation } from "@/api/orderSize";
import { Plus, Search } from "lucide-react";
import NoDataAvailable from "@/app-components/common/NoData";
import { useContext, useState } from "react";
import { DeleteConfirmationDialog } from "@/app-components/common/DeleteConfirmAlert";
import TableSkeleton from "@/app-components/common/TableSkeleton";
import CustomPagination from "@/app-components/common/Pagination";
import { Input } from "@/components/ui/input";
import useDebounce from "@/lib/helperFunctions";
import { AuthContext } from "@/context/AuthContext";
import AddOrderSizeDialog from "@/app-components/forms/OrderSize";
import { format } from "date-fns";

const OrderSize = () => {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [pageNo, setPageNo] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const { companyId } = useContext(AuthContext);
  const pageSize = 10;
  const {
    data: sizes,
    isLoading,
    refetch,
  } = useSizesQuery(pageNo, pageSize, companyId, debouncedSearch);
  const deleteMutation = useDeleteSizeMutation();
  return (
    <div className="pb-10">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-[22px] font-bold ">Order Size Libraries</h2>
          </div>

          <div className="flex flex-row items-center gap-[8px]">
            <div className="relative w-[300px]">
              <Search className="absolute left-3 top-3.5 text-primary w-4 h-4" />
              <Input
                type="text"
                placeholder="Search sizes..."
                className="input-style pl-9 bg-white"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPageNo(0);
                }}
              />
            </div>
            <Button
              className="h-[40px] text-[11px] mt-[1px] font-semibold"
              onClick={() => {
                setEditData(null);
                setOpen(true);
              }}
            >
              <Plus />
              Add New Size
            </Button>
          </div>
        </div>
        <div className="rounded-lg bg-white border border-slate-200 shadow-2xl shadow-primary/10 backdrop-blur-lg px-4 py-2 mt-[10px]">
          {isLoading ? (
            <TableSkeleton />
          ) : sizes && sizes.content && sizes.content.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 bg-lightgray">
                  <TableHead className="text-[11px] font-bold py-2">
                    Sr#
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">Date</TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Order Size
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">Edit</TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Delete
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sizes.content.map((size: any, index: number) => (
                  <TableRow
                    key={size.id}
                    className={`
                      border-b border-slate-100 last:border-b-0
                      hover:bg-slate-50 transition-colors
                    `}
                  >
                    <TableCell className="py-3 text-[11px]">
                      {index + 1 + pageNo * pageSize}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {" "}
                      {size.createdAt
                        ? format(new Date(size.createdAt), "dd/MM/yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {size.orderSize}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary text-primary text-[9px] h-[26px]"
                        onClick={() => {
                          setEditData(size);
                          setOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-lightred font-semibold text-red text-[9px] h-[26px]"
                        onClick={() => setDeleteId(size.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <NoDataAvailable />
          )}

          <DeleteConfirmationDialog
            open={deleteId !== null}
            onClose={() => setDeleteId(null)}
            onConfirm={async () => {
              if (deleteId) {
                await deleteMutation.mutateAsync(deleteId);
                const { data } = await refetch();
                if (data && data.content.length === 0 && pageNo > 0) {
                  setPageNo((prev) => prev - 1);
                  await refetch();
                }
                setDeleteId(null);
              }
            }}
          />
        </div>

        <AddOrderSizeDialog
          open={open}
          onClose={() => setOpen(false)}
          isEdit={!!editData}
          sizeData={editData}
          refetch={refetch}
        />
      </div>

      {sizes && sizes.content && sizes.content.length > 0 && (
        <div className="pt-[30px] flex flex-row justify-center">
          <CustomPagination
            pageNo={pageNo}
            setPageNo={setPageNo}
            totalElements={sizes?.totalElements ?? 0}
            pageSize={pageSize}
          />
        </div>
      )}
    </div>
  );
};

export default OrderSize;
