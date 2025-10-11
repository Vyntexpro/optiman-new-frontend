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
  useEditBundleMutation,
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
import AddBundleDialog from "@/app-components/forms/Bundle";
import FilterSkeleton from "@/app-components/common/FilterSkeleton";
import { useOrderArticlesQuery, useOrdersQuery } from "@/api/order";
import { useVariationsQuery } from "@/api/orderVariation";
const Bundles = () => {
  const [open, setOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [editData, setEditData] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [rowId, setRowId] = useState<any | null>(undefined);
  const [orderId, setOrderId] = useState<any | null>(undefined);
  const [errorId, setErrorId] = useState<number | null>(null);
  const [variationId, setVariationId] = useState<any | null>(undefined);
  const [article, setArticle] = useState<any | null>(undefined);
  const [pageNo, setPageNo] = useState(0);
  const [search, setSearch] = useState("");
  const [card, setCard] = useState("");
  const [size, setSize] = useState("");
  const [openOps, setOpenOps] = useState(false);
  const [selectedOps, setSelectedOps] = useState<any[]>([]);
  const debouncedSearch = useDebounce(search, 500);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const [update2Id, setUpdate2Id] = useState<number | null>(null);
  const { companyId } = useContext(AuthContext);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const pageSize = 10;
  const { data: orders, isPending } = useOrdersQuery(0, 1000000, companyId);
  const selectedOrder = orders?.content?.find(
    (order) => Number(order.id) === Number(orderId)
  );
  const rows = selectedOrder?.rows || [];
  const { data: allArticles, isLoading: articlesLoading } =
    useOrderArticlesQuery(orderId || 0);

  const { data: variations, isLoading: variationsLoading } = useVariationsQuery(
    orderId || 0,
    article || 0,
    debouncedSearch
  );

  const {
    data: bundles,
    isLoading,
    refetch,
  } = useBundlesQuery(
    pageNo,
    pageSize,
    companyId,
    orderId,
    article,
    variationId,
    rowId,
    debouncedSearch
  );
  const editBundleStatusMutation = useEditBundleStatusMutation();
  const deleteMutation = useDeleteBundleMutation();
  const editBundleMutation = useEditBundleMutation(setApiError);
  return (
    <div className="page-container">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-[23px] font-bold ">Manage Bundles</h2>
          </div>

          <div className="flex flex-row items-center gap-[6px]">
            {isPending ? (
              <FilterSkeleton small />
            ) : (
              <Select
                onValueChange={(value) => {
                  setOrderId(value === "all" ? undefined : value);
                  setPageNo(0);
                }}
              >
                <SelectTrigger className="w-[120px] h-[40px] input-style bg-white">
                  <SelectValue placeholder="Filter by Order" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-300">
                  <SelectItem value="all" className="select-style py-2">
                    All Orders
                  </SelectItem>
                  {orders.content.map((order: any) => (
                    <SelectItem
                      key={order.id}
                      value={String(order.id)}
                      className="select-style py-1"
                    >
                      {order.orderNo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {articlesLoading ? (
              <FilterSkeleton small />
            ) : (
              <Select
                onValueChange={(value) => {
                  setArticle(value === "all" ? undefined : value);
                  setPageNo(0);
                }}
              >
                <SelectTrigger className="w-[120px] h-[40px] input-style bg-white">
                  <SelectValue placeholder="Filter by Article" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-300">
                  <SelectItem value="all" className="select-style py-2">
                    All Articles
                  </SelectItem>
                  {allArticles?.map((article: any) => (
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
            {variationsLoading ? (
              <FilterSkeleton medium />
            ) : (
              <Select
                onValueChange={(value) => {
                  setVariationId(value === "all" ? undefined : value);
                  setPageNo(0);
                }}
              >
                <SelectTrigger className="w-[130px] h-[40px] input-style bg-white">
                  <SelectValue placeholder="Filter by Variation" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-300">
                  <SelectItem value="all" className="select-style py-2">
                    All Variations
                  </SelectItem>
                  {variations?.map((v: any) => (
                    <SelectItem
                      key={v.orderDetailId}
                      value={String(v.orderDetailId)}
                      className="select-style py-1"
                    >
                      {v.size},{v.color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select
              onValueChange={(value) => {
                setRowId(value === "all" ? undefined : value);
                setPageNo(0);
              }}
            >
              <SelectTrigger className="w-[110px] h-[40px] input-style bg-white">
                <SelectValue placeholder="Filter by Row" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-300">
                <SelectItem value="all" className="select-style py-2">
                  All Rows
                </SelectItem>
                {rows?.map((row: any) => (
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

                  <TableHead className="text-[11px] font-bold">
                    Card UID
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
                    <TableCell className="py-3 flex items-center w-[60px] gap-2">
                      <div className="mt-[6px]">
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
                          <div className="mt-[4px]">
                            <Spinner
                              size="w-[12px] h-[12px]"
                              color="border-primary"
                              borderSize="border-2"
                            />
                          </div>
                        )}
                    </TableCell>

                    <TableCell className="py-3 w-[300px] text-[11px]">
                      <div
                        className="flex items-center gap-[12px]
                      "
                      >
                        <Input
                          type="text"
                          placeholder="Scan or enter card uid"
                          className="input-style !h-[29px] w-[150px] pl-2 placeholder:text-[10px]"
                          value={bundle?.card}
                          onChange={(e) => {
                            const value = e.target.value;
                            setCard(value);
                            setUpdateId(bundle.id);
                            setApiError(null);
                            setErrorId(null);
                            if (typingTimeout) clearTimeout(typingTimeout);
                            const timeout = setTimeout(() => {
                              editBundleMutation.mutate(
                                {
                                  id: bundle.id,
                                  bundleData: {
                                    bundle: bundle.bundleSize,
                                    makeOrderArticle: {
                                      id: String(bundle.articleId),
                                    },
                                    makeOrderArticleDetail: {
                                      id: bundle.articleDetailId,
                                    },
                                    row: { id: bundle.rowId },
                                    cardTag: value,
                                  },
                                },
                                {
                                  onSuccess: () => {
                                    setUpdateId(null);
                                    setErrorId(null);
                                    setApiError(null);
                                  },
                                  onError: (error: any) => {
                                    setUpdateId(null);
                                    setErrorId(bundle.id);
                                    const message =
                                      error?.response?.data?.message ||
                                      error?.message ||
                                      "Something went wrong while updating the card";
                                    setApiError(message);
                                  },
                                }
                              );
                            }, 500);

                            setTypingTimeout(timeout);
                          }}
                        />

                        {editBundleMutation.isPending &&
                          updateId === bundle.id && (
                            <div className="mt-[4px]">
                              <Spinner
                                size="w-[14px] h-[14px]"
                                color="border-primary"
                                borderSize="border-2"
                              />
                            </div>
                          )}
                      </div>
                      {errorId === bundle.id && apiError && (
                        <p className="text-[9px] text-red ">{apiError}</p>
                      )}
                    </TableCell>
                    <TableCell className="py-3 w-[200px] text-[11px]">
                      <div className="flex items-center gap-[12px]">
                        <Input
                          type="number"
                          placeholder=""
                          className="input-style !h-[29px] w-[100px] pl-2 placeholder:text-[10px]"
                          value={
                            update2Id === bundle.id ? size : bundle?.bundleSize
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            setSize(value);
                            setUpdate2Id(bundle.id);
                            if (typingTimeout) clearTimeout(typingTimeout);
                            const timeout = setTimeout(() => {
                              editBundleMutation.mutate(
                                {
                                  id: bundle.id,
                                  bundleData: {
                                    bundle: value,
                                    makeOrderArticle: {
                                      id: String(bundle.articleId),
                                    },
                                    makeOrderArticleDetail: {
                                      id: bundle.articleDetailId,
                                    },
                                    row: { id: bundle.rowId },
                                    cardTag: bundle.card,
                                  },
                                },
                                {
                                  onSuccess: () => setUpdate2Id(null),
                                  onError: () => setUpdate2Id(null),
                                }
                              );
                            }, 1000);

                            setTypingTimeout(timeout);
                          }}
                        />

                        {editBundleMutation.isPending &&
                          update2Id === bundle.id && (
                            <div className="mt-[4px]">
                              <Spinner
                                size="w-[14px] h-[14px]"
                                color="border-primary"
                                borderSize="border-2"
                              />
                            </div>
                          )}
                      </div>
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
                              className="bg-softgreen/20 text-darkgreen border-darkgreen font-semibold text-[9px] h-[26px]"
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
                              className="border-primary bg-slate-200/50 font-semibold text-primary text-[9px] h-[26px]"
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
