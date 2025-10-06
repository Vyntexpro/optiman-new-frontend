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
  useAddCustomerMutation,
  useEditCustomerMutation,
} from "@/api/customer";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";

const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  contact: z
    .string()
    .nonempty("Contact is required")
    .regex(/^\d+$/, "Only numeric numbers should be entered"),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface AddCustomerDialogProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  customerData?: any;
  refetch: () => void;
}

const AddCustomerDialog: React.FC<AddCustomerDialogProps> = ({
  open,
  onClose,
  isEdit,
  customerData,
  refetch,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });
  const { companyId } = useContext(AuthContext);
  const [apiError, setApiError] = useState<string | null>(null);
  const addCustomerMutation = useAddCustomerMutation(setApiError);
  const editCustomerMutation = useEditCustomerMutation(setApiError);

  useEffect(() => {
    if (open) {
      if (isEdit && customerData) {
        reset({
          ...customerData,
          companyId: customerData.company?.id,
        });
      } else {
        reset({
          name: "",
          email: "",
          address: "",
          contact: "",
        });
      }
    }
  }, [isEdit, customerData, reset, open]);

  const onSubmit = (data: CustomerFormData) => {
    const payload: any = {
      ...data,
      company: { id: companyId },
    };

    if (isEdit && customerData?.id) {
      payload.createdAt = customerData.createdAt ?? new Date().toISOString();

      editCustomerMutation.mutate(
        { id: customerData.id, customerData: payload },
        {
          onSuccess: () => {
            reset();
            onClose();
            refetch?.();
          },
        }
      );
    } else {
      addCustomerMutation.mutate(payload, {
        onSuccess: () => {
          reset();
          onClose();
          refetch?.();
        },
      });
    }
  };
  const isSubmitting =
    isEdit && customerData?.id
      ? editCustomerMutation.isPending
      : addCustomerMutation.isPending;
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-white px-[20px] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? "Edit Customer" : "Add New Customer"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-[11px]">
                Customer Name
              </Label>
              <Input
                id="name"
                {...register("name")}
                className="input-style"
                placeholder="Enter customer name"
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="email" className="text-[11px]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="input-style"
                placeholder="Enter customer email"
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="address" className="text-[11px]">
                Address
              </Label>
              <Input
                id="address"
                {...register("address")}
                className="input-style"
                placeholder="Enter customer address"
              />
              {errors.address && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.address.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="contact" className="text-[11px]">
                Contact
              </Label>
              <Input
                id="contact"
                {...register("contact")}
                className="input-style"
                placeholder="Enter customer contact"
              />
              {errors.contact && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.contact.message}
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
              disabled={addCustomerMutation.isPending}
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

export default AddCustomerDialog;
