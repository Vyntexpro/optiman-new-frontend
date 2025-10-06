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
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useFloorsQuery } from "@/api/floor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactSelect from "react-select";
import { Controller } from "react-hook-form";
import { useBuildingsQuery } from "@/api/building";
import { useHallsQuery } from "@/api/hall";
import InputFieldSkeleton from "../common/InputFieldSkeleton";
import { useBranchesQuery } from "@/api/branch";
import { useRowsQuery } from "@/api/row";
import { useCustomersQuery } from "@/api/customer";
import { components } from "react-select";
import { useAddOrderMutation, useEditOrderMutation } from "@/api/order";
import { Shirt, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useArticlesQuery } from "@/api/article";
const orderSchema = z.object({
  branchId: z.string().min(1, "Branch is required"),
  hallId: z.string().min(1, "Hall is required"),
  buildingId: z.string().min(1, "Building is required"),
  floorId: z.string().min(1, "Floor is required"),
  orderNo: z.string().min(1, "Order No is required"),
  orderSNO: z.string().min(1, "Order SNo is required"),
  totalTarget: z.coerce.number().min(1, "Total target is required"),
  dailyTarget: z.coerce.number().min(1, "Daily target is required"),
  garmentSam: z.coerce.number().min(1, "SAM is required"),
  weeklyEfficiency: z.coerce.number().min(1, "Efficiency is required"),
  operationSequenceOrder: z.string().optional(),
  customerId: z
    .object({
      value: z.union([z.string(), z.number()]),
      label: z.string(),
      label2: z.string(),
    })
    .nullable()
    .refine((val) => val !== null, {
      message: "Customer is required",
    }),
  articlesId: z
    .array(
      z.object({
        value: z.number(),
        label: z.string(),
        label2: z.string(),
      })
    )
    .min(1, "At least one article is required"),
  rowId: z
    .array(
      z.object({
        value: z.number(),
        label: z.string(),
      })
    )
    .min(1, "At least one row is required"),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface AddOrderDialogProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  orderData?: any;
  refetch: () => void;
}

const AddOrderDialog: React.FC<AddOrderDialogProps> = ({
  open,
  onClose,
  isEdit,
  orderData,
  refetch,
}) => {
  const editOrderSchema = isEdit
    ? orderSchema.extend({
        branchId: z.string().optional(),
        hallId: z.string().optional(),
        floorId: z.string().optional(),
        buildingId: z.string().optional(),
      })
    : orderSchema;
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setError,
    clearErrors,
    control,
  } = useForm<OrderFormData>({
    resolver: zodResolver(editOrderSchema),
  });
  const pageSize = 1000000;
  const { companyId } = useContext(AuthContext);
  const branchId = isNaN(Number(watch("branchId")))
    ? undefined
    : Number(watch("branchId"));
  const buildingId = isNaN(Number(watch("buildingId")))
    ? undefined
    : Number(watch("buildingId"));
  const floorId = isNaN(Number(watch("floorId")))
    ? undefined
    : Number(watch("floorId"));
  const hallId = isNaN(Number(watch("hallId")))
    ? undefined
    : Number(watch("hallId"));
  const [apiError, setApiError] = useState<string | null>(null);
  const addOrderMutation = useAddOrderMutation(setApiError);
  const editOrderMutation = useEditOrderMutation(setApiError);
  const { data: branches, isPending } = useBranchesQuery(
    0,
    pageSize,
    companyId
  );
  const { data: buildings, isLoading: buildingsLoading } = useBuildingsQuery(
    0,
    pageSize,
    companyId,
    branchId
  );
  const { data: halls, isFetching } = useHallsQuery(
    0,
    pageSize,
    companyId,
    branchId,
    buildingId,
    floorId
  );
  const { data: rows, isLoading: rowsLoading } = isEdit
    ? useRowsQuery(
        0,
        pageSize,
        companyId,
        ...(branchId !== 0 ? [branchId] : []),
        ...(buildingId !== 0 ? [buildingId] : []),
        ...(floorId !== 0 ? [floorId] : []),
        ...(hallId !== 0 ? [hallId] : [])
      )
    : useRowsQuery(
        0,
        pageSize,
        companyId,
        branchId,
        buildingId,
        floorId,
        hallId
      );
  const { data: floors, isLoading } = useFloorsQuery(
    0,
    pageSize,
    companyId,
    branchId,
    buildingId
  );

  const { data: customers, isLoading: customersLoading } = useCustomersQuery(
    0,
    100000,
    companyId
  );
  const { data: articles, isLoading: articlesLoading } = useArticlesQuery(
    0,
    100000,
    companyId
  );
  const customerOptions =
    customers?.content?.map((customer: any) => ({
      value: customer.id,
      label: customer.name,
      label2: customer.email,
    })) || [];
  const articleOptions =
    articles?.content?.map((article: any) => ({
      value: article.id,
      label: article.articleName,
      label2: article.articleId,
    })) || [];
  const rowOptions =
    rows?.content?.map((row: any) => ({
      value: row.id,
      label: row.rowName,
    })) || [];

  const customOption = (props: any) => {
    const { data, innerRef, innerProps } = props;

    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="px-2 py-2 hover:bg-slate-200/50 cursor-pointer flex items-center gap-3"
      >
        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-200">
          <User size={13} className="text-primary" />
        </div>
        <div className="flex flex-col leading-tight">
          <p className="font-medium text-[10px]">{data.label}</p>
          <p className="text-gray-500 text-[9px]">{data.label2}</p>
        </div>
      </div>
    );
  };
  const customRowOption = (props: any) => {
    const { data, innerRef, innerProps } = props;

    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="px-2 py-1.5 hover:bg-slate-200/50 cursor-pointer flex items-center gap-3"
      >
        <p className="font-medium text-[10px]">{data.label}</p>
      </div>
    );
  };
  const customArticleOption = (props: any) => {
    const { data, innerRef, innerProps } = props;

    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="px-2 py-2 hover:bg-slate-200/50 cursor-pointer flex items-center gap-3"
      >
        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-200">
          <Shirt size={12} className="text-primary" />
        </div>
        <div className="flex flex-col leading-tight">
          <p className="font-medium text-[10px]">{data.label}</p>
          <p className="text-gray-500 text-[9px]">{data.label2}</p>
        </div>
      </div>
    );
  };
  const CustomNoOptionsMessage = (props: any) => (
    <components.NoOptionsMessage {...props}>
      <span className="nodatatext">No Customers Available</span>
    </components.NoOptionsMessage>
  );
  const CustomNoOptionsArticleMessage = (props: any) => (
    <components.NoOptionsMessage {...props}>
      <span className="nodatatext">No Articles Available</span>
    </components.NoOptionsMessage>
  );
  const CustomNoOptionsRowMessage = (props: any) => (
    <components.NoOptionsMessage {...props}>
      <span className="nodatatext !text-center flex justify-center">
        No Rows Available
        <br></br>Select Appropriate Branch-Building-Floor-Hall
      </span>
    </components.NoOptionsMessage>
  );
  const filterOption = (option: any, rawInput: string) => {
    const search = rawInput.toLowerCase();
    return (
      option.data.label.toLowerCase().includes(search) ||
      option.data.label2?.toLowerCase().includes(search)
    );
  };
  const totalTarget = watch("totalTarget");
  const dailyTarget = watch("dailyTarget");

  useEffect(() => {
    if (
      dailyTarget &&
      totalTarget &&
      Number(dailyTarget) > Number(totalTarget)
    ) {
      setError("dailyTarget", {
        type: "manual",
        message: "Daily target cannot be greater than total target",
      });
    } else {
      clearErrors("dailyTarget");
    }
  }, [dailyTarget, totalTarget, setError, clearErrors]);
  useEffect(() => {
    if (open) {
      if (isEdit && orderData) {
        const selectedCustomer = customerOptions.find(
          (c) => c.value === orderData.customerLib.id
        );
        const selectedArticles = orderData.makeOrderArticle.map(
          (article: any) =>
            articleOptions.find((a: any) => a.label2 === article.articleId)
        );
        const selectedDrow = orderData.rows.map((row: any) =>
          rowOptions.find((r: any) => r.value === row.id)
        );
        reset({
          rowId: selectedDrow || null,
          hallId: "",
          buildingId: "",
          floorId: "",
          branchId: "",
          customerId: selectedCustomer || null,
          articlesId: selectedArticles || null,
          orderNo: orderData.orderNo || "",
          orderSNO: orderData.orderSNO || "",
          dailyTarget: orderData.dailyTarget || null,
          totalTarget: orderData.totalTarget || null,
          garmentSam: orderData.garmentSam || null,
          weeklyEfficiency: orderData.weeklyEfficiency || null,
        });
      } else {
        reset({
          branchId: "",
          hallId: "",
          buildingId: "",
          floorId: "",
          rowId: [],
          orderNo: "",
          orderSNO: "",
          dailyTarget: null,
          totalTarget: null,
          garmentSam: null,
          weeklyEfficiency: null,
          customerId: null,
          articlesId: [],
        });
      }
    }
  }, [isEdit, orderData, reset, open]);

  const onSubmit = (data: OrderFormData) => {
    let payload: any = {
      operationSequenceOrder: data.operationSequenceOrder,
      orderNo: data.orderNo,
      orderSNO: data.orderSNO,
      dailyTarget: data.dailyTarget,
      totalTarget: data.totalTarget,
      garmentSam: String(data.garmentSam),
      weeklyEfficiency: String(data.weeklyEfficiency),
      company: { id: Number(companyId) },
      customerLib: { id: Number(data.customerId.value) },
      selectedArticles: data.articlesId.map((article: any) => article.value),
      rows: data.rowId.map((row: any) => ({
        id: row.value,
      })),
    };

    if (isEdit && orderData?.id) {
      payload = { ...payload, id: orderData.id };
      editOrderMutation.mutate(
        { id: orderData.id, orderData: payload },
        {
          onSuccess: () => {
            reset();
            onClose();
            refetch?.();
          },
        }
      );
    } else {
      addOrderMutation.mutate(payload, {
        onSuccess: () => {
          reset();
          onClose();
          refetch?.();
        },
      });
    }
  };
  const isSubmitting =
    isEdit && orderData?.id
      ? editOrderMutation.isPending
      : addOrderMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-white px-[20px] sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? "Edit Order" : "Add New Order"}
          </DialogTitle>
        </DialogHeader>
        {isPending && customersLoading && articlesLoading ? (
          <div className="flex items-center justify-center py-[120px]">
            <Spinner
              size="w-10 h-10"
              color="border-primary"
              borderSize="border-4"
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="orderNo" className="text-[11px]">
                  Order No
                </Label>
                <Input
                  id="orderNo"
                  {...register("orderNo")}
                  className="input-style"
                  placeholder="Enter order number"
                />
                {errors.orderNo && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.orderNo.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="orderSNO" className="text-[11px]">
                  Order SNo
                </Label>
                <Input
                  id="orderSNO"
                  {...register("orderSNO")}
                  className="input-style"
                  placeholder="Enter order serial number"
                />
                {errors.orderSNO && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.orderSNO.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="totalTarget" className="text-[11px]">
                  Total Target
                </Label>
                <Input
                  id="totalTarget"
                  type="number"
                  {...register("totalTarget")}
                  className="input-style"
                  placeholder="Enter total target"
                />
                {errors.totalTarget && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.totalTarget.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="orderSNO" className="text-[11px]">
                  Daily Target
                </Label>
                <Input
                  id="dailyTarget"
                  type="number"
                  {...register("dailyTarget")}
                  className="input-style"
                  placeholder="Enter daily target"
                />
                {errors.dailyTarget && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.dailyTarget.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="totalTarget" className="text-[11px]">
                  Garment SAM
                </Label>
                <Input
                  id="garmentSam"
                  type="number"
                  {...register("garmentSam")}
                  className="input-style"
                  placeholder="Enter SAM "
                />
                {errors.garmentSam && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.garmentSam.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="weeklyEfficiency" className="text-[11px]">
                  Accepted Efficiency (%)
                </Label>
                <Input
                  id="weeklyEfficiency"
                  type="number"
                  {...register("weeklyEfficiency")}
                  className="input-style"
                  placeholder="Enter SAM "
                />
                {errors.weeklyEfficiency && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.weeklyEfficiency.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-[11px]">Select Branch</Label>
                <Controller
                  name="branchId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        reset((prev) => ({ ...prev, buildingId: "" }));
                      }}
                    >
                      <SelectTrigger className="input-style bg-white">
                        <SelectValue placeholder="Select Branch" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-300">
                        {branches && branches.content?.length > 0 ? (
                          branches?.content?.map((branch: any) => (
                            <SelectItem
                              key={branch.id}
                              value={String(branch.id)}
                              className="select-style py-1"
                            >
                              {branch.branchName}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="nodatatext">
                            No Branches Available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.branchId && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.branchId.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-[11px]">Select Building</Label>
                {buildingsLoading ? (
                  <InputFieldSkeleton />
                ) : (
                  <Controller
                    name="buildingId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          reset((prev) => ({ ...prev, floorId: "" }));
                        }}
                      >
                        <SelectTrigger className="input-style bg-white">
                          <SelectValue placeholder="Select Building" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-300 cursor-pointer">
                          {buildings && buildings.content?.length > 0 ? (
                            buildings?.content?.map((building: any) => (
                              <SelectItem
                                key={building.id}
                                value={String(building.id)}
                                className="select-style py-1"
                              >
                                {building.buildingName}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="nodatatext">
                              No Buildings Available
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
                {errors.buildingId && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.buildingId.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="floorId" className="text-[11px]">
                  Select Floor
                </Label>
                {isLoading ? (
                  <InputFieldSkeleton />
                ) : (
                  <Controller
                    name="floorId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          reset((prev) => ({ ...prev, hallId: "" }));
                        }}
                      >
                        <SelectTrigger className="input-style bg-white">
                          <SelectValue placeholder="Select Floor" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-300">
                          {floors && floors.content?.length > 0 ? (
                            floors?.content?.map((floor: any) => (
                              <SelectItem
                                key={floor.id}
                                value={String(floor.id)}
                                className="select-style py-1"
                              >
                                {floor.floorName}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="nodatatext">
                              No Floors Available
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
                {errors.floorId && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.floorId.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="hallId" className="text-[11px]">
                  Select Hall
                </Label>
                {isFetching ? (
                  <InputFieldSkeleton />
                ) : (
                  <Controller
                    name="hallId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          reset((prev) => ({ ...prev, rowId: null }));
                        }}
                      >
                        <SelectTrigger className="input-style">
                          <SelectValue placeholder="Select Hall" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-300">
                          {halls && halls.content?.length > 0 ? (
                            halls?.content.map((h: any) => (
                              <SelectItem
                                className="select-style py-1"
                                key={h.id}
                                value={String(h.id)}
                              >
                                {h.hallName}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="nodatatext">No Halls Available</div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
                {errors.hallId && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.hallId.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="rowId" className="text-[11px]">
                  Select Rows
                </Label>
                {rowsLoading ? (
                  <InputFieldSkeleton />
                ) : (
                  <Controller
                    name="rowId"
                    control={control}
                    render={({ field }) => (
                      <ReactSelect
                        {...field}
                        options={rowOptions}
                        isMulti
                        closeMenuOnSelect={false}
                        filterOption={filterOption}
                        components={{
                          Option: customRowOption,
                          NoOptionsMessage: CustomNoOptionsRowMessage,
                        }}
                        className="mt-[2px]"
                        placeholder="Select Rows"
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
                            padding: "px px",
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
                            fontSize: "10px",
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
                )}
                {errors.rowId && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.rowId.message}
                  </p>
                )}
              </div>
              {!isEdit && (
                <div>
                  <Label
                    htmlFor="operationSequenceOrder"
                    className="text-[11px]"
                  >
                    Operation Sequence Order (optional)
                  </Label>
                  <Controller
                    name="operationSequenceOrder"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="input-style">
                          <SelectValue placeholder="Select Sequence" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-300">
                          <SelectItem
                            value="SEQUENCE"
                            className="select-style py-1"
                          >
                            Sequence
                          </SelectItem>
                          <SelectItem
                            value="HEADTAIL"
                            className="select-style py-1"
                          >
                            Head To Tail
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.operationSequenceOrder && (
                    <p className="mt-1 text-[11px] text-red">
                      {errors.operationSequenceOrder.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4"></div>
            <div>
              <Label htmlFor="orderId" className="text-[11px]">
                {" "}
                Select Customer
              </Label>
              <Controller
                name="customerId"
                control={control}
                render={({ field }) => (
                  <ReactSelect
                    {...field}
                    options={customerOptions}
                    filterOption={filterOption}
                    components={{
                      Option: customOption,
                      NoOptionsMessage: CustomNoOptionsMessage,
                    }}
                    closeMenuOnSelect={true}
                    className="mt-1"
                    placeholder="Select Customer"
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
              {errors.customerId && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.customerId.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="articlesId" className="text-[11px]">
                {" "}
                Select Articles
              </Label>
              <Controller
                name="articlesId"
                control={control}
                render={({ field }) => (
                  <ReactSelect
                    {...field}
                    options={articleOptions}
                    isMulti
                    closeMenuOnSelect={false}
                    filterOption={filterOption}
                    components={{
                      Option: customArticleOption,
                      NoOptionsMessage: CustomNoOptionsArticleMessage,
                    }}
                    className="mt-1"
                    placeholder="Select Articles"
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
              {errors.articlesId && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.articlesId.message}
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

export default AddOrderDialog;
