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
import {
  useAddBuildingMutation,
  useEditBuildingMutation,
} from "@/api/building";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useBranchesQuery } from "@/api/branch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";

const buildingSchema = z.object({
  buildingName: z.string().min(1, "Building name is required"),
  branchId: z.string().min(1, "Branch is required"),
});

type BuildingFormData = z.infer<typeof buildingSchema>;

interface AddBuildingDialogProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  buildingData?: any;
  refetch: () => void;
}

const AddBuildingDialog: React.FC<AddBuildingDialogProps> = ({
  open,
  onClose,
  isEdit,
  buildingData,
  refetch,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<BuildingFormData>({
    resolver: zodResolver(buildingSchema),
  });
  const { companyId } = useContext(AuthContext);
  const [apiError, setApiError] = useState<string | null>(null);
  const addBuildingMutation = useAddBuildingMutation(setApiError);
  const editBuildingMutation = useEditBuildingMutation(setApiError);
  const pageSize = 1000000;
  const { data: branches, isLoading } = useBranchesQuery(
    0,
    pageSize,
    companyId
  );

  useEffect(() => {
    if (open) {
      if (isEdit && buildingData) {
        reset({
          buildingName: buildingData.buildingName || "",
          branchId: buildingData.branch?.id
            ? String(buildingData.branch.id)
            : "",
        });
      } else {
        reset({
          buildingName: "",
          branchId: "",
        });
      }
    }
  }, [isEdit, buildingData, reset, open]);

  const onSubmit = (data: BuildingFormData) => {
    let payload: any = {
      buildingName: data.buildingName,
      branch: { id: Number(data.branchId) },
    };

    if (isEdit && buildingData?.id) {
      payload = { ...payload, id: buildingData.id };
      editBuildingMutation.mutate(
        { id: buildingData.id, buildingData: payload },
        {
          onSuccess: () => {
            reset();
            onClose();
            refetch?.();
          },
        }
      );
    } else {
      addBuildingMutation.mutate(payload, {
        onSuccess: () => {
          reset();
          onClose();
          refetch?.();
        },
      });
    }
  };
  const isSubmitting =
    isEdit && buildingData?.id
      ? editBuildingMutation.isPending
      : addBuildingMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-white px-[20px] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? "Edit Building" : "Add New Building"}
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
              <Label htmlFor="branchId" className="text-[11px]">
                Select Branch
              </Label>
              <Controller
                name="branchId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className=" input-style">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-300">
                      {branches && branches.content?.length > 0 ? (
                        branches?.content.map((b: any) => (
                          <SelectItem
                            className="select-style py-1"
                            key={b.id}
                            value={String(b.id)}
                          >
                            {b.branchName}
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
                <p className="mt-1 text-[11px]text-red">
                  {errors.branchId.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="branchName" className="text-[11px]">
                Building Name
              </Label>
              <Input
                id="buildingName"
                {...register("buildingName")}
                className="input-style h-[50px]"
                placeholder="Enter building name"
              />
              {errors.buildingName && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.buildingName.message}
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

export default AddBuildingDialog;
