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
import { useAddTypeMutation, useEditTypeMutation } from "@/api/machineType";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";

const typeSchema = z.object({
  machineType: z.string().min(1, "Type name is required"),
});

type TypeFormData = z.infer<typeof typeSchema>;

interface AddTypeDialogProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  typeData?: any;
  refetch: () => void;
}

const AddTypeDialog: React.FC<AddTypeDialogProps> = ({
  open,
  onClose,
  isEdit,
  typeData,
  refetch,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TypeFormData>({
    resolver: zodResolver(typeSchema),
  });
  const { companyId } = useContext(AuthContext);
  const [apiError, setApiError] = useState<string | null>(null);
  const addTypeMutation = useAddTypeMutation(setApiError);
  const editTypeMutation = useEditTypeMutation(setApiError);
  useEffect(() => {
    if (open) {
      if (isEdit && typeData) {
        reset(typeData);
      } else {
        reset({
          machineType: "",
        });
      }
    }
  }, [isEdit, typeData, reset, open]);

  const onSubmit = (data: TypeFormData) => {
    const payload = {
      machineType: data.machineType,
      company: { id: companyId },
    };

    if (isEdit && typeData?.id) {
      editTypeMutation.mutate(
        { id: typeData.id, typeData: payload },
        {
          onSuccess: () => {
            reset();
            onClose();
            refetch?.();
          },
        }
      );
    } else {
      addTypeMutation.mutate(payload, {
        onSuccess: () => {
          reset();
          onClose();
          refetch?.();
        },
      });
    }
  };
  const isSubmitting =
    isEdit && typeData?.id
      ? editTypeMutation.isPending
      : addTypeMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-white px-[20px] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? "Edit Type" : "Add New Type"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <div>
            <Label htmlFor="machineType" className="text-[11px]">
              Type Name
            </Label>
            <Input
              id="machineType"
              {...register("machineType")}
              className="input-style "
              placeholder="Enter type name"
            />
            {errors.machineType && (
              <p className="mt-1 text-[11px] text-red">
                {errors.machineType.message}
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
      </DialogContent>
    </Dialog>
  );
};

export default AddTypeDialog;
