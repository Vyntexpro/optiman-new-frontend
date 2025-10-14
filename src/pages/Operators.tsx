import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useOperatorsQuery,
  useDeleteOperatorMutation,
  useEditOperatorStatusMutation,
} from "@/api/operator";
import { Plus, Search } from "lucide-react";
import NoDataAvailable from "@/app-components/common/NoData";
import { useContext, useState } from "react";
import { DeleteConfirmationDialog } from "@/app-components/common/DeleteConfirmAlert";
import TableSkeleton from "@/app-components/common/TableSkeleton";
import CustomPagination from "@/app-components/common/Pagination";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/context/AuthContext";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
// import AddOperatorDialog from "@/app-components/forms/Operator";
import { useBranchesQuery } from "@/api/branch";
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
import AddOperatorDialog from "@/app-components/forms/Operator";
const Operators = () => {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [pageNo, setPageNo] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const { companyId } = useContext(AuthContext);
  const pageSize = 10;
  const {
    data: operators,
    isLoading,
    refetch,
  } = useOperatorsQuery(pageNo, pageSize, companyId, debouncedSearch);
  const editOperatorStatusMutation = useEditOperatorStatusMutation();
  const deleteMutation = useDeleteOperatorMutation();
  return (
    <div className="page-container">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-[23px] font-bold ">Manage Operators</h2>
          </div>

          <div className="flex flex-row items-center gap-[8px]">
            <div className="relative w-[300px]">
              <Search className="absolute left-3 top-3.5 text-primary w-4 h-4" />
              <Input
                type="text"
                placeholder="Search operators..."
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
              Add New Operator
            </Button>
          </div>
        </div>
        <div className="rounded-lg bg-white border border-slate-200 shadow-2xl shadow-primary/10 backdrop-blur-lg px-4 py-2 mt-[12px]">
          {isLoading ? (
            <TableSkeleton />
          ) : operators && operators.content && operators.content.length > 0 ? (
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
                    Expiry Date
                  </TableHead>

                  <TableHead className="text-[11px] font-bold">Name</TableHead>
                  <TableHead className="text-[11px] font-bold">Code</TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Login Status
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Last Login (Date/Device)
                  </TableHead>

                  <TableHead className="text-[11px] font-bold">Edit</TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Delete
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operators.content.map((operator: any, index: number) => (
                  <TableRow
                    key={operator.id}
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
                      {operator.createdAt
                        ? format(new Date(operator.createdAt), "dd/MM/yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell className="py-3 flex items-center gap-2">
                      <div className="mt-[4px]">
                        <Switch
                          small
                          checked={operator.status === 1}
                          onCheckedChange={(checked) => {
                            setUpdatingId(operator.id);
                            editOperatorStatusMutation.mutate(
                              {
                                id: operator.id,
                                operatorData: {
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
                      {editOperatorStatusMutation.isPending &&
                        updatingId === operator.id && (
                          <Spinner
                            size="w-[12px] h-[12px]"
                            color="border-primary"
                            borderSize="border-2"
                          />
                        )}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {operator.cardTag}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {operator.autoExpiryDate
                        ? format(
                            new Date(operator.autoExpiryDate),
                            "dd/MM/yyyy"
                          )
                        : "not available"}
                    </TableCell>

                    <TableCell className="py-3 text-[11px]">
                      {operator.operatorName}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {operator.userSrNo}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-[22px] w-[58px] font-semibold text-[9px]
    ${
      operator.loginStatus === 1
        ? "bg-softgreen/20 text-darkgreen border-darkgreen"
        : "border-red bg-lightred/40 text-red font-semibold"
    }
  `}
                      >
                        {operator.loginStatus === 1 ? "Logged in" : "Offline"}
                      </Button>
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {operator.lastLoginDate && operator.loggedInDevice ? (
                        <>
                          {format(
                            new Date(operator.lastLoginDate),
                            "dd/MM/yyyy"
                          )}
                          /{operator.loggedInDevice}
                        </>
                      ) : (
                        "not logged in yet"
                      )}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary text-primary text-[9px] h-[26px]"
                        onClick={() => {
                          setEditData(operator);
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
                        onClick={() => setDeleteId(operator.id)}
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
        <AddOperatorDialog
          open={open}
          onClose={() => setOpen(false)}
          isEdit={!!editData}
          operatorData={editData}
          refetch={refetch}
        />
      </div>

      {operators && operators.content && operators.content.length > 0 && (
        <div className="pt-[30px] flex flex-row justify-center">
          <CustomPagination
            pageNo={pageNo}
            setPageNo={setPageNo}
            totalElements={operators?.totalElements ?? 0}
            pageSize={pageSize}
          />
        </div>
      )}
    </div>
  );
};

export default Operators;
