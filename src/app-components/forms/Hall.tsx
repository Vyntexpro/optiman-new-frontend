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
import { useAddHallMutation, useEditHallMutation } from "@/api/hall";
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
import InputFieldSkeleton from "../common/InputFieldSkeleton";
import { useBranchesQuery } from "@/api/branch";

const floorSchema = z.object({
  hallName: z.string().min(1, "Hall name is required"),
  branchId: z.string().min(1, "Branch is required"),
  floorId: z.string().min(1, "Floor is required"),
  buildingId: z.string().min(1, "Building is required"),
});

type HallFormData = z.infer<typeof floorSchema>;

interface AddHallDialogProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  hallData?: any;
  refetch: () => void;
}

const AddHallDialog: React.FC<AddHallDialogProps> = ({
  open,
  onClose,
  isEdit,
  hallData,
  refetch,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
  } = useForm<HallFormData>({
    resolver: zodResolver(floorSchema),
  });
  const { companyId } = useContext(AuthContext);
  const branchId = isNaN(Number(watch("branchId")))
    ? undefined
    : Number(watch("branchId"));
  const buildingId = isNaN(Number(watch("buildingId")))
    ? undefined
    : Number(watch("buildingId"));
  const [apiError, setApiError] = useState<string | null>(null);
  const addHallMutation = useAddHallMutation(setApiError);
  const editHallMutation = useEditHallMutation(setApiError);
  const pageSize = 1000000;
  const { data: branches, isPending } = useBranchesQuery(
    0,
    pageSize,
    companyId
  );
  const { data: buildings, isFetching } = useBuildingsQuery(
    0,
    pageSize,
    companyId,
    branchId
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
      if (isEdit && hallData) {
        reset({
          hallName: hallData.hallName || "",
          floorId: hallData.floor?.id ? String(hallData.floor.id) : "",
          buildingId: hallData.floor?.building?.id
            ? String(hallData.floor.building.id)
            : "",
          branchId: hallData.floor?.building?.branch?.id
            ? String(hallData.floor.building.branch.id)
            : "",
        });
      } else {
        reset({
          hallName: "",
          floorId: "",
          branchId: "",
          buildingId: "",
        });
      }
    }
  }, [isEdit, hallData, reset, open]);

  const onSubmit = (data: HallFormData) => {
    let payload: any = {
      hallName: data.hallName,
      floor: { id: Number(data.floorId) },
    };

    if (isEdit && hallData?.id) {
      payload = { ...payload, id: hallData.id };
      editHallMutation.mutate(
        { id: hallData.id, hallData: payload },
        {
          onSuccess: () => {
            reset();
            onClose();
            refetch?.();
          },
        }
      );
    } else {
      addHallMutation.mutate(payload, {
        onSuccess: () => {
          reset();
          onClose();
          refetch?.();
        },
      });
    }
  };
  const isSubmitting =
    isEdit && hallData?.id
      ? editHallMutation.isPending
      : addHallMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-white px-[20px] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? "Edit Hall" : "Add New Hall"}
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
              {isFetching ? (
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
                      <SelectContent className="bg-white border-slate-300">
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
              <Label className="text-[11px]">Select Floor</Label>
              {isLoading ? (
                <InputFieldSkeleton />
              ) : (
                <Controller
                  name="floorId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="input-style">
                        <SelectValue placeholder="Select Floor" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-300">
                        {floors && floors.content?.length > 0 ? (
                          floors?.content.map((f: any) => (
                            <SelectItem
                              key={f.id}
                              value={String(f.id)}
                              className="select-style py-1"
                            >
                              {f.floorName}
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
                <p className="mt-1 text-[11px]  text-red">
                  {errors.floorId.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="hallName" className="text-[11px]">
                Hall Name
              </Label>
              <Input
                id="floorName"
                {...register("hallName")}
                className="input-style"
                placeholder="Enter hall name"
              />
              {errors.hallName && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.hallName.message}
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

export default AddHallDialog;
