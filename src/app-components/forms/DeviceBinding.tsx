import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Spinner from "../common/Spinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMachinesQuery } from "@/api/machine";
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
import { TbDeviceGamepad } from "react-icons/tb";
import ReactSelect from "react-select";
import { Controller } from "react-hook-form";
import { useBuildingsQuery } from "@/api/building";
import { useHallsQuery } from "@/api/hall";
import InputFieldSkeleton from "../common/InputFieldSkeleton";
import { useBranchesQuery } from "@/api/branch";
import { useRowsQuery } from "@/api/row";
import { useUsersQuery } from "@/api/device";
import { components } from "react-select";
import { useAddDeviceMutation, useEditDeviceMutation } from "@/api/bindDevice";
const deviceSchema = z.object({
  branchId: z.string().min(1, "Branch is required"),
  hallId: z.string().min(1, "Hall is required"),
  buildingId: z.string().min(1, "Building is required"),
  floorId: z.string().min(1, "Floor is required"),
  rowId: z.string().min(1, "Row is required"),
  machineId: z.string().min(1, "Machine is required"),
  deviceId: z
    .object({
      value: z.union([z.string(), z.number()]),
      label: z.string(),
      label2: z.string(),
    })
    .nullable()
    .refine((val) => val !== null, {
      message: "Device is required",
    }),
});

type DeviceFormData = z.infer<typeof deviceSchema>;

interface AddDeviceDialogProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  deviceData?: any;
  refetch: () => void;
}

