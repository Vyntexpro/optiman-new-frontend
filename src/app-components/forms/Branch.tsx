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
import { useAddBranchMutation, useEditBranchMutation } from "@/api/branch";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";

const branchSchema = z.object({
  branchName: z.string().min(1, "Branch name is required"),
  branchAddress: z.string().min(1, "Branch address is required"),
});

type BranchFormData = z.infer<typeof branchSchema>;

interface AddBranchDialogProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  branchData?: any;
  refetch: () => void;
}

const AddBranchDialog: React.FC<AddBranchDialogProps> = ({
  open,
  onClose,
  isEdit,
  branchData,
  refetch,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
  });
  const { companyId } = useContext(AuthContext);
  const [apiError, setApiError] = useState<string | null>(null);
  const addBranchMutation = useAddBranchMutation(setApiError);
  const editBranchMutation = useEditBranchMutation(setApiError);
  useEffect(() => {
    if (open) {
      if (isEdit && branchData) {
        reset(branchData);
      } else {
        reset({
          branchName: "",
          branchAddress: "",
        });
      }
    }
  }, [isEdit, branchData, reset, open]);

  const onSubmit = (data: BranchFormData) => {
    const payload = {
      ...data,
      company: { id: companyId },
    };

    if (isEdit && branchData?.id) {
      editBranchMutation.mutate(
        { id: branchData.id, branchData: payload },
        {
          onSuccess: () => {
            reset();
            onClose();
            refetch?.();
          },
        }
      );
    } else {
      addBranchMutation.mutate(payload, {
        onSuccess: () => {
          reset();
          onClose();
          refetch?.();
        },
      });
    }
  };
  const isSubmitting =
    isEdit && branchData?.id
      ? editBranchMutation.isPending
      : addBranchMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-white px-[20px] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? "Edit Branch" : "Add New Branch"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <div>
            <Label htmlFor="branchName" className="text-[11px]">
              Branch Name
            </Label>
            <Input
              id="branchName"
              {...register("branchName")}
              className="input-style"
              placeholder="Enter branch name"
            />
            {errors.branchName && (
              <p className="mt-1 text-[11px] text-red">
                {errors.branchName.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="branchAddress" className="text-[11px]">
              Branch Address
            </Label>
            <Input
              id="branchAddress"
              {...register("branchAddress")}
              className="input-style"
              placeholder="Enter branch address"
            />
            {errors.branchAddress && (
              <p className="mt-1 text-[11px] text-red">
                {errors.branchAddress.message}
              </p>
            )}
          </div>
          <div>
            {" "}
            {apiError && <p className="mt-1 text-sm text-red">{apiError}</p>}
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

export default AddBranchDialog;
