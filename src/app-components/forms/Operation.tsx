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
  useAddOperationMutation,
  useEditOperationMutation,
} from "@/api/operation";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";
const operationSchema = z.object({
  operationName: z.string().min(1, "Operation name is required"),
  operationNo: z.string().min(1, "Operation number is required"),
  estimatedCost: z.coerce.number().min(1, "Cost is required"),
  estimatedTime: z.coerce.number().min(1, "Time is required"),
  costUnit: z.string().min(1, "Cost unit is required"),
});

type OperationFormData = z.infer<typeof operationSchema>;

interface AddOperationDialogProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  operationData?: any;
  refetch: () => void;
}

const AddOperationDialog: React.FC<AddOperationDialogProps> = ({
  open,
  onClose,
  isEdit,
  operationData,
  refetch,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<OperationFormData>({
    resolver: zodResolver(operationSchema),
  });
  const { companyId } = useContext(AuthContext);
  const [apiError, setApiError] = useState<string | null>(null);
  const addOperationMutation = useAddOperationMutation(setApiError);
  const editOperationMutation = useEditOperationMutation(setApiError);

  useEffect(() => {
    if (open) {
      if (isEdit && operationData) {
        reset({
          ...operationData,
          companyId: operationData.company?.id,
        });
      } else {
        reset({
          operationName: "",
          estimatedTime: null,
          estimatedCost: null,
          operationNo: "",
          costUnit: "",
        });
      }
    }
  }, [isEdit, operationData, reset, open]);

  const onSubmit = (data: OperationFormData) => {
    const payload: any = {
      ...data,
      company: { id: companyId },
    };

    if (isEdit && operationData?.id) {
      editOperationMutation.mutate(
        { id: operationData.id, operationData: payload },
        {
          onSuccess: () => {
            reset();
            onClose();
            refetch?.();
          },
        }
      );
    } else {
      addOperationMutation.mutate(payload, {
        onSuccess: () => {
          reset();
          onClose();
          refetch?.();
        },
      });
    }
  };
  const isSubmitting =
    isEdit && operationData?.id
      ? editOperationMutation.isPending
      : addOperationMutation.isPending;
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-white px-[20px] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? "Edit Operation" : "Add New Operation"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="operationName" className="text-[11px]">
                Operation Name
              </Label>
              <Input
                id="operationName"
                {...register("operationName")}
                className="input-style"
                placeholder="Enter operation name"
              />
              {errors.operationName && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.operationName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="operartionNo" className="text-[11px]">
                Operation No
              </Label>
              <Input
                id="operationNo"
                {...register("operationNo")}
                className="input-style"
                placeholder="Enter operation number"
              />
              {errors.operationNo && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.operationNo.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimatedTime" className="text-[11px]">
                Estimated Time (in seconds)
              </Label>
              <Input
                id="estimatedTime"
                type="number"
                {...register("estimatedTime")}
                className="input-style"
                placeholder="Enter operation address"
              />
              {errors.estimatedTime && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.estimatedTime.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="role" className="text-[11px]">
                Select Cost Unit
              </Label>
              <Controller
                name="costUnit"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="input-style">
                      <SelectValue placeholder="Select Cost Unit" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-300">
                      <SelectItem value="Bundle" className="select-style py-1">
                        Bundle
                      </SelectItem>
                      <SelectItem value="Unit" className="select-style py-1">
                        Unit
                      </SelectItem>
                      <SelectItem value="Dozen" className="select-style py-1">
                        Dozen
                      </SelectItem>
                      <SelectItem
                        value=" Half Dozen"
                        className="select-style py-1"
                      >
                        Half Dozen
                      </SelectItem>
                      <SelectItem value="10X" className="select-style py-1">
                        10X
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.costUnit && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.costUnit.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="address" className="text-[11px]">
                Estimated Cost
              </Label>
              <Input
                id="estimatedCost"
                type="number"
                {...register("estimatedCost")}
                className="input-style"
                placeholder="Enter estimated cost"
              />
              {errors.estimatedCost && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.estimatedCost.message}
                </p>
              )}
            </div>
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
              disabled={addOperationMutation.isPending}
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
      </DialogContent>
    </Dialog>
  );
};

export default AddOperationDialog;
