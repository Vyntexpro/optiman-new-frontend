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
import { useState, useEffect, useContext } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactSelect from "react-select";
import { Controller } from "react-hook-form";

import { components } from "react-select";
import { useAddBundleMutation, useEditBundleMutation } from "@/api/bundle";
import { ShoppingCartIcon, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useActiveOrdersQuery } from "@/api/order";
import { AuthContext } from "@/context/AuthContext";
import { useVariationsQuery } from "@/api/orderVariation";
import InputFieldSkeleton from "../common/InputFieldSkeleton";
const bundleSchema = z.object({
  rowId: z.string().min(1, "Row is required"),
  orderVariation: z.string().min(1, "Variation is required"),
  card: z.string().optional(),
  numberBundles: z.coerce.number().min(1, "Number is required"),
  bundleSize: z.coerce.number().optional(),
  orderId: z
    .object({
      value: z.union([z.string(), z.number()]),
      label: z.string(),
    })
    .nullable()
    .refine((val) => val !== null, {
      message: "Order is required",
    }),
  articleId: z.string().min(1, "Article is required"),
});
const editBundleSchema = bundleSchema.omit({ numberBundles: true }).extend({
  bundleSize: z.coerce.number().optional(),
});
type BundleFormData = z.infer<typeof bundleSchema>;

interface AddBundleDialogProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  bundleData?: any;
  refetch: () => void;
}

