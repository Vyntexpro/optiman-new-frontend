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
import { useAddSizeMutation, useEditSizeMutation } from "@/api/orderSize";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";

const sizeSchema = z.object({
  orderSize: z.string().min(1, "Size name is required"),
});

type SizeFormData = z.infer<typeof sizeSchema>;

interface AddSizeDialogProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  sizeData?: any;
  refetch: () => void;
}

const AddOrderSizeDialog: React.FC<AddSizeDialogProps> = ({
  open,
  onClose,
  isEdit,
  sizeData,
  refetch,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SizeFormData>({
    resolver: zodResolver(sizeSchema),
  });
  const { companyId } = useContext(AuthContext);
  const [apiError, setApiError] = useState<string | null>(null);
  const addTypeMutation = useAddSizeMutation(setApiError);
  const editTypeMutation = useEditSizeMutation(setApiError);
  useEffect(() => {
    if (open) {
      if (isEdit && sizeData) {
        reset(sizeData);
      } else {
        reset({
          orderSize: "",
        });
      }
    }
  }, [isEdit, sizeData, reset, open]);

  const onSubmit = (data: SizeFormData) => {
    const payload = {
      orderSize: data.orderSize,
      company: { id: companyId },
    };

    if (isEdit && sizeData?.id) {
      editTypeMutation.mutate(
        { id: sizeData.id, sizeData: payload },
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
    isEdit && sizeData?.id
      ? editTypeMutation.isPending
      : addTypeMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-white px-[20px] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? "Edit Size" : "Add New Size"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <div>
            <Label htmlFor="orderSize" className="text-[11px]">
              Size Name
            </Label>
            <Input
              id="orderSize"
              {...register("orderSize")}
              className="input-style"
              placeholder="Enter size name"
            />
            {errors.orderSize && (
              <p className="mt-1 text-[11px] text-red">
                {errors.orderSize.message}
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

export default AddOrderSizeDialog;
