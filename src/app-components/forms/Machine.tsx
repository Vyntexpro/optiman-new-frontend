import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "../common/Spinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAddMachineMutation, useEditMachineMutation } from "@/api/machine";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useFloorsQuery } from "@/api/floor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";
import { useBuildingsQuery } from "@/api/building";
import { useHallsQuery } from "@/api/hall";
import InputFieldSkeleton from "../common/InputFieldSkeleton";
import { useBranchesQuery } from "@/api/branch";
import { useRowsQuery } from "@/api/row";
import { useBrandsQuery } from "@/api/machineBrand";
import { useTypesQuery } from "@/api/machineType";
import { Switch } from "@/components/ui/switch";

const machineSchema = z.object({
  machineName: z.string().min(1, "Machine name is required"),
  branchId: z.string().min(1, "Branch is required"),
  hallId: z.string().min(1, "Hall is required"),
  buildingId: z.string().min(1, "Building is required"),
  floorId: z.string().min(1, "Floor is required"),
  rowId: z.string().min(1, "Row is required"),
  machineTypeId: z.string().min(1, "Machine type is required"),
  machineBrandId: z.string().min(1, "Machine brand is required"),
  machineId: z.string().min(1, "Machine No is required"),
  machineCode: z.string().min(1, "Machine Code is required"),
  initialCurrent: z.coerce.number().min(1, "Initial current is required"),
  maxCurrent: z.coerce.number().min(1, "Max current is required"),
  status: z.string().optional(),
});

type MachineFormData = z.infer<typeof machineSchema>;

interface AddMachineDialogProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  machineData?: any;
  refetch: () => void;
}

