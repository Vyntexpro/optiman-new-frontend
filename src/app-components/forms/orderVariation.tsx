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
  useAddVariationMutation,
  useEditVariationMutation,
  useOrderArticlesQuery,
} from "@/api/orderVariation";
import { useContext, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";
import { AuthContext } from "@/context/AuthContext";
import { useColorsQuery } from "@/api/orderColor";
import ReactSelect from "react-select";
import { useSizesQuery } from "@/api/orderSize";
import { components } from "react-select";
import { Shirt } from "lucide-react";
const variationSchema = z.object({
  quantity: z.coerce.number().min(1, "Quantity is required"),
  sizeId: z.string().min(1, "Size is required"),
  colorId: z.string().min(1, "Color is required"),
  articleId: z
    .object({
      value: z.union([z.string(), z.number()]),
      label: z.string(),
    })
    .nullable()
    .refine((val) => val !== null, {
      message: "Article is required",
    }),
});

type variationFormData = z.infer<typeof variationSchema>;

interface AddvariationDialogProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  variationData?: any;
  totalTarget: number;
  refetch: () => void;
  orderId: number;
}

const AddvariationDialog: React.FC<AddvariationDialogProps> = ({
  open,
  onClose,
  isEdit,
  variationData,
  totalTarget,
  refetch,
  orderId,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    setError,
    clearErrors,
    watch,
  } = useForm<variationFormData>({
    resolver: zodResolver(variationSchema),
  });
  const { companyId } = useContext(AuthContext);
  const pageSize = 1000000;
  const [apiError, setApiError] = useState<string | null>(null);
  const addvariationMutation = useAddVariationMutation(setApiError);
  const editvariationMutation = useEditVariationMutation(setApiError);
  const { data: articles, isLoading } = useOrderArticlesQuery(orderId);
  const { data: colors, isPending } = useColorsQuery(0, pageSize, companyId);
  const { data: sizes, isFetching } = useSizesQuery(0, 100000, companyId);
  const quantityValue = watch("quantity");
  useEffect(() => {
    if (quantityValue && quantityValue > totalTarget) {
      setError("quantity", {
        type: "manual",
        message: `Quantity cannot exceed total target -  ${totalTarget}`,
      });
    } else {
      clearErrors("quantity");
    }
  }, [quantityValue, totalTarget, setError, clearErrors]);
  const articlesOptions =
    articles?.map((article: any) => ({
      value: article.id,
      label: article.articleName,
    })) || [];

  const customOption = (props: any) => {
    const { data, innerRef, innerProps } = props;

    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="px-2 py-1 hover:bg-slate-200/50 cursor-pointer flex items-center gap-3"
      >
        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-200">
          <Shirt size={12} className="text-primary" />
        </div>
        <div className="flex flex-col leading-tight">
          <p className="font-medium text-[10px]">{data.label}</p>
        </div>
      </div>
    );
  };
  const CustomNoOptionsMessage = (props: any) => (
    <components.NoOptionsMessage {...props}>
      <span className="nodatatext">No Articles Available</span>
    </components.NoOptionsMessage>
  );
  const filterOption = (option: any, rawInput: string) => {
    const search = rawInput.toLowerCase();
    return option.data.label.toLowerCase().includes(search);
  };
  useEffect(() => {
    if (open) {
      if (isEdit && variationData) {
        const selectedArticle = articlesOptions.find(
          (a) => a.value === variationData.articleId
        );
        reset({
          sizeId: variationData.sizeId ? String(variationData.sizeId) : "",
          colorId: variationData.sizeId ? String(variationData.colorId) : "",
          articleId: selectedArticle || null,
          quantity: variationData.quantity || null,
        });
      } else {
        reset({
          quantity: null,
          sizeId: "",
          colorId: "",
          articleId: null,
        });
      }
    }
  }, [isEdit, variationData, reset, open]);

  const onSubmit = (data: variationFormData) => {
    const basePayload = {
      makeOrderArticle: { id: String(data.articleId.value) },
      quantity: data.quantity,
      orderArticleSizeLib: { id: data.sizeId },
      orderArticleColorLib: { id: data.colorId },
    };

    if (isEdit && variationData?.orderDetailId) {
      const payload = {
        ...basePayload,
      };

      editvariationMutation.mutate(
        { id: variationData.orderDetailId, variationData: payload },
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
      };

      addvariationMutation.mutate(payload, {
        onSuccess: () => {
          reset();
          onClose();
          refetch();
        },
      });
    }
  };

  const isSubmitting =
    isEdit && variationData?.id
      ? editvariationMutation.isPending
      : addvariationMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-white px-[20px] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? "Edit Variation" : "Add New Variation"}
          </DialogTitle>
        </DialogHeader>
        {isLoading && isPending && isFetching ? (
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
                <Label htmlFor="articleId" className="text-[11px]">
                  {" "}
                  Select Article
                </Label>
                <Controller
                  name="articleId"
                  control={control}
                  render={({ field }) => (
                    <ReactSelect
                      {...field}
                      options={articlesOptions}
                      filterOption={filterOption}
                      components={{
                        Option: customOption,
                        NoOptionsMessage: CustomNoOptionsMessage,
                      }}
                      closeMenuOnSelect={true}
                      className="mt-1"
                      placeholder="Select Article"
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
                {errors.articleId && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.articleId.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="sizeId" className="text-[11px]">
                  Select Size
                </Label>
                <Controller
                  name="sizeId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="input-style">
                        <SelectValue placeholder="Select Size" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-300">
                        {sizes && sizes.content?.length > 0 ? (
                          sizes?.content?.map((s: any) => (
                            <SelectItem
                              className="select-style py-1"
                              key={s.id}
                              value={String(s.id)}
                            >
                              {s.orderSize}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="nodatatext">No Sizes Available</div>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.sizeId && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.sizeId.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {" "}
              <div>
                <Label htmlFor="colorId" className="text-[11px]">
                  Select Color
                </Label>
                <Controller
                  name="colorId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="input-style">
                        <SelectValue placeholder="Select Color" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-300">
                        {colors && colors.content?.length > 0 ? (
                          colors?.content?.map((c: any) => (
                            <SelectItem
                              className="select-style py-1"
                              key={c.id}
                              value={String(c.id)}
                            >
                              {c.orderColor}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="nodatatext">No Colors Available</div>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.colorId && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.colorId.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="quantity" className="text-[11px]">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  {...register("quantity")}
                  type="number"
                  className="input-style"
                  placeholder="Enter quantity"
                />
                {errors.quantity && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.quantity.message}
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

export default AddvariationDialog;