const AddBundleDialog: React.FC<AddBundleDialogProps> = ({
  open,
  onClose,
  isEdit,
  bundleData,
  refetch,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
  } = useForm<BundleFormData>({
    resolver: zodResolver(isEdit ? editBundleSchema : bundleSchema),
  });
  const { companyId } = useContext(AuthContext);
  const [apiError, setApiError] = useState<string | null>(null);
  const addBundleMutation = useAddBundleMutation(setApiError);
  const editBundleMutation = useEditBundleMutation(setApiError);
  const selectedOrder = watch("orderId");
  const selectedArticleId = watch("articleId");
  const orderId = selectedOrder ? Number(selectedOrder.value) : 0;
  const { data: orders, isLoading } = useActiveOrdersQuery(companyId);
  const { data: variations, isPending } = useVariationsQuery(orderId);
  const selectedOrderObj = orders?.find((o: any) => o.id === orderId);
  const rows = selectedOrderObj?.rows || [];
  const orderOptions =
    orders?.map((order: any) => ({
      value: order.id,
      label: order.orderNo,
    })) || [];

  const filteredVariations =
    variations?.filter((v: any) => String(v.articleId) === selectedArticleId) ||
    [];
  const customOption = (props: any) => {
    const { data, innerRef, innerProps } = props;

    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="px-2 py-1 hover:bg-slate-200/50 cursor-pointer flex items-center gap-3"
      >
        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-200">
          <ShoppingCartIcon size={12} className="text-primary" />
        </div>
        <div className="flex flex-col leading-tight">
          <p className="font-medium text-[10px]">{data.label}</p>
        </div>
      </div>
    );
  };
  const CustomNoOptionsMessage = (props: any) => (
    <components.NoOptionsMessage {...props}>
      <span className="nodatatext">No Active Orders Available</span>
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
      if (isEdit && bundleData) {
        const selectedOrder = orderOptions.find(
          (c) => c.value === bundleData?.orderId
        );
        reset({
          orderId: selectedOrder || null,
          rowId: bundleData.rowId ? String(bundleData.rowId) : "",
          orderVariation: bundleData.articleDetailId
            ? String(bundleData.articleDetailId)
            : "",
          articleId: bundleData.articleId ? String(bundleData.articleId) : "",
          bundleSize: bundleData.bundleSize || 0,
          card: bundleData.card || "",
        });
      } else {
        reset({
          card: "",
          bundleSize: null,
          numberBundles: null,
          rowId: "",
          orderVariation: "",
          orderId: null,
          articleId: "",
        });
      }
    }
  }, [isEdit, bundleData, reset, open]);
  const onSubmit = (data: BundleFormData) => {
    if (isEdit && bundleData?.id) {
      const editPayload = {
        bundle: data.bundleSize || 0,
        cardTag: data.card || null,
        status: bundleData.status || 1,
        makeOrderArticle: { id: String(data.articleId) },
        makeOrderArticleDetail: { id: data.orderVariation },
        row: { id: data.rowId },
      };

      editBundleMutation.mutate(
        { id: bundleData.id, bundleData: editPayload },
        {
          onSuccess: () => {
            reset();
            onClose();
            refetch?.();
          },
        }
      );
    } else {
      const addPayload = {
        bundle: 0,
        cardTag: data.card || null,
        displayName: "",
        status: 1,
        generateCards: data.numberBundles,
        makeOrderArticle: { id: String(data.articleId) },
        makeOrderArticleDetail: { id: data.orderVariation },
        row: { id: data.rowId },
      };

      addBundleMutation.mutate(addPayload, {
        onSuccess: () => {
          reset();
          onClose();
          refetch?.();
        },
      });
    }
  };
  const isSubmitting =
    isEdit && bundleData?.id
      ? editBundleMutation.isPending
      : addBundleMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-white px-[20px] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? "Edit bundle" : "Add New bundle"}
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
                <Label htmlFor="orderId" className="text-[11px]">
                  {" "}
                  Select Order
                </Label>
                <Controller
                  name="orderId"
                  control={control}
                  render={({ field }) => (
                    <ReactSelect
                      {...field}
                      options={orderOptions}
                      filterOption={filterOption}
                      components={{
                        Option: customOption,
                        NoOptionsMessage: CustomNoOptionsMessage,
                      }}
                      closeMenuOnSelect={true}
                      className="mt-[1.4px]"
                      placeholder="Select Order"
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
                        menu: (base) => ({
                          ...base,
                          zIndex: 9999,
                        }),
                      }}
                    />
                  )}
                />
                {errors.orderId && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.orderId.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="articleId" className="text-[11px]">
                  {" "}
                  Select Article
                </Label>
                {isPending ? (
                  <InputFieldSkeleton />
                ) : (
                  <Controller
                    name="articleId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="input-style">
                          <SelectValue placeholder="Select Article" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-300">
                          {variations.length > 0 ? (
                            variations?.map((v: any) => (
                              <SelectItem
                                className="select-style py-1"
                                key={v.articleId}
                                value={String(v.articleId)}
                              >
                                {v.articleName}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="nodatatext">
                              No Articles Available
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
                {errors.articleId && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.articleId.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="orderVariation" className="text-[11px]">
                  Select Variation
                </Label>
                {isPending ? (
                  <InputFieldSkeleton />
                ) : (
                  <Controller
                    name="orderVariation"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="input-style">
                          <SelectValue placeholder="Select Variation" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-300">
                          {filteredVariations.length > 0 ? (
                            filteredVariations.map((v: any) => (
                              <SelectItem
                                className="select-style py-1"
                                key={v.orderDetailId}
                                value={String(v.orderDetailId)}
                              >
                                {v.color}, {v.size}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="nodatatext">
                              No Variations Available
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
                {errors.orderVariation && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.orderVariation.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="rowId" className="text-[11px]">
                  Select Row
                </Label>
                {isPending ? (
                  <InputFieldSkeleton />
                ) : (
                  <Controller
                    name="rowId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="input-style">
                          <SelectValue placeholder="Select Row" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-300">
                          {rows.length > 0 ? (
                            rows.map((r: any) => (
                              <SelectItem
                                className="select-style py-1"
                                key={r.id}
                                value={String(r.id)}
                              >
                                {r.rowName}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="nodatatext">No Rows Available</div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
                {errors.rowId && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.rowId.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {!isEdit && (
                <div>
                  <Label htmlFor="numberBundles" className="text-[11px]">
                    Number of Bundles
                  </Label>
                  <Input
                    id="numberBundles"
                    type="number"
                    {...register("numberBundles")}
                    className="input-style"
                    placeholder="Enter number of bundles"
                  />
                  {errors.numberBundles && (
                    <p className="mt-1 text-[11px] text-red">
                      {errors.numberBundles.message}
                    </p>
                  )}
                </div>
              )}

              {isEdit && (
                <div>
                  <Label htmlFor="bundleSize" className="text-[11px]">
                    Bundle Size
                  </Label>
                  <Input
                    id="bundleSize"
                    type="number"
                    {...register("bundleSize")}
                    className="input-style"
                    placeholder="Enter bundle size"
                  />
                  {errors.bundleSize && (
                    <p className="mt-1 text-[11px] text-red">
                      {errors.bundleSize.message}
                    </p>
                  )}
                </div>
              )}
              {isEdit && (
                <div>
                  <Label htmlFor="bundleSize" className="text-[11px]">
                    Card UID
                  </Label>
                  <Input
                    id="card"
                    {...register("card")}
                    className="input-style"
                    placeholder="Enter card UID"
                  />
                  {errors.card && (
                    <p className="mt-1 text-[11px] text-red">
                      {errors.card.message}
                    </p>
                  )}
                </div>
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
                    color="bbundle-white"
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

export default AddBundleDialog;
