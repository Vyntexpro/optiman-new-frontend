import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUsersQuery, useDeleteUserMutation } from "@/api/device";
import { Plus, Search } from "lucide-react";
import NoDataAvailable from "@/app-components/common/NoData";
import { useState } from "react";
import { DeleteConfirmationDialog } from "@/app-components/common/DeleteConfirmAlert";
import TableSkeleton from "@/app-components/common/TableSkeleton";
import CustomPagination from "@/app-components/common/Pagination";
import AddDeviceDialog from "@/app-components/forms/Device";
import { Input } from "@/components/ui/input";
import useDebounce from "@/lib/helperFunctions";
import { format } from "date-fns";

const AllDevices = () => {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [pageNo, setPageNo] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const pageSize = 10;
  const {
    data: users,
    isLoading,
    refetch,
  } = useUsersQuery(pageNo, pageSize, debouncedSearch, "devices");
  const deleteMutation = useDeleteUserMutation();
  return (
    <div className="pb-10">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-bold ">All Devices</h2>
          <div className="flex flex-row items-center gap-[8px]">
            <div className="relative w-[300px]">
              <Search className="absolute left-3 top-3.5 text-primary w-4 h-4" />
              <Input
                type="text"
                placeholder="Search devices..."
                className="input-style h-[40px] pl-9 bg-white"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPageNo(0);
                }}
              />
            </div>
            <Button
              className="h-[40px] mt-[1px] text-[11px] font-semibold"
              onClick={() => {
                setEditData(null);
                setOpen(true);
              }}
            >
              <Plus />
              Add New Device
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-white border border-slate-200 shadow-2xl shadow-primary/10 backdrop-blur-lg px-4 py-2 mt-[12px]">
          {isLoading ? (
            <TableSkeleton />
          ) : users && users.content && users.content.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 bg-lightgray">
                  <TableHead className="text-[11px] font-bold">Sr#</TableHead>
                  <TableHead className="text-[11px] font-bold py-2">
                    Date
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Company
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Device Name
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Device MAC Address
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">Edit</TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Delete
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.content.map((user: any, index: number) => (
                  <TableRow
                    key={user.id}
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
                      {user.createdAt
                        ? format(new Date(user.createdAt), "dd/MM/yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {user.company?.companyName || "epteck"}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {user.firstName || "---"}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {user.userName}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary text-[9px] h-[26px] text-primary"
                        onClick={() => {
                          setEditData(user);
                          setOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                    <TableCell className="py-3">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-lightred text-[9px] font-semibold h-[26px] text-red"
                        onClick={() => setDeleteId(user.id)}
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

        <AddDeviceDialog
          open={open}
          onClose={() => setOpen(false)}
          isEdit={!!editData}
          deviceData={editData}
          refetch={refetch}
        />
      </div>

      {users && users.content && users.content.length > 0 && (
        <div className="pt-[30px] flex flex-row justify-center">
          <CustomPagination
            pageNo={pageNo}
            setPageNo={setPageNo}
            totalElements={users?.totalElements ?? 0}
            pageSize={pageSize}
          />
        </div>
      )}
    </div>
  );
};

export default AllDevices;