const AddMachineDialog: React.FC<AddMachineDialogProps> = ({
  open,
  onClose,
  isEdit,
  machineData,
  refetch,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
  } = useForm<MachineFormData>({
    resolver: zodResolver(machineSchema),
  });
  const pageSize = 1000000;
  const { companyId } = useContext(AuthContext);
  const branchId = isNaN(Number(watch("branchId")))
    ? undefined
    : Number(watch("branchId"));
  const buildingId = isNaN(Number(watch("buildingId")))
    ? undefined
    : Number(watch("buildingId"));
  const floorId = isNaN(Number(watch("floorId")))
    ? undefined
    : Number(watch("floorId"));
  const hallId = isNaN(Number(watch("hallId")))
    ? undefined
    : Number(watch("hallId"));
  const [apiError, setApiError] = useState<string | null>(null);
  const addMachineMutation = useAddMachineMutation(setApiError);
  const editMachineMutation = useEditMachineMutation(setApiError);
  const { data: branches, isPending } = useBranchesQuery(
    0,
    pageSize,
    companyId
  );
  const { data: buildings, isLoading: buildingsLoading } = useBuildingsQuery(
    0,
    pageSize,
    companyId,
    branchId
  );
  const { data: halls, isFetching } = useHallsQuery(
    0,
    pageSize,
    companyId,
    branchId,
    buildingId,
    floorId
  );
  const { data: rows, isLoading: rowsLoading } = useRowsQuery(
    0,
    pageSize,
    companyId,
    branchId,
    buildingId,
    floorId,
    hallId
  );
  const { data: floors, isLoading } = useFloorsQuery(
    0,
    pageSize,
    companyId,
    branchId,
    buildingId
  );
  const { data: brands, isPending: brandsLoading } = useBrandsQuery(
    0,
    10000,
    companyId
  );
  const { data: types, isPending: typesLoading } = useTypesQuery(
    0,
    1000,
    companyId
  );
  useEffect(() => {
    if (open) {
      if (isEdit && machineData) {
        reset({
          machineName: machineData.machineName || "",
          status: machineData.status || "",
          machineId: machineData.machineId || "",
          initialCurrent: machineData.initialCurrent || null,
          maxCurrent: machineData.maxCurrent || null,
          machineCode: machineData.machineCode || "",
          rowId: machineData.row?.id ? String(machineData.row.id) : "",
          hallId: machineData.row?.hall?.id
            ? String(machineData.row.hall.id)
            : "",
          buildingId: machineData.row?.hall?.floor?.building?.id
            ? String(machineData.row?.hall?.floor?.building.id)
            : "",
          floorId: machineData.row?.hall?.floor?.id
            ? String(machineData.row?.hall?.floor.id)
            : "",
          branchId: machineData.row?.hall?.floor?.building?.branch?.id
            ? String(machineData.row?.hall?.floor?.building?.branch?.id)
            : "",
          machineTypeId: machineData.machineTypeLib?.id
            ? String(machineData.machineTypeLib?.id)
            : "",
          machineBrandId: machineData.machineBrandLib?.id
            ? String(machineData.machineBrandLib?.id)
            : "",
        });
      } else {
        reset({
          machineName: "",
          machineId: "",
          machineCode: "",
          initialCurrent: null,
          maxCurrent: null,
          branchId: "",
          machineTypeId: "",
          machineBrandId: "",
          hallId: "",
          status: "INACTIVE",
          buildingId: "",
          floorId: "",
          rowId: "",
        });
      }
    }
  }, [isEdit, machineData, reset, open]);

  const onSubmit = (data: MachineFormData) => {
    let payload: any = {
      machineName: data.machineName,
      machineId: data.machineId,
      status: data.status,
      machineCode: data.machineCode,
      initialCurrent: data.initialCurrent,
      maxCurrent: data.maxCurrent,
      machineBrandLib: { id: Number(data.machineBrandId) },
      machineTypeLib: { id: Number(data.machineTypeId) },
      row: { id: Number(data.rowId) },
    };

    if (isEdit && machineData?.id) {
      payload = { ...payload, id: machineData.id };
      editMachineMutation.mutate(
        { id: machineData.id, machineData: payload },
        {
          onSuccess: () => {
            reset();
            onClose();
            refetch?.();
          },
        }
      );
    } else {
      addMachineMutation.mutate(payload, {
        onSuccess: () => {
          reset();
          onClose();
          refetch?.();
        },
      });
    }
  };
  const isSubmitting =
    isEdit && machineData?.id
      ? editMachineMutation.isPending
      : addMachineMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-white px-[20px] sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? "Edit Machine" : "Add New Machine"}
          </DialogTitle>
        </DialogHeader>
        {isPending && brandsLoading && typesLoading ? (
          <div className="flex items-center justify-center py-[120px]">
            <Spinner
              size="w-10 h-10"
              color="border-primary"
              borderSize="border-4"
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-[11px]">Select Branch</Label>
                <Controller
                  name="branchId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        reset((prev) => ({ ...prev, buildingId: "" }));
                      }}
                    >
                      <SelectTrigger className="input-style bg-white">
                        <SelectValue placeholder="Select Branch" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-300">
                        {branches && branches.content?.length > 0 ? (
                          branches?.content?.map((branch: any) => (
                            <SelectItem
                              key={branch.id}
                              value={String(branch.id)}
                              className="select-style py-1"
                            >
                              {branch.branchName}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="nodatatext">
                            No Branches Available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.branchId && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.branchId.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-[11px]">Select Building</Label>
                {buildingsLoading ? (
                  <InputFieldSkeleton />
                ) : (
                  <Controller
                    name="buildingId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          reset((prev) => ({ ...prev, floorId: "" }));
                        }}
                      >
                        <SelectTrigger className="input-style bg-white">
                          <SelectValue placeholder="Select Building" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-300 cursor-pointer">
                          {buildings && buildings.content?.length > 0 ? (
                            buildings?.content?.map((building: any) => (
                              <SelectItem
                                key={building.id}
                                value={String(building.id)}
                                className="select-style py-1"
                              >
                                {building.buildingName}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="nodatatext">
                              No Buildings Available
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
                {errors.buildingId && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.buildingId.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="floorId" className="text-[11px]">
                  Select Floor
                </Label>
                {isLoading ? (
                  <InputFieldSkeleton />
                ) : (
                  <Controller
                    name="floorId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          reset((prev) => ({ ...prev, hallId: "" }));
                        }}
                      >
                        <SelectTrigger className="input-style bg-white">
                          <SelectValue placeholder="Select Floor" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-300">
                          {floors && floors.content?.length > 0 ? (
                            floors?.content?.map((floor: any) => (
                              <SelectItem
                                key={floor.id}
                                value={String(floor.id)}
                                className="select-style py-1"
                              >
                                {floor.floorName}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="nodatatext">
                              No Floors Available
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
                {errors.floorId && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.floorId.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="hallId" className="text-[11px]">
                  Select Hall
                </Label>
                {isFetching ? (
                  <InputFieldSkeleton />
                ) : (
                  <Controller
                    name="hallId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          reset((prev) => ({ ...prev, rowId: "" }));
                        }}
                      >
                        <SelectTrigger className="input-style">
                          <SelectValue placeholder="Select Hall" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-300">
                          {halls && halls.content?.length > 0 ? (
                            halls?.content.map((h: any) => (
                              <SelectItem
                                className="select-style py-1"
                                key={h.id}
                                value={String(h.id)}
                              >
                                {h.hallName}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="nodatatext">No Halls Available</div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
                {errors.hallId && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.hallId.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="rowId" className="text-[11px]">
                  Select Row
                </Label>
                {rowsLoading ? (
                  <InputFieldSkeleton />
                ) : (
                  <Controller
                    name="rowId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="input-style">
                          <SelectValue placeholder="Select Row" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-300">
                          {rows && rows.content?.length > 0 ? (
                            rows?.content.map((r: any) => (
                              <SelectItem
                                className="select-style py-1"
                                key={r.id}
                                value={String(r.id)}
                              >
                                {r.rowName}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="nodatatext">No Rows Available</div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
                {errors.rowId && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.rowId.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="machineName" className="text-[11px]">
                  Machine Name
                </Label>
                <Input
                  id="machineName"
                  {...register("machineName")}
                  className="input-style h-[50px]"
                  placeholder="Enter machine name"
                />
                {errors.machineName && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.machineName.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="machineId" className="text-[11px]">
                  Machine No
                </Label>
                <Input
                  id="machineId"
                  {...register("machineId")}
                  className="input-style"
                  placeholder="Enter machine number"
                />
                {errors.machineId && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.machineId.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="machineCode" className="text-[11px]">
                  Machine Code
                </Label>
                <Input
                  id="machineCode"
                  {...register("machineCode")}
                  className="input-style"
                  placeholder="Enter machine code"
                />
                {errors.machineCode && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.machineCode.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="initialCurrent" className="text-[11px]">
                  Initial Current
                </Label>
                <Input
                  id="initialCurrent"
                  type="number"
                  {...register("initialCurrent")}
                  className="input-style"
                  placeholder="Enter initial current"
                />
                {errors.initialCurrent && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.initialCurrent.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="maxCurrent" className="text-[11px]">
                  Max Current
                </Label>
                <Input
                  id="maxCurrent"
                  type="number"
                  {...register("maxCurrent")}
                  className="input-style"
                  placeholder="Enter max current"
                />
                {errors.maxCurrent && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.maxCurrent.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="machineBrandId" className="text-[11px]">
                  Select Machine Brand
                </Label>
                <Controller
                  name="machineBrandId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="input-style">
                        <SelectValue placeholder="Select Machine Brand" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-300">
                        {brands && brands.content?.length > 0 ? (
                          brands?.content.map((b: any) => (
                            <SelectItem
                              className="select-style py-1"
                              key={b.id}
                              value={String(b.id)}
                            >
                              {b.machineBrand}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="nodatatext">No Brands Available</div>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />

                {errors.machineBrandId && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.machineTypeId.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="machineTypeId" className="text-[11px]">
                  Select Machine Type
                </Label>
                <Controller
                  name="machineTypeId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="input-style">
                        <SelectValue placeholder="Select Machine Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-300">
                        {types && types.content?.length > 0 ? (
                          types?.content.map((t: any) => (
                            <SelectItem
                              className="select-style py-1"
                              key={t.id}
                              value={String(t.id)}
                            >
                              {t.machineType}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="nodatatext">No Types Available</div>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />

                {errors.machineTypeId && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.machineTypeId.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center mt-[10px] justify-between">
                <Label htmlFor="status" className="text-[11px] font-semibold">
                  Machine Active Status
                </Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      className="-mt-[2px]"
                      checked={field.value === "ACTIVE"}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? "ACTIVE" : "INACTIVE")
                      }
                    />
                  )}
                />
              </div>
            </div>

            <div>
              {apiError && (
                <p className="mt-1 text-[11px] text-red">{apiError}</p>
              )}
            </div>
            <DialogFooter className="pt-[14px]">
              <Button
                type="button"
                variant="outline"
                className="text-[11px] h-[32px] w-[70px]"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="text-[11px] h-[32px] w-[70px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Spinner
                    size="w-5 h-5"
                    color="border-white"
                    borderSize="border-2"
                  />
                ) : isEdit ? (
                  "Update"
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddMachineDialog;
