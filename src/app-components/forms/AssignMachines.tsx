import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Spinner from "../common/Spinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import ReactSelect from "react-select";
import { Controller } from "react-hook-form";
import { components } from "react-select";
import {
  useaMachineOperationsQuery,
  useAssignMachinesMutation,
} from "@/api/ArticleOperation";
import { GiSewingMachine } from "react-icons/gi";
import { InfoIcon } from "lucide-react";

const machinechema = z.object({
  machines: z
    .array(
      z.object({
        value: z.number(),
        label: z.string(),
        label2: z.string(),
      })
    )
    .min(1, "At least one machine is required"),
});

type MachinesFormData = z.infer<typeof machinechema>;

interface AddMachinesDialogProps {
  open: boolean;
  onClose: () => void;
  machineData?: any;
  orderId: number;
  refetch: () => void;
}

const AddMachinesDialog: React.FC<AddMachinesDialogProps> = ({
  open,
  onClose,
  machineData,
  orderId,
  refetch,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<MachinesFormData>({
    resolver: zodResolver(machinechema),
  });
  const [apiError, setApiError] = useState<string | null>(null);
  const { data: machines, isPending } = useaMachineOperationsQuery(orderId);
  const assignMachinesMutation = useAssignMachinesMutation(setApiError);
  const machineOptions =
    machines?.map((machine: any) => ({
      value: machine.machineId,
      label: machine.machineName,
      label2: machine.rowName,
    })) || [];

  const customMachineOption = (props: any) => {
    const { data, innerRef, innerProps } = props;

    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="px-2 py-2 hover:bg-slate-200/50 cursor-pointer flex items-center gap-3"
      >
        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-200">
          <GiSewingMachine size={12} className="text-primary" />
        </div>
        <div className="flex flex-col leading-tight">
          <p className="font-medium text-[10px]">{data.label}</p>
          <p className="text-gray-500 text-[9px]">{data.label2}</p>
        </div>
      </div>
    );
  };
  const CustomNoOptionsMachinesMessage = (props: any) => (
    <components.NoOptionsMessage {...props}>
      <span className="nodatatext">No Machines Available</span>
    </components.NoOptionsMessage>
  );
  const filterOption = (option: any, rawInput: string) => {
    const search = rawInput.toLowerCase();
    return (
      option.data.label.toLowerCase().includes(search) ||
      option.data.label2?.toLowerCase().includes(search)
    );
  };

  useEffect(() => {
    if (open) {
      if (machineData) {
        const selectedMachines = machineData.machinesId.map((machine: any) =>
          machineOptions.find((m: any) => m.value === machine.id)
        );
        reset({
          machines: selectedMachines || null,
        });
      } else {
        reset({
          machines: [],
        });
      }
    }
  }, [machineData, reset, open]);

  const onSubmit = (data: MachinesFormData) => {
    let payload: any = {
      selectedMachines: data.machines.map((machine: any) => machine.value),
    };

    if (machineData?.id) {
      payload = { ...payload, id: machineData.id };
      assignMachinesMutation.mutate(
        { id: machineData.id, machineData: payload },
        {
          onSuccess: () => {
            reset();
            onClose();
            refetch?.();
          },
        }
      );
    }
  };
  const isSubmitting = assignMachinesMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-white px-[20px] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Operation - {machineData?.displayName}
          </DialogTitle>
          <p className="text-[10px] text-left font-semibold text-primary bg-slate-200/70 p-2 rounded-lg mt-[10px] flex items-center gap-2">
            <InfoIcon size={18} className="text-primary shrink-0 -mt-[1px]" />
            Only machines from the rows included in this order will appear in
            the dropdown below.
          </p>
        </DialogHeader>
        {isPending ? (
          <div className="flex items-center justify-center py-[80px]">
            <Spinner
              size="w-10 h-10"
              color="border-primary"
              borderSize="border-4"
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <div>
              <Label htmlFor="machines" className="text-[11px]">
                {" "}
                Select Machines
              </Label>
              <Controller
                name="machines"
                control={control}
                render={({ field }) => (
                  <ReactSelect
                    {...field}
                    options={machineOptions}
                    isMulti
                    closeMenuOnSelect={false}
                    filterOption={filterOption}
                    components={{
                      Option: customMachineOption,
                      NoOptionsMessage: CustomNoOptionsMachinesMessage,
                    }}
                    className="mt-1"
                    placeholder="Select Machines"
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        backgroundColor: "white",
                        cursor: "pointer",
                        boxShadow: "none",
                        fontSize: "11px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "7px",
                        padding: "2px 2px",
                        minHeight: "40px",
                        "&:hover": {
                          border: "1px solid #cbd5e1",
                        },
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: "#64748b",
                        fontSize: "10px",
                      }),
                      multiValue: (base) => ({
                        ...base,

                        backgroundColor: "#e2e8f0",
                        color: "#2F4058",
                        fontSize: "12px",
                        padding: "0 2px",
                        borderRadius: "4px",
                      }),
                      multiValueRemove: (base) => ({
                        ...base,
                        color: "#070707ff",
                        fontSize: "11px",
                        ":hover": {
                          backgroundColor: "#2F4058",
                          color: "#e2e2e2ff",
                        },
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    }}
                  />
                )}
              />
              {errors.machines && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.machines.message}
                </p>
              )}
            </div>
            <div>
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

export default AddMachinesDialog;
