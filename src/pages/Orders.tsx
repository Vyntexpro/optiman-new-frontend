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
  useOrderesQuery,
  useDeleteOrderMutation,
  useEditOrderStatusMutation,
} from "@/api/order";
import { ClipboardList, Plus, Search } from "lucide-react";
import NoDataAvailable from "@/app-components/common/NoData";
import { useContext, useState } from "react";
import { DeleteConfirmationDialog } from "@/app-components/common/DeleteConfirmAlert";
import TableSkeleton from "@/app-components/common/TableSkeleton";
import CustomPagination from "@/app-components/common/Pagination";
import { Input } from "@/components/ui/input";
import useDebounce from "@/lib/helperFunctions";
import { AuthContext } from "@/context/AuthContext";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import Spinner from "@/app-components/common/Spinner";
import AddOrderDialog from "@/app-components/forms/Order";
import { useNavigate } from "react-router-dom";
import { useCustomersQuery } from "@/api/customer";
import FilterSkeleton from "@/app-components/common/FilterSkeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Orders = () => {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [customerId, setCustomerId] = useState<any | null>(undefined);
  const [status, setStatus] = useState<any | null>(undefined);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [pageNo, setPageNo] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const { companyId, userDetail } = useContext(AuthContext);
  const role = userDetail?.role?.name || "";
  const pageSize = 10;
  const { data: customers, isPending } = useCustomersQuery(
    0,
    1000000,
    companyId
  );
  const {
    data: orders,
    isLoading,
    refetch,
  } = useOrderesQuery(
    pageNo,
    pageSize,
    companyId,
    status,
    customerId,
    debouncedSearch
  );
  const deleteMutation = useDeleteOrderMutation();
  const editOrderStatusMutation = useEditOrderStatusMutation();
  const navigate = useNavigate();
  return (
    <div className="page-container">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-[23px] font-bold ">Manage Orders</h2>
          </div>

          <div className="flex flex-row items-center gap-[8px]">
            <Select
              onValueChange={(value) => {
                setStatus(value === "all" ? undefined : value);
                setPageNo(0);
              }}
            >
              <SelectTrigger className="w-[130px] h-[40px] input-style bg-white">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-300">
                <SelectItem value="all" className="select-style py-2">
                  All Statuses
                </SelectItem>
                <SelectItem value="0" className="select-style py-1">
                  In Queue
                </SelectItem>
                <SelectItem value="1" className="select-style py-1">
                  Completed
                </SelectItem>
              </SelectContent>
            </Select>
            {isPending ? (
              <FilterSkeleton />
            ) : (
              <Select
                onValueChange={(value) => {
                  setCustomerId(value === "all" ? undefined : value);
                  setPageNo(0);
                }}
              >
                <SelectTrigger className="w-[150px] h-[40px] input-style bg-white">
                  <SelectValue placeholder="Filter by Customer" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-300">
                  <SelectItem value="all" className="select-style py-2">
                    All Customers
                  </SelectItem>
                  {customers?.content?.map((customer: any) => (
                    <SelectItem
                      key={customer.id}
                      value={String(customer.id)}
                      className="select-style py-1"
                    >
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="relative w-[300px]">
              <Search className="absolute left-3 top-3.5 text-primary w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by order No or sNo..."
                className="input-style h-[40px] pl-9 bg-white"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPageNo(0);
                }}
              />
            </div>
            {role !== "ROLE_SUPERVISOR" && (
              <Button
                className="h-[40px] text-[11px] mt-[1px] font-semibold"
                onClick={() => {
                  setEditData(null);
                  setOpen(true);
                }}
              >
                <Plus />
                Add New Order
              </Button>
            )}
          </div>
        </div>
        <div className="rounded-lg bg-white border border-slate-200 shadow-2xl shadow-primary/10 backdrop-blur-lg px-4 py-2 mt-[12px]">
          {isLoading ? (
            <TableSkeleton />
          ) : orders && orders.content && orders.content.length > 0 ? (
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
                    Status
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Customer
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Order No
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Order SNo
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Total Target
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Daily Target
                  </TableHead>
                  {role !== "ROLE_SUPERVISOR" && (
                    <>
                      <TableHead className="text-[11px] font-bold">
                        Edit
                      </TableHead>
                      <TableHead className="text-[11px] font-bold">
                        Delete
                      </TableHead>
                    </>
                  )}
                  <TableHead className="text-[11px] font-bold">
                    Manage Order
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.content.map((order: any, index: number) => (
                  <TableRow
                    key={order.id}
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
                      {order.createdAt
                        ? format(new Date(order.createdAt), "dd/MM/yyyy")
                        : "-"}
                    </TableCell>

                    <TableCell className="py-3 flex items-center gap-2">
                      <div className="mt-[4px]">
                        <Switch
                          small
                          checked={order.controlByDashBoard === 1}
                          onCheckedChange={(checked) => {
                            setUpdatingId(order.id);
                            editOrderStatusMutation.mutate(
                              {
                                id: order.id,
                                orderData: {
                                  controlByDashBoard: checked ? 1 : 0,
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
                      {editOrderStatusMutation.isPending &&
                        updatingId === order.id && (
                          <Spinner
                            size="w-[12px] h-[12px]"
                            color="border-primary"
                            borderSize="border-2"
                          />
                        )}
                    </TableCell>

                    <TableCell className="py-3 text-[11px]">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-[22px] w-[60px] font-semibold text-[9px]
    ${
      order.isCompleted === 1
        ? "bg-softgreen/20 text-darkgreen border-darkgreen"
        : "border-primary bg-slate-200/50 text-primary"
    }
  `}
                      >
                        {order.isCompleted === 0 ? "In Queue" : "Completed"}
                      </Button>
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {order.customerLib?.name}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {order.orderNo}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {order.orderSNO}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {order.totalTarget}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {order.dailyTarget}
                    </TableCell>
                    {role !== "ROLE_SUPERVISOR" && (
                      <>
                        <TableCell className="py-3 text-[11px]">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-primary text-primary text-[9px] h-[26px]"
                            onClick={() => {
                              setEditData(order);
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
                            onClick={() => setDeleteId(order.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </>
                    )}
                    <TableCell className="py-3 text-[11px]">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-primary text-white font-semibold text-[9px] h-[26px] gap-1.5"
                        onClick={() => {
                          navigate("/order-detail", { state: { order } });
                        }}
                      >
                        <ClipboardList className="!h-3 !w-3" />
                        Manage Order
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

        <AddOrderDialog
          open={open}
          onClose={() => setOpen(false)}
          isEdit={!!editData}
          orderData={editData}
          refetch={refetch}
        />
      </div>

      {orders && orders.content && orders.content.length > 0 && (
        <div className="pt-[30px] flex flex-row justify-center">
          <CustomPagination
            pageNo={pageNo}
            setPageNo={setPageNo}
            totalElements={orders?.totalElements ?? 0}
            pageSize={pageSize}
          />
        </div>
      )}
    </div>
  );
};

export default Orders;
