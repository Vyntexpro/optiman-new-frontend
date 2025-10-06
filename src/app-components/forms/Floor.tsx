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
import { useAddFloorMutation, useEditFloorMutation } from "@/api/floor";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useBuildingsQuery } from "@/api/building";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";
import { useBranchesQuery } from "@/api/branch";
import InputFieldSkeleton from "../common/InputFieldSkeleton";

const floorSchema = z.object({
  floorName: z.string().min(1, "Floor name is required"),
  branchId: z.string().min(1, "Branch is required"),
  buildingId: z.string().min(1, "Building is required"),
});

type FloorFormData = z.infer<typeof floorSchema>;

interface AddFloorDialogProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  floorData?: any;
  refetch: () => void;
}

const AddFloorDialog: React.FC<AddFloorDialogProps> = ({
  open,
  onClose,
  isEdit,
  floorData,
  refetch,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
  } = useForm<FloorFormData>({
    resolver: zodResolver(floorSchema),
  });
  const { companyId } = useContext(AuthContext);
  const [apiError, setApiError] = useState<string | null>(null);
  const branchId = isNaN(Number(watch("branchId")))
    ? undefined
    : Number(watch("branchId"));
  const addFloorMutation = useAddFloorMutation(setApiError);
  const editFloorMutation = useEditFloorMutation(setApiError);
  const pageSize = 1000000;
  const { data: branches, isLoading } = useBranchesQuery(
    0,
    pageSize,
    companyId
  );
  const { data: buildings, isPending } = useBuildingsQuery(
    0,
    pageSize,
    companyId,
    branchId
  );

  useEffect(() => {
    if (open) {
      if (isEdit && floorData) {
        reset({
          floorName: floorData.floorName || "",
          buildingId: floorData.building?.id
            ? String(floorData.building.id)
            : "",
          branchId: floorData.building?.branch?.id
            ? String(floorData.building.branch.id)
            : "",
        });
      } else {
        reset({
          floorName: "",
          branchId: "",
          buildingId: "",
        });
      }
    }
  }, [isEdit, floorData, reset, open]);

  const onSubmit = (data: FloorFormData) => {
    let payload: any = {
      floorName: data.floorName,
      building: { id: Number(data.buildingId) },
    };

    if (isEdit && floorData?.id) {
      payload = { ...payload, id: floorData.id };
      editFloorMutation.mutate(
        { id: floorData.id, floorData: payload },
        {
          onSuccess: () => {
            reset();
            onClose();
            refetch?.();
          },
        }
      );
    } else {
      addFloorMutation.mutate(payload, {
        onSuccess: () => {
          reset();
          onClose();
          refetch?.();
        },
      });
    }
  };
  const isSubmitting =
    isEdit && floorData?.id
      ? editFloorMutation.isPending
      : addFloorMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-white px-[20px] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? "Edit Floor" : "Add New Floor"}
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
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
                    <SelectTrigger className=" input-style bg-white">
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
              <Label htmlFor="branchId" className="text-[11px]">
                Select Building
              </Label>
              {isPending ? (
                <InputFieldSkeleton />
              ) : (
                <Controller
                  name="buildingId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-[50px] input-style">
                        <SelectValue placeholder="Select Building" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-300">
                        {buildings && buildings.content?.length > 0 ? (
                          buildings?.content.map((b: any) => (
                            <SelectItem
                              className="select-style py-1"
                              key={b.id}
                              value={String(b.id)}
                            >
                              {b.buildingName}
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
              <Label htmlFor="floorName" className="text-[11px]">
                Floor Name
              </Label>
              <Input
                id="floorName"
                {...register("floorName")}
                className="input-style h-[50px]"
                placeholder="Enter floor name"
              />
              {errors.floorName && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.floorName.message}
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

export default AddFloorDialog;