const DeviceBindingDialog: React.FC<AddDeviceDialogProps> = ({
  open,
  onClose,
  isEdit,
  deviceData,
  refetch,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
  } = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
  });
  const pageSize = 1000000;
  const search = undefined;
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
  const rowId = isNaN(Number(watch("rowId")))
    ? undefined
    : Number(watch("rowId"));
  const machineId = isNaN(Number(watch("machineId")))
    ? undefined
    : Number(watch("machineId"));
  const [apiError, setApiError] = useState<string | null>(null);
  const addDeviceMutation = useAddDeviceMutation(setApiError);
  const editDeviceMutation = useEditDeviceMutation(setApiError);
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

  const { data: machines, isLoading: machinesLoading } = useMachinesQuery(
    0,
    pageSize,
    companyId,
    branchId,
    buildingId,
    floorId,
    hallId,
    rowId
  );
  const { data: users, isLoading: usersLoading } = useUsersQuery(
    0,
    pageSize,
    search,
    "devices"
  );
  const devicesOptions =
    users?.content?.map((user: any) => ({
      value: user.id,
      label: user.firstName,
      label2: user.userName,
    })) || [];

  const customOption = (props: any) => {
    const { data, innerRef, innerProps } = props;

    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="px-2 py-2 hover:bg-slate-200/50 cursor-pointer flex items-center gap-3"
      >
        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-200">
          <TbDeviceGamepad size={14} className="text-primary" />
        </div>
        <div className="flex flex-col leading-tight">
          <p className="font-medium text-[10px]">{data.label}</p>
          <p className="text-gray-500 text-[9px]">{data.label2}</p>
        </div>
      </div>
    );
  };
  const CustomNoOptionsMessage = (props: any) => (
    <components.NoOptionsMessage {...props}>
      <span className="nodatatext">No Devices Available</span>
    </components.NoOptionsMessage>
  );
  const filterOption = (option: any, rawInput: string) => {
    const search = rawInput.toLowerCase();
    return (
      option.data.label.toLowerCase().includes(search) ||
      option.data.label2?.toLowerCase().includes(search)
    );
  };
  useEffect(() => {
    if (open) {
      if (isEdit && deviceData) {
        const selectedDevice = devicesOptions.find(
          (d) => d.label2 === deviceData.uid
        );
        reset({
          rowId: deviceData.machine?.row?.id
            ? String(deviceData.machine?.row.id)
            : "",
          hallId: deviceData.machine?.row?.hall?.id
            ? String(deviceData.machine?.row.hall.id)
            : "",
          buildingId: deviceData.machine?.row?.hall?.floor?.building?.id
            ? String(deviceData.machine?.row?.hall?.floor?.building.id)
            : "",
          floorId: deviceData.machine?.row?.hall?.floor?.id
            ? String(deviceData.machine?.row?.hall?.floor.id)
            : "",
          branchId: deviceData.machine?.row?.hall?.floor?.building?.branch?.id
            ? String(deviceData.machine?.row?.hall?.floor?.building?.branch?.id)
            : "",
          machineId: deviceData.machine?.id
            ? String(deviceData.machine?.id)
            : "",
          deviceId: selectedDevice || null,
        });
      } else {
        reset({
          branchId: "",
          hallId: "",
          buildingId: "",
          machineId: "",
          floorId: "",
          rowId: "",
          deviceId: null,
        });
      }
    }
  }, [isEdit, deviceData, reset, open]);

  const onSubmit = (data: DeviceFormData) => {
    let payload: any = {
      machine: { id: Number(data.machineId) },
      hall: { id: Number(data.hallId) },
      displayName: data.deviceId.label,
      uid: data.deviceId.label2,
    };

    if (isEdit && deviceData?.id) {
      payload = { ...payload, id: deviceData.id };
      editDeviceMutation.mutate(
        { id: deviceData.id, deviceData: payload },
        {
          onSuccess: () => {
            reset();
            onClose();
            refetch?.();
          },
        }
      );
    } else {
      addDeviceMutation.mutate(payload, {
        onSuccess: () => {
          reset();
          onClose();
          refetch?.();
        },
      });
    }
  };
  const isSubmitting =
    isEdit && deviceData?.id
      ? editDeviceMutation.isPending
      : addDeviceMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-white px-[20px] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? "Edit Binding" : "Bind Device"}
          </DialogTitle>
        </DialogHeader>
        {isPending && usersLoading ? (
          <div className="flex items-center justify-center py-[120px]">
            <Spinner
              size="w-10 h-10"
              color="border-primary"
              borderSize="border-4"
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          reset((prev) => ({ ...prev, machineId: "" }));
                        }}
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
                {" "}
                <Label htmlFor="machineId" className="text-[11px]">
                  Select Machine
                </Label>
                {machinesLoading ? (
                  <InputFieldSkeleton />
                ) : (
                  <Controller
                    name="machineId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="input-style">
                          <SelectValue placeholder="Select Machine" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-300">
                          {machines && machines.content?.length > 0 ? (
                            machines?.content.map((m: any) => (
                              <SelectItem
                                className="select-style py-1"
                                key={m.id}
                                value={String(m.id)}
                              >
                                {m.machineName}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="nodatatext">
                              No Machines Available
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
                {errors.machineId && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.machineId.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="deviceId" className="text-[11px]">
                {" "}
                Select Device
              </Label>
              <Controller
                name="deviceId"
                control={control}
                render={({ field }) => (
                  <ReactSelect
                    {...field}
                    options={devicesOptions}
                    filterOption={filterOption}
                    components={{
                      Option: customOption,
                      NoOptionsMessage: CustomNoOptionsMessage,
                    }}
                    closeMenuOnSelect={true}
                    className="mt-1"
                    placeholder="Select Device"
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        backgroundColor: "white",
                        cursor: "pointer",
                        boxShadow: "none",
                        fontSize: "11px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "7px",
                        padding: "2px 2px",
                        minHeight: "40px",
                        "&:hover": {
                          border: "1px solid #cbd5e1",
                        },
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: "#64748b",
                        fontSize: "10px",
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    }}
                  />
                )}
              />
              {errors.deviceId && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.deviceId.message}
                </p>
              )}
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

export default DeviceBindingDialog;
