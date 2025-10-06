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
import { useAddUserMutation, useEditUserMutation } from "@/api/user";
import { useCompaniesQuery } from "@/api/company";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";
const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  userName: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  companyId: z.string().min(1, "Company is required"),
  role: z.string().min(1, " User role is required"),
});
const editUserSchema = userSchema.omit({ password: true });

type UserFormData = z.infer<typeof userSchema>;

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  userData?: any;
  refetch: () => void;
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({
  open,
  onClose,
  isEdit,
  userData,
  refetch,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(isEdit ? editUserSchema : userSchema),
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const addUserMutation = useAddUserMutation(setApiError);
  const editUserMutation = useEditUserMutation(setApiError);
  const { data: companies, isLoading } = useCompaniesQuery();

  useEffect(() => {
    if (open) {
      if (isEdit && userData) {
        reset({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          userName: userData.userName || "",
          email: userData.email || "",
          password: userData.password || "",
          role: userData.role?.name || "",
          companyId: userData.company?.id ? String(userData.company.id) : "",
        });
      } else {
        reset({
          firstName: "",
          lastName: "",
          userName: "",
          email: "",
          password: "",
          role: "",
          companyId: "",
        });
      }
    }
  }, [isEdit, userData, reset, open]);

  const onSubmit = (data: UserFormData) => {
    const payload: any = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      company: { id: Number(data.companyId) },
    };

    if (isEdit) {
      payload.username = data.userName;
      editUserMutation.mutate(
        { id: userData?.id, userData: payload },
        {
          onSuccess: () => {
            reset();
            onClose();
            refetch();
          },
        }
      );
    } else {
      payload.userName = data.userName;
      payload.password = data.password;
      addUserMutation.mutate(payload, {
        onSuccess: () => {
          reset();
          onClose();
          refetch();
        },
      });
    }
  };
  const isSubmitting =
    isEdit && userData?.id
      ? editUserMutation.isPending
      : addUserMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-white px-[20px] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? "Edit User" : "Add New User"}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-[11px]">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  className="input-style"
                  placeholder="Enter First Name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName" className="text-[11px]">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  className="input-style"
                  placeholder="Enter Last Name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userName" className="text-[11px]">
                  Username
                </Label>
                <Input
                  id="userName"
                  {...register("userName")}
                  className="input-style"
                  placeholder="Enter Username"
                />
                {errors.userName && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.userName.message}
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
                  placeholder="Enter Email"
                />
                {errors.email && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {!isEdit && (
                <div className="relative">
                  <Label htmlFor="password" className="text-[11px]">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className="input-style relative"
                    placeholder="Enter Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-10 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  {errors.password && (
                    <p className="mt-1 text-[11px] text-red">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="role" className="text-[11px]">
                  Select Role
                </Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="input-style">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-300">
                        <SelectItem
                          value="ROLE_ADMIN"
                          className="select-style py-1"
                        >
                          Admin
                        </SelectItem>
                        <SelectItem
                          value="ROLE_SUBADMIN"
                          className="select-style py-1"
                        >
                          Sub Admin
                        </SelectItem>
                        <SelectItem
                          value="ROLE_SUPERVISOR"
                          className="select-style py-1"
                        >
                          Supervisor
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.role.message}
                  </p>
                )}
              </div>
              {!isEdit && (
                <div>
                  <Label htmlFor="companyId" className="text-[11px]">
                    Select Company
                  </Label>
                  <Controller
                    name="companyId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="input-style">
                          <SelectValue placeholder="Select Company" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-300">
                          {companies && companies.length > 0 ? (
                            companies?.map((c: any) => (
                              <SelectItem
                                className="select-style py-1"
                                key={c.id}
                                value={String(c.id)}
                              >
                                {c.companyName}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="nodatatext">
                              No Companies Available
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.companyId && (
                    <p className="mt-1 text-[11px] text-red">
                      {errors.companyId.message}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div>
              {" "}
              {apiError && (
                <p className="mt-1 text-[11px] text-red">{apiError}</p>
              )}
            </div>
            <DialogFooter className="pt-[20px]">
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

export default AddUserDialog;
