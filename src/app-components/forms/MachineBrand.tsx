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
import { useAddBrandMutation, useEditBrandMutation } from "@/api/machineBrand";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";

const brandSchema = z.object({
  machineBrand: z.string().min(1, "Brand name is required"),
});

type BrandFormData = z.infer<typeof brandSchema>;

interface AddBrandDialogProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  brandData?: any;
  refetch: () => void;
}

const AddBrandDialog: React.FC<AddBrandDialogProps> = ({
  open,
  onClose,
  isEdit,
  brandData,
  refetch,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
  });
  const { companyId } = useContext(AuthContext);
  const [apiError, setApiError] = useState<string | null>(null);
  const addBrandMutation = useAddBrandMutation(setApiError);
  const editBrandMutation = useEditBrandMutation(setApiError);
  useEffect(() => {
    if (open) {
      if (isEdit && brandData) {
        reset(brandData);
      } else {
        reset({
          machineBrand: "",
        });
      }
    }
  }, [isEdit, brandData, reset, open]);

  const onSubmit = (data: BrandFormData) => {
    const payload = {
      machineBrand: data.machineBrand,
      company: { id: companyId },
    };

    if (isEdit && brandData?.id) {
      editBrandMutation.mutate(
        { id: brandData.id, brandData: payload },
        {
          onSuccess: () => {
            reset();
            onClose();
            refetch?.();
          },
        }
      );
    } else {
      addBrandMutation.mutate(payload, {
        onSuccess: () => {
          reset();
          onClose();
          refetch?.();
        },
      });
    }
  };
  const isSubmitting =
    isEdit && brandData?.id
      ? editBrandMutation.isPending
      : addBrandMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-white px-[20px] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? "Edit Brand" : "Add New Brand"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-[10px]">
          <div>
            <Label htmlFor="machineBrand" className="text-[11px]">
              Brand Name
            </Label>
            <Input
              id="machineBrand"
              {...register("machineBrand")}
              className="input-style"
              placeholder="Enter brand name"
            />
            {errors.machineBrand && (
              <p className="mt-1 text-[11px] text-red">
                {errors.machineBrand.message}
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

export default AddBrandDialog;
