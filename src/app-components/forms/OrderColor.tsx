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
import { useAddColorMutation, useEditColorMutation } from "@/api/orderColor";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";

const colorSchema = z.object({
  orderColor: z.string().min(1, "Color name is required"),
});

type ColorFormData = z.infer<typeof colorSchema>;

interface AddSizeDialogProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  colorData?: any;
  refetch: () => void;
}

const AddOrderSizeDialog: React.FC<AddSizeDialogProps> = ({
  open,
  onClose,
  isEdit,
  colorData,
  refetch,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ColorFormData>({
    resolver: zodResolver(colorSchema),
  });
  const { companyId } = useContext(AuthContext);
  const [apiError, setApiError] = useState<string | null>(null);
  const addColorMutation = useAddColorMutation(setApiError);
  const editColorMutation = useEditColorMutation(setApiError);
  useEffect(() => {
    if (open) {
      if (isEdit && colorData) {
        reset(colorData);
      } else {
        reset({
          orderColor: "",
        });
      }
    }
  }, [isEdit, colorData, reset, open]);

  const onSubmit = (data: ColorFormData) => {
    const payload = {
      orderColor: data.orderColor,
      company: { id: companyId },
    };

    if (isEdit && colorData?.id) {
      editColorMutation.mutate(
        { id: colorData.id, colorData: payload },
        {
          onSuccess: () => {
            reset();
            onClose();
            refetch?.();
          },
        }
      );
    } else {
      addColorMutation.mutate(payload, {
        onSuccess: () => {
          reset();
          onClose();
          refetch?.();
        },
      });
    }
  };
  const isSubmitting =
    isEdit && colorData?.id
      ? editColorMutation.isPending
      : addColorMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-white px-[20px] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? "Edit Color" : "Add New Color"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <div>
            <Label htmlFor="orderColor" className="text-[11px]">
              Color Name
            </Label>
            <Input
              id="orderColor"
              {...register("orderColor")}
              className="input-style"
              placeholder="Enter color name"
            />
            {errors.orderColor && (
              <p className="mt-1 text-[11px] text-red">
                {errors.orderColor.message}
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
