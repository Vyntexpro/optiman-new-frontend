import { useLocation } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Spinner from "@/app-components/common/Spinner";
import { useEditOrderStatusMutation } from "@/api/order";
import { useContext, useState } from "react";
import { Plus } from "lucide-react";
import {
  useDeleteVariationMutation,
  useVariationsQuery,
} from "@/api/orderVariation";
import { AuthContext } from "@/context/AuthContext";
import useDebounce from "@/lib/helperFunctions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { DeleteConfirmationDialog } from "@/app-components/common/DeleteConfirmAlert";
import NoDataAvailable from "@/app-components/common/NoData";
import TableSkeleton from "@/app-components/common/TableSkeleton";
import AddvariationDialog from "@/app-components/forms/orderVariation";
import PleaseSelect from "@/app-components/common/PleaseSelect";
import { useOrderArticlesOperationsQuery } from "@/api/ArticleOperation";
import SmallTableSkeleton from "@/app-components/common/SmallTableSkeleton";
import { GiSewingMachine } from "react-icons/gi";
import AddMachinesDialog from "@/app-components/forms/AssignMachines";

const OrderDetail = () => {
  const location = useLocation();
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);
  const { order: initialOrder } = location.state || {};
  const [order, setOrder] = useState(initialOrder);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<any>(null);
  const [pageNo, setPageNo] = useState(0);
  const orderId = order.id;
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const { companyId } = useContext(AuthContext);
  const pageSize = 10;
  const {
    data: variations,
    isLoading,
    refetch,
  } = useVariationsQuery(orderId, debouncedSearch);
  const {
    data: operations,
    isPending,
    refetch: operationsRefetch,
  } = useOrderArticlesOperationsQuery(selectedArticle);
  const deleteMutation = useDeleteVariationMutation();
  const editOrderStatusMutation = useEditOrderStatusMutation();

  const handleStatusChange = (checked: boolean) => {
    setOrder((prev: any) => ({
      ...prev,
      controlByDashBoard: checked ? 1 : 0,
    }));

    editOrderStatusMutation.mutate(
      {
        id: order.id,
        orderData: { controlByDashBoard: checked ? 1 : 0 },
      },
      {
        onError: () => {
          setOrder((prev: any) => ({
            ...prev,
            controlByDashBoard: !checked ? 1 : 0,
          }));
        },
      }
    );
  };
  return (
    <div className="page-container">
      <h2 className="text-[23px] font-bold mb-4">Manage Order</h2>
      <div className="flex flex-row items-start gap-[18px] w-full">
        <div className="bg-white w-[400px] rounded-xl border border-slate-200 p-4 space-y-2">
          <div className="flex text-[12px]">
            <span className="font-medium w-44">Order No:</span>
            <span>{order.orderNo}</span>
          </div>
          <div className="flex text-[12px]">
            <span className="font-medium w-44">Order SNO:</span>
            <span>{order.orderSNO}</span>
          </div>
          <div className="flex text-[12px]">
            <span className="font-medium w-44">Customer:</span>
            <span>{order.customerLib?.name}</span>
          </div>
          <div className="flex text-[12px]">
            <span className="font-medium w-44">Created At:</span>
            <span>
              {order.createdAt
                ? format(new Date(order.createdAt), "dd/MM/yyyy")
                : "-"}
            </span>
          </div>
          <div className="flex text-[12px]">
            <span className="font-medium w-44">Total Target:</span>
            <span>{order.totalTarget}</span>
          </div>
          <div className="flex text-[12px]">
            <span className="font-medium w-44">Daily Target:</span>
            <span>{order.dailyTarget}</span>
          </div>
          <div className="flex text-[12px]">
            <span className="font-medium w-44">Garment Sam:</span>
            <span>{order.garmentSam}</span>
          </div>
          <div className="flex text-[12px]">
            <span className="font-medium w-44">Accepted Efficiency:</span>
            <span>{order.weeklyEfficiency}%</span>
          </div>
          <div className="flex flex-wrap text-[12px] items-center">
            <span className="font-medium w-44">Rows:</span>
            <span>{order.rows?.map((r: any) => r.rowName).join(", ")}</span>
          </div>
          <div className="flex items-center gap-[10px] pt-[6px]">
            <p className="font-medium text-[12px]">Active Status:</p>
            <div className="!ml-[88px] flex flex-row gap-[10px] items-center">
              <Switch
                small
                checked={order.controlByDashBoard === 1}
                onCheckedChange={handleStatusChange}
              />
              {editOrderStatusMutation.isPending && (
                <Spinner
                  size="w-[12px] h-[12px]"
                  color="border-primary"
                  borderSize="border-2"
                />
              )}
            </div>
          </div>
          <p className="pt-[6px] flex items-center">
            <span className="font-medium text-[12px] mr-[65px]">
              Completion Status:
            </span>{" "}
            <Button
              variant="outline"
              size="sm"
              className={`h-[22px] w-[60px] font-semibold text-[9px] ${
                order.isCompleted === 1
                  ? "bg-softgreen/20 text-darkgreen border-darkgreen"
                  : "border-primary bg-slate-200/50 text-primary"
              }`}
            >
              {order.isCompleted === 0 ? "In Queue" : "Completed"}
            </Button>
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl w-[890px] min-h-[329px] max-h-[329px] overflow-y-auto border border-slate-200">
          <div className="flex flex-row items-center justify-between mb-[6px]">
            <p className="font-semibold text-[15px]">
              Assign Machines to Article Operations
            </p>

            <Select
              onValueChange={(value) => {
                setSelectedArticle(Number(value));
              }}
            >
              <SelectTrigger className="w-[130px] !h-[30px] input-style bg-white">
                <SelectValue placeholder="Select Article" />
              </SelectTrigger>

              <SelectContent className="bg-white border-slate-300">
                {order.makeOrderArticle?.map((a: any) => (
                  <SelectItem
                    key={a.id}
                    value={a.id}
                    className="select-style py-[2px]"
                  >
                    {a.articleName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!selectedArticle ? (
            <PleaseSelect />
          ) : isPending ? (
            <SmallTableSkeleton />
          ) : (
            operations &&
            operations.content?.length > 0 && (
              <Table className="">
                <TableHeader>
                  <TableRow className="border-b border-slate-200 bg-lightgray">
                    <TableHead className="text-[10px] font-bold">Sr#</TableHead>
                    <TableHead className="text-[10px] font-bold">
                      Operation
                    </TableHead>
                    <TableHead className="text-[10px] font-bold">
                      Operation No
                    </TableHead>
                    <TableHead className="text-[10px] font-bold">
                      Manage Machines
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operations.content?.map((operation: any, index: number) => (
                    <TableRow
                      key={operation.orderDetailId}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
                    >
                      <TableCell className="py-1 text-[10px]">
                        {index + 1 + pageNo * pageSize}
                      </TableCell>

                      <TableCell className="py-1 text-[10px]">
                        {operation.displayName}
                      </TableCell>
                      <TableCell className="py-1 text-[10px]">
                        {operation.opId}
                      </TableCell>
                      <TableCell className="py-1 text-[10px]">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-primary bg-slate-200/50 font-semibold text-primary text-[9px] h-[24px]"
                          onClick={() => {
                            setSelectedOperation(operation);
                            setOpenDialog(true);
                          }}
                        >
                          <GiSewingMachine className="mr-1" />
                          Manage Machines
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          )}
        </div>
        <AddMachinesDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          machineData={selectedOperation}
          orderId={orderId}
          refetch={operationsRefetch}
        />
      </div>

      <div className="rounded-lg border border-slate-200 shadow-2xl bg-white shadow-primary/10 backdrop-blur-lg px-4 py-2 mt-[18px] mb-[30px]">
        <div className="flex items-start justify-between mb-[12px] mt-[10px]">
          <h2 className="text-[18px] font-bold ">Order Variations</h2>
          <Button
            className="h-[40px] w-[140px] flex items-center text-[10px] font-semibold"
            onClick={() => {
              setEditData(null);
              setOpen(true);
            }}
          >
            <Plus />
            <p className="text-[10px] font-semibold mt-[2px]">
              Add New Variation
            </p>
          </Button>
        </div>
        {isLoading ? (
          <TableSkeleton />
        ) : variations && variations.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 bg-lightgray">
                <TableHead className="text-[11px] font-bold py-2">
                  Sr#
                </TableHead>
                <TableHead className="text-[11px] font-bold">Article</TableHead>

                <TableHead className="text-[11px] font-bold ">Size</TableHead>

                <TableHead className="text-[11px] font-bold">Color</TableHead>
                <TableHead className="text-[11px] font-bold">
                  Quantity
                </TableHead>
                <TableHead className="text-[11px] font-bold">Edit</TableHead>
                <TableHead className="text-[11px] font-bold">Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variations.map((variation: any, index: number) => (
                <TableRow
                  key={variation.OrderDetailId}
                  className={`
                border-b border-slate-100 last:border-b-0
                hover:bg-slate-50 transition-colors
              `}
                >
                  <TableCell className="py-2 text-[11px]">
                    {index + 1 + pageNo * pageSize}
                  </TableCell>
                  <TableCell className="py-2 text-[11px]">
                    {variation.articleName}
                  </TableCell>
                  <TableCell className="py-2 text-[11px]">
                    {variation.size}
                  </TableCell>
                  <TableCell className="py-2 text-[11px]">
                    {variation.color}
                  </TableCell>
                  <TableCell className="py-2 text-[11px]">
                    {variation.quantity}
                  </TableCell>
                  <TableCell className="py-2 text-[11px]">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary text-[9px] h-[26px] text-primary"
                      onClick={() => {
                        setEditData(variation);
                        setOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                  <TableCell className="py-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-lightred text-red h-[26px] font-semibold text-[9px]"
                      onClick={() => setDeleteId(variation.orderDetailId)}
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
              await refetch();
            }
          }}
        />
      </div>

      <AddvariationDialog
        open={open}
        onClose={() => setOpen(false)}
        isEdit={!!editData}
        variationData={editData}
        totalTarget={order.totalTarget}
        refetch={refetch}
        orderId={orderId}
      />
    </div>
  );
};

export default OrderDetail;
