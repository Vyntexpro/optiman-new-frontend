import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useBundlesQuery,
  useDeleteBundleMutation,
  useEditBundleStatusMutation,
} from "@/api/bundle";
import { Plus, Search } from "lucide-react";
import NoDataAvailable from "@/app-components/common/NoData";
import { useContext, useState } from "react";
import { DeleteConfirmationDialog } from "@/app-components/common/DeleteConfirmAlert";
import TableSkeleton from "@/app-components/common/TableSkeleton";
import CustomPagination from "@/app-components/common/Pagination";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/context/AuthContext";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import Spinner from "@/app-components/common/Spinner";
import useDebounce from "@/lib/helperFunctions";
import BundleOperationsDialog from "@/app-components/popups/BundleOperations";
import { AiOutlinePlus } from "react-icons/ai";
import AddBundleDialog from "@/app-components/forms/Bundle";
import { useArticlesQuery } from "@/api/article";
import { useRowsQuery } from "@/api/row";
import FilterSkeleton from "@/app-components/common/FilterSkeleton";
import { useOrderesQuery } from "@/api/order";
const Bundles = () => {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [rowId, setRowId] = useState<any | null>(undefined);
  const [article, setArticle] = useState<any | null>(undefined);
  const [pageNo, setPageNo] = useState(0);
  const [search, setSearch] = useState("");
  const [openOps, setOpenOps] = useState(false);
  const [selectedOps, setSelectedOps] = useState<any[]>([]);
  const debouncedSearch = useDebounce(search, 500);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const { companyId } = useContext(AuthContext);
  const pageSize = 10;
  const { data: orders, isPending } = useOrderesQuery(0, 1000000, companyId);
  const allArticles =
    orders?.content?.flatMap((order) => order.makeOrderArticle) || [];
  const { data: rows, isFetching } = useRowsQuery(0, 1000000, companyId);
  const {
    data: bundles,
    isLoading,
    refetch,
  } = useBundlesQuery(
    pageNo,
    pageSize,
    companyId,
    article,
    rowId,
    debouncedSearch
  );
  const editBundleStatusMutation = useEditBundleStatusMutation();
  const deleteMutation = useDeleteBundleMutation();
  return (
    <div className="page-container">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-[23px] font-bold ">Manage Bundles</h2>
          </div>

          <div className="flex flex-row items-center gap-[8px]">
            {isPending ? (
              <FilterSkeleton medium />
            ) : (
              <Select
                onValueChange={(value) => {
                  setArticle(value === "all" ? undefined : value);
                  setPageNo(0);
                }}
              >
                <SelectTrigger className="w-[130px] h-[40px] input-style bg-white">
                  <SelectValue placeholder="Filter by Article" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-300">
                  <SelectItem value="all" className="select-style py-2">
                    All Articles
                  </SelectItem>
                  {allArticles.map((article: any) => (
                    <SelectItem
                      key={article.id}
                      value={String(article.id)}
                      className="select-style py-1"
                    >
                      {article.articleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {isFetching ? (
              <FilterSkeleton medium />
            ) : (
              <Select
                onValueChange={(value) => {
                  setRowId(value === "all" ? undefined : value);
                  setPageNo(0);
                }}
              >
                <SelectTrigger className="w-[130px] h-[40px] input-style bg-white">
                  <SelectValue placeholder="Filter by Row" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-300">
                  <SelectItem value="all" className="select-style py-2">
                    All Rows
                  </SelectItem>
                  {rows?.content?.map((row: any) => (
                    <SelectItem
                      key={row.id}
                      value={String(row.id)}
                      className="select-style py-1"
                    >
                      {row.rowName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="relative w-[250px]">
              <Search className="absolute left-3 top-3.5 text-primary w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by order No or card UID..."
                className="input-style h-[40px] pl-9 bg-white"
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
              Add New Bundle
            </Button>
          </div>
        </div>
        <div className="rounded-lg bg-white border border-slate-200 shadow-2xl shadow-primary/10 backdrop-blur-lg px-4 py-2 mt-[12px]">
          {isLoading ? (
            <TableSkeleton />
          ) : bundles && bundles.content && bundles.content.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 bg-lightgray">
                  <TableHead className="text-[11px] font-bold py-2">
                    Sr#
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">Date</TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Active
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">Row</TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Order No
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Card UID
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Article
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Order Variation
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Bundle Size
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Operations Status
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">Edit</TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Delete
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bundles.content.map((bundle: any, index: number) => (
                  <TableRow
                    key={bundle.id}
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
                      {bundle.createdAt
                        ? format(new Date(bundle.createdAt), "dd/MM/yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell className="py-3 flex items-center gap-2">
                      <div className="mt-[4px]">
                        <Switch
                          small
                          checked={bundle.status === 1}
                          onCheckedChange={(checked) => {
                            setUpdatingId(bundle.id);
                            editBundleStatusMutation.mutate(
                              {
                                id: bundle.id,
                                bundleData: {
                                  status: checked ? 1 : 0,
                                },
                              },
                              {
                                onSuccess: () => {
                                  refetch();
                                  setUpdatingId(null);
                                },
                                onError: () => {
                                  setUpdatingId(null);
                                },
                              }
                            );
                          }}
                        />
                      </div>
                      {editBundleStatusMutation.isPending &&
                        updatingId === bundle.id && (
                          <Spinner
                            size="w-[12px] h-[12px]"
                            color="border-primary"
                            borderSize="border-2"
                          />
                        )}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {bundle.rowName}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {bundle.orderNo}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {bundle.card ? (
                        bundle.card
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-primary text-primary font-semibold bg-slate-200/50 text-[9px] h-[24px] w-[70px]"
                          onClick={() => {
                            setEditData(bundle);
                            setOpen(true);
                          }}
                        >
                          <AiOutlinePlus className="!w-2.5 !h-2.5 -mr-1" />
                          Add card
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {bundle.articleName}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {bundle.size},{bundle.color}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {bundle.bundleSize}
                    </TableCell>

                    <TableCell className="py-3 text-[11px]">
                      {(() => {
                        const totalOps = bundle.operations?.length || 0;
                        const completedOps =
                          bundle.operations?.filter(
                            (op: any) => op.isCompleted === 1
                          ).length || 0;

                        if (totalOps > 0 && completedOps === totalOps) {
                          return (
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-softgreen/20 text-darkgreen border-darkgreen font-semibold text-[9.5px] h-[26px]"
                              onClick={() => {
                                setSelectedOps(bundle.operations || []);
                                setOpenOps(true);
                              }}
                            >
                              Completed
                            </Button>
                          );
                        } else {
                          return (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-primary bg-slate-200/50 font-semibold text-primary text-[9.5px] h-[26px]"
                              onClick={() => {
                                setSelectedOps(bundle.operations || []);
                                setOpenOps(true);
                              }}
                            >
                              In Queue {completedOps}/{totalOps}
                            </Button>
                          );
                        }
                      })()}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary text-primary text-[9px] h-[26px]"
                        onClick={() => {
                          setEditData(bundle);
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
                        className="bg-lightred text-red font-semibold text-[9px] h-[26px]"
                        onClick={() => setDeleteId(bundle.id)}
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

        <AddBundleDialog
          open={open}
          onClose={() => setOpen(false)}
          isEdit={!!editData}
          bundleData={editData}
          refetch={refetch}
        />

        <BundleOperationsDialog
          open={openOps}
          onClose={() => setOpenOps(false)}
          ops={selectedOps}
        />
      </div>

      {bundles && bundles.content && bundles.content.length > 0 && (
        <div className="pt-[30px] flex flex-row justify-center">
          <CustomPagination
            pageNo={pageNo}
            setPageNo={setPageNo}
            totalElements={bundles?.totalElements ?? 0}
            pageSize={pageSize}
          />
        </div>
      )}
    </div>
  );
};

export default Bundles;
