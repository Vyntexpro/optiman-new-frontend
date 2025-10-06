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
import { useAddCompanyMutation, useEditCompanyMutation } from "@/api/company";
import { useEffect, useState } from "react";

const companySchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  personName: z.string().min(1, "Person name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  country: z.string().min(1, "Country is required"),
  phoneNo: z
    .string()
    .nonempty("Phone number is required")
    .regex(/^\d+$/, "Only numeric numbers should be entered"),
  mobileOne: z
    .string()
    .nonempty("Mobile number is required")
    .regex(/^\d+$/, "Only numeric numbers should be entered"),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface AddCompanyDialogProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  companyData?: any;
}

const AddCompanyDialog: React.FC<AddCompanyDialogProps> = ({
  open,
  onClose,
  isEdit,
  companyData,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
  });
  const [apiError, setApiError] = useState<string | null>(null);
  const addCompanyMutation = useAddCompanyMutation(setApiError);
  const editCompanyMutation = useEditCompanyMutation(setApiError);

  useEffect(() => {
    if (open) {
      if (isEdit && companyData) {
        reset(companyData);
      } else {
        reset({
          companyName: "",
          personName: "",
          email: "",
          address: "",
          country: "",
          phoneNo: "",
          mobileOne: "",
        });
      }
    }
  }, [isEdit, companyData, reset, open]);

  const onSubmit = (data: CompanyFormData) => {
    if (isEdit && companyData?.id) {
      editCompanyMutation.mutate(
        { id: companyData.id, companyData: data },
        {
          onSuccess: () => {
            reset();
            onClose();
          },
        }
      );
    } else {
      addCompanyMutation.mutate(data, {
        onSuccess: () => {
          reset();
          onClose();
        },
      });
    }
  };
  const isSubmitting =
    isEdit && companyData?.id
      ? editCompanyMutation.isPending
      : addCompanyMutation.isPending;
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-white px-[20px] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? "Edit Company" : "Add New Company"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName" className="text-[11px]">
                Company Name
              </Label>
              <Input
                id="companyName"
                {...register("companyName")}
                className="input-style"
                placeholder="Enter company name"
              />
              {errors.companyName && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.companyName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="personName" className="text-[11px]">
                Person Name
              </Label>
              <Input
                id="personName"
                {...register("personName")}
                className="input-style h-[50px]"
                placeholder="Enter person name"
              />
              {errors.personName && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.personName.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="text-[11px]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="input-style"
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="address" className="text-[11px]">
                Address
              </Label>
              <Input
                id="address"
                {...register("address")}
                className="input-style h-[50px]"
                placeholder="Enter address"
              />
              {errors.address && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.address.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country" className="text-[11px]">
                Country
              </Label>
              <Input
                id="country"
                {...register("country")}
                className="input-style h-[50px]"
                placeholder="Enter country"
              />
              {errors.country && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.country.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="phoneNo" className="text-[11px]">
                Phone No
              </Label>
              <Input
                id="phoneNo"
                {...register("phoneNo")}
                className="input-style h-[50px]"
                placeholder="Enter phone number"
              />
              {errors.phoneNo && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.phoneNo.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mobileOne" className="text-[11px]">
                Mobile No
              </Label>
              <Input
                id="mobileOne"
                {...register("mobileOne")}
                className="input-style h-[50px]"
                placeholder="Enter mobile number"
              />
              {errors.mobileOne && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.mobileOne.message}
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
              disabled={addCompanyMutation.isPending}
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

export default AddCompanyDialog;
