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
import { Controller } from "react-hook-form";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";
import {
  useAddOperatorMutation,
  useEditOperatorMutation,
} from "@/api/operator";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";

const operatorSchema = z.object({
  operatorName: z.string().min(1, "Operator name is required"),
  cardTag: z.string().min(1, "Card UID is required"),
  autoExpiryDate: z.string().optional(),
  userSrNo: z.string().min(1, "Code is required"),
});

type OperatorFormData = z.infer<typeof operatorSchema>;

interface AddOperatorDialogProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  operatorData?: any;
  refetch: () => void;
}

const AddOperatorDialog: React.FC<AddOperatorDialogProps> = ({
  open,
  onClose,
  isEdit,
  operatorData,
  refetch,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<OperatorFormData>({
    resolver: zodResolver(operatorSchema),
  });
  const { companyId } = useContext(AuthContext);
  const [apiError, setApiError] = useState<string | null>(null);
  const addOperatorMutation = useAddOperatorMutation(setApiError);
  const editOperatorMutation = useEditOperatorMutation(setApiError);

  useEffect(() => {
    if (open) {
      if (isEdit && operatorData) {
        reset({
          ...operatorData,
          companyId: operatorData.company?.id,
        });
      } else {
        reset({
          operatorName: "",
          cardTag: "",
          autoExpiryDate: "",
          userSrNo: "",
        });
      }
    }
  }, [isEdit, operatorData, reset, open]);

  const onSubmit = (data: OperatorFormData) => {
    const payload: any = {
      ...data,
      company: { id: companyId },
    };

    if (isEdit && operatorData?.id) {
      editOperatorMutation.mutate(
        { id: operatorData.id, operatorData: payload },
        {
          onSuccess: () => {
            reset();
            onClose();
            refetch?.();
          },
        }
      );
    } else {
      addOperatorMutation.mutate(payload, {
        onSuccess: () => {
          reset();
          onClose();
          refetch?.();
        },
      });
    }
  };
  const isSubmitting =
    isEdit && operatorData?.id
      ? editOperatorMutation.isPending
      : addOperatorMutation.isPending;
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-white px-[20px] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? "Edit Operator" : "Add New Operator"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="operatorName" className="text-[11px]">
                Operator Name
              </Label>
              <Input
                id="operatorName"
                {...register("operatorName")}
                className="input-style"
                placeholder="Enter operator name"
              />
              {errors.operatorName && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.operatorName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="userSrNo" className="text-[11px]">
                Operator Code
              </Label>
              <Input
                id="userSrNo"
                {...register("userSrNo")}
                className="input-style"
                placeholder="Enter operator code"
              />
              {errors.userSrNo && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.userSrNo.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Controller
                control={control}
                name="autoExpiryDate"
                render={({ field }) => (
                  <div>
                    <Label htmlFor="autoExpiryDate" className="text-[11px]">
                      Auto Expiry Date (optiona)
                    </Label>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full h-[40px] border border-slate-300 flex items-center !text-slate-500 justify-start text-left text-[10px] mt-[2px] px-2 font-normal ${
                            !field.value && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className=" !h-2.5 !w-2.5" />
                          {field.value
                            ? format(new Date(field.value), "yyyy-MM-dd")
                            : "Select Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto text-[12px] p-0 bg-white"
                        align="start"
                      >
                        <DayPicker
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(d) => {
                            if (!d) return field.onChange("");
                            const localDate = new Date(d);
                            localDate.setHours(12, 33, 0, 0);
                            const formatted = format(
                              localDate,
                              "yyyy-MM-dd'T'HH:mm"
                            );
                            field.onChange(formatted);
                          }}
                          classNames={{
                            day_selected:
                              "!bg-primary !text-white rounded-full",
                            day_today: "border border-primary font-semibold",
                          }}
                        />
                      </PopoverContent>
                    </Popover>

                    {errors.autoExpiryDate && (
                      <p className="mt-1 text-[11px] text-red">
                        {errors.autoExpiryDate.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
            <div>
              <Label htmlFor="cardTag" className="text-[11px]">
                Card UID
              </Label>
              <Input
                id="cardTag"
                {...register("cardTag")}
                className="input-style"
                placeholder="Enter card UID"
              />
              {errors.cardTag && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.cardTag.message}
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
              disabled={addOperatorMutation.isPending}
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

export default AddOperatorDialog;
