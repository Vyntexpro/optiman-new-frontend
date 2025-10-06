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
import { useAddRowMutation, useEditRowMutation } from "@/api/row";
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

const rowSchema = z.object({
  rowName: z.string().min(1, "Row name is required"),
  branchId: z.string().min(1, "Branch is required"),
  hallId: z.string().min(1, "Hall is required"),
  buildingId: z.string().min(1, "Building is required"),
  floorId: z.string().min(1, "Floor is required"),
});

type RowFormData = z.infer<typeof rowSchema>;

interface AddRowDialogProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  rowData?: any;
  refetch: () => void;
}

const AddRowDialog: React.FC<AddRowDialogProps> = ({
  open,
  onClose,
  isEdit,
  rowData,
  refetch,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
  } = useForm<RowFormData>({
    resolver: zodResolver(rowSchema),
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
  const [apiError, setApiError] = useState<string | null>(null);
  const addRowMutation = useAddRowMutation(setApiError);
  const editRowMutation = useEditRowMutation(setApiError);
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
  const { data: floors, isLoading } = useFloorsQuery(
    0,
    pageSize,
    companyId,
    branchId,
    buildingId
  );
  useEffect(() => {
    if (open) {
      if (isEdit && rowData) {
        reset({
          rowName: rowData.rowName || "",
          hallId: rowData.hall?.id ? String(rowData.hall.id) : "",
          buildingId: rowData.hall?.floor?.building?.id
            ? String(rowData.hall?.floor?.building.id)
            : "",
          floorId: rowData.hall?.floor?.id
            ? String(rowData.hall?.floor.id)
            : "",
          branchId: rowData.hall?.floor?.building?.branch?.id
            ? String(rowData.hall?.floor?.building?.branch?.id)
            : "",
        });
      } else {
        reset({
          rowName: "",
          branchId: "",
          hallId: "",
          buildingId: "",
          floorId: "",
        });
      }
    }
  }, [isEdit, rowData, reset, open]);

  const onSubmit = (data: RowFormData) => {
    let payload: any = {
      rowName: data.rowName,
      hall: { id: Number(data.hallId) },
    };

    if (isEdit && rowData?.id) {
      payload = { ...payload, id: rowData.id };
      editRowMutation.mutate(
        { id: rowData.id, rowData: payload },
        {
          onSuccess: () => {
            reset();
            onClose();
            refetch?.();
          },
        }
      );
    } else {
      addRowMutation.mutate(payload, {
        onSuccess: () => {
          reset();
          onClose();
          refetch?.();
        },
      });
    }
  };
  const isSubmitting =
    isEdit && rowData?.id
      ? editRowMutation.isPending
      : addRowMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-white px-[20px] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? "Edit Row" : "Add New Row"}
          </DialogTitle>
        </DialogHeader>
        {isPending ? (
          <div className="flex items-center justify-center py-[120px]">
            <Spinner
              size="w-10 h-10"
              color="border-primary"
              borderSize="border-4"
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
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
                        <div className="nodatatext">No Branches Available</div>
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
                          <div className="nodatatext">No Floors Available</div>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-[50px] input-style">
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
              <Label htmlFor="rowName" className="text-[11px]">
                Row Name
              </Label>
              <Input
                id="rowName"
                {...register("rowName")}
                className="input-style h-[50px]"
                placeholder="Enter row name"
              />
              {errors.rowName && (
                <p className="mt-1 text-[11px]text-red">
                  {errors.rowName.message}
                </p>
              )}
            </div>
            <div>
              {" "}
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

export default AddRowDialog;
