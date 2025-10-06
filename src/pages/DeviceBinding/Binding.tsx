import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDevicesQuery, useDeleteDeviceMutation } from "@/api/bindDevice";
import { Plus, Search } from "lucide-react";
import NoDataAvailable from "@/app-components/common/NoData";
import { useContext, useState } from "react";
import { DeleteConfirmationDialog } from "@/app-components/common/DeleteConfirmAlert";
import TableSkeleton from "@/app-components/common/TableSkeleton";
import CustomPagination from "@/app-components/common/Pagination";
import { Input } from "@/components/ui/input";
import useDebounce from "@/lib/helperFunctions";
import { AuthContext } from "@/context/AuthContext";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddDeviceDialog from "@/app-components/forms/Device";
import { useFloorsQuery } from "@/api/floor";
import { useBuildingsQuery } from "@/api/building";
import { useHallsQuery } from "@/api/hall";
import FilterSkeleton from "@/app-components/common/FilterSkeleton";
import { useBranchesQuery } from "@/api/branch";
import { useRowsQuery } from "@/api/row";
import { useMachinesQuery } from "@/api/machine";
import DeviceBindingDialog from "@/app-components/forms/DeviceBinding";
const Binding = () => {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [branchId, setBranchId] = useState<any | null>(undefined);
  const [rowId, setRowId] = useState<any | null>(undefined);
  const [floorId, setFloorId] = useState<any | null>(undefined);
  const [hallId, setHallId] = useState<any | null>(undefined);
  const [buildingId, setBuildingId] = useState<any | null>(undefined);
  const [machineId, setMachineId] = useState<any | null>(undefined);
  const [pageNo, setPageNo] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const { companyId } = useContext(AuthContext);
  const pageSize = 10;
  const { data: branches, isLoading: branchesLoading } = useBranchesQuery(
    0,
    1000000,
    companyId
  );
  const { data: floors, isPending } = useFloorsQuery(
    0,
    1000000,
    companyId,
    branchId,
    buildingId
  );
  const { data: halls, isFetching } = useHallsQuery(
    0,
    1000000,
    companyId,
    branchId,
    buildingId,
    floorId
  );
  const { data: rows, isLoading: rowsLoading } = useRowsQuery(
    0,
    1000000,
    companyId,
    branchId,
    buildingId,
    floorId,
    hallId
  );
  const { data: buildings, isLoading: buildingsLoading } = useBuildingsQuery(
    0,
    1000000,
    companyId,
    branchId
  );
  const {
    data: devices,
    isLoading,
    refetch,
  } = useDevicesQuery(
    0,
    pageSize,
    companyId,
    branchId,
    buildingId,
    floorId,
    hallId,
    rowId,
    debouncedSearch
  );
  const deleteMutation = useDeleteDeviceMutation();
  return (
    <div className="pb-10">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-[22px] font-bold ">Devices</h2>
          </div>

          <div className="flex flex-row justify-end items-center gap-[5px]">
            {branchesLoading ? (
              <FilterSkeleton small />
            ) : (
              <Select
                onValueChange={(value) => {
                  setBranchId(value === "all" ? undefined : value);
                  setPageNo(0);
                }}
              >
                <SelectTrigger className="w-[120px] input-style bg-white">
                  <SelectValue placeholder="Filter by Branch" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-300">
                  <SelectItem value="all" className="select-style py-2">
                    All Branches
                  </SelectItem>
                  {branches?.content?.map((branch: any) => (
                    <SelectItem
                      key={branch.id}
                      value={String(branch.id)}
                      className="select-style py-1"
                    >
                      {branch.branchName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {buildingsLoading ? (
              <FilterSkeleton medium />
            ) : (
              <Select
                onValueChange={(value) => {
                  setBuildingId(value === "all" ? undefined : value);
                  setPageNo(0);
                }}
              >
                <SelectTrigger className="w-[130px] input-style bg-white">
                  <SelectValue placeholder="Filter by Building" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-300">
                  <SelectItem value="all" className="select-style py-2">
                    All Buildings
                  </SelectItem>
                  {buildings?.content?.map((building: any) => (
                    <SelectItem
                      key={building.id}
                      value={String(building.id)}
                      className="select-style py-1"
                    >
                      {building.buildingName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {isPending ? (
              <FilterSkeleton xsmall />
            ) : (
              <Select
                onValueChange={(value) => {
                  setFloorId(value === "all" ? undefined : value);
                  setPageNo(0);
                }}
              >
                <SelectTrigger className="w-[110px] input-style bg-white">
                  <SelectValue placeholder="Filter by Floor" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-300">
                  <SelectItem value="all" className="select-style py-2">
                    All Floors
                  </SelectItem>
                  {floors?.content?.map((floor: any) => (
                    <SelectItem
                      key={floor.id}
                      value={String(floor.id)}
                      className="select-style py-1"
                    >
                      {floor.floorName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {isFetching ? (
              <FilterSkeleton xsmall />
            ) : (
              <Select
                onValueChange={(value) => {
                  setHallId(value === "all" ? undefined : value);
                  setPageNo(0);
                }}
              >
                <SelectTrigger className="w-[110px] h-[40px] input-style bg-white">
                  <SelectValue placeholder="Filter by Hall" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-300">
                  <SelectItem value="all" className="select-style py-2">
                    All Halls
                  </SelectItem>
                  {halls?.content?.map((hall: any) => (
                    <SelectItem
                      key={hall.id}
                      value={String(hall.id)}
                      className="select-style py-1"
                    >
                      {hall.hallName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {rowsLoading ? (
              <FilterSkeleton xsmall />
            ) : (
              <Select
                onValueChange={(value) => {
                  setRowId(value === "all" ? undefined : value);
                  setPageNo(0);
                }}
              >
                <SelectTrigger className="w-[110px] input-style bg-white">
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
            <div className="relative w-[230px]">
              <Search className="absolute left-3 top-3.5 text-primary w-4 h-4" />
              <Input
                type="text"
                placeholder="Search devices..."
                className="input-style pl-9 bg-white"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPageNo(0);
                }}
              />
            </div>
            <Button
              className="h-[40px] w-[110px] text-[11px] mt-[1px] font-semibold"
              onClick={() => {
                setEditData(null);
                setOpen(true);
              }}
            >
              <Plus />
              Bind Device
            </Button>
          </div>
        </div>
        <div className="rounded-lg bg-white border border-slate-200 shadow-2xl shadow-primary/10 backdrop-blur-lg px-4 py-2 mt-[10px]">
          {isLoading ? (
            <TableSkeleton />
          ) : devices && devices.content && devices.content.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 bg-lightgray">
                  <TableHead className="text-[11px] font-bold py-2">
                    Sr#
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">Date</TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Machine Name
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Device Name
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Device MAC
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">Edit</TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Delete
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.content.map((device: any, index: number) => (
                  <TableRow
                    key={device.id}
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
                      {device.createdAt
                        ? format(new Date(device.createdAt), "dd/MM/yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {device.machine?.machineName}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {device.displayName}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {device.uid}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary text-primary text-[9px] h-[26px]"
                        onClick={() => {
                          setEditData(device);
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
                        onClick={() => setDeleteId(device.id)}
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

        <DeviceBindingDialog
          open={open}
          onClose={() => setOpen(false)}
          isEdit={!!editData}
          deviceData={editData}
          refetch={refetch}
        />
      </div>

      {devices && devices.content && devices.content.length > 0 && (
        <div className="pt-[30px] flex flex-machine justify-center">
          <CustomPagination
            pageNo={pageNo}
            setPageNo={setPageNo}
            totalElements={devices?.totalElements ?? 0}
            pageSize={pageSize}
          />
        </div>
      )}
    </div>
  );
};

export default Binding;
