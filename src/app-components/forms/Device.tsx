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
import { useAddUserMutation, useEditUserMutation } from "@/api/device";
import { useCompaniesQuery } from "@/api/company";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";
const deviceSchema = z.object({
  deviceName: z.string().min(1, "Device name is required"),
  userName: z.string().min(1, "MAC address is required"),
  companyId: z.string().min(1, "Company is required"),
});

type DeviceFormData = z.infer<typeof deviceSchema>;

interface AddDeviceDialogProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  deviceData?: any;
  refetch: () => void;
}

const AddDeviceDialog: React.FC<AddDeviceDialogProps> = ({
  open,
  onClose,
  isEdit,
  deviceData,
  refetch,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const addDeviceMutation = useAddUserMutation(setApiError);
  const editDeviceMutation = useEditUserMutation(setApiError);
  const { data: companies, isLoading } = useCompaniesQuery();

  useEffect(() => {
    if (open) {
      if (isEdit && deviceData) {
        reset({
          deviceName: deviceData.firstName || "",
          userName: deviceData.userName || "",
          companyId: deviceData.company?.id
            ? String(deviceData.company.id)
            : "",
        });
      } else {
        reset({
          deviceName: "",
          userName: "",
          companyId: "",
        });
      }
    }
  }, [isEdit, deviceData, reset, open]);

  const onSubmit = (data: DeviceFormData) => {
    const basePayload = {
      userName: data.userName,
      password: import.meta.env.VITE_DEVICE_DEFAULT_PASSWORD,
      company: { id: Number(data.companyId) },
    };

    if (isEdit && deviceData?.id) {
      const payload = {
        ...basePayload,
        firstName: data.deviceName,
        username: data.userName,
        role: "ROLE_DEVICE",
      };

      editDeviceMutation.mutate(
        { id: deviceData.id, deviceData: payload },
        {
          onSuccess: () => {
            reset();
            onClose();
            refetch();
          },
        }
      );
    } else {
      const payload = {
        ...basePayload,
        deviceName: data.deviceName,
      };

      addDeviceMutation.mutate(payload, {
        onSuccess: () => {
          reset();
          onClose();
          refetch();
        },
      });
    }
  };

  const isSubmitting =
    isEdit && deviceData?.id
      ? editDeviceMutation.isPending
      : addDeviceMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-white px-[20px] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? "Edit Device" : "Add New Device"}
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
              <Label htmlFor="deviceName" className="text-[11px]">
                Device Name
              </Label>
              <Input
                id="deviceName"
                {...register("deviceName")}
                className="input-style"
                placeholder="Enter device name"
              />
              {errors.deviceName && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.deviceName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="userName" className="text-[11px]">
                MAC Address
              </Label>
              <Input
                id="userName"
                {...register("userName")}
                className="input-style"
                placeholder="Enter MAC address"
              />
              {errors.userName && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.userName.message}
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
                    <Select onValueChange={field.onChange} value={field.value}>
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

export default AddDeviceDialog;
