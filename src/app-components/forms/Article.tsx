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
import { useAddArticleMutation, useEditArticleMutation } from "@/api/article";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Controller } from "react-hook-form";
import Select from "react-select";
import { useOperationsQuery } from "@/api/operation";
import { components } from "react-select";

const articleSchema = z.object({
  articleName: z.string().min(1, "Article name is required"),
  articleId: z.string().min(1, "Article number is required"),
  operations: z
    .array(
      z.object({
        value: z.number(),
        label: z.string(),
      })
    )
    .min(1, "At least one operation is required"),
});
type ArticleFormData = z.infer<typeof articleSchema>;

interface AddArticleDialogProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  articleData?: any;
  refetch: () => void;
}

const AddArticleDialog: React.FC<AddArticleDialogProps> = ({
  open,
  onClose,
  isEdit,
  articleData,
  refetch,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
  });
  const { companyId } = useContext(AuthContext);
  const [apiError, setApiError] = useState<string | null>(null);
  const addArticleMutation = useAddArticleMutation(setApiError);
  const editArticleMutation = useEditArticleMutation(setApiError);
  const pageSize = 1000000;
  const { data: operations, isLoading } = useOperationsQuery(
    0,
    pageSize,
    companyId
  );
  const operationOptions =
    operations?.content?.map((op: any) => ({
      value: op.id,
      label: op.name || `${op.operationName}`,
      label2: op.no || `${op.operationNo}`,
    })) || [];

  useEffect(() => {
    if (open) {
      if (isEdit && articleData) {
        reset({
          articleName: articleData.articleName || "",
          articleId: articleData.articleId || "",
          operations:
            articleData.operationLibs?.map((op: any) => ({
              value: op.id,
              label: `${op.operationName}`,
            })) || [],
        });
      } else {
        reset({
          articleName: "",
          articleId: "",
          operations: [],
        });
      }
    }
  }, [isEdit, articleData, reset, open]);

  const onSubmit = (data: any) => {
    let payload: any = {
      articleName: data.articleName,
      articleId: data.articleId,
      company: { id: companyId },
      operationLibs: data.operations.map((op: any) => ({ id: op.value })),
    };

    if (isEdit && articleData?.id) {
      payload = { ...payload, id: articleData.id };
      editArticleMutation.mutate(
        { id: articleData.id, articleData: payload },
        {
          onSuccess: () => {
            reset();
            onClose();
            refetch?.();
          },
        }
      );
    } else {
      addArticleMutation.mutate(payload, {
        onSuccess: () => {
          reset();
          onClose();
          refetch?.();
        },
      });
    }
  };
  const isSubmitting =
    isEdit && articleData?.id
      ? editArticleMutation.isPending
      : addArticleMutation.isPending;
  const customOption = (props: any) => {
    const { data, innerRef, innerProps } = props;
    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="px-2 py-1.5 hover:bg-slate-200/50 cursor-pointer flex gap-3"
      >
        <div className="flex flex-col justify-center">
          <p className="font-medium text-dark-gray text-[10px]">{data.label}</p>
        </div>
      </div>
    );
  };
  const CustomNoOptionsMessage = (props: any) => (
    <components.NoOptionsMessage {...props}>
      <span className="nodatatext">No operations Available</span>
    </components.NoOptionsMessage>
  );
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-white px-[20px] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? "Edit Article" : "Add New Article"}
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
                <Label htmlFor="articleName" className="text-[11px]">
                  Article Name
                </Label>
                <Input
                  id="articleName"
                  {...register("articleName")}
                  className="input-style"
                  placeholder="Enter article name"
                />
                {errors.articleName && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.articleName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="articleId" className="text-[11px]">
                  Article No
                </Label>
                <Input
                  id="articleId"
                  {...register("articleId")}
                  className="input-style"
                  placeholder="Enter article number"
                />
                {errors.articleId && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.articleId.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="operations" className="text-[11px]">
                {" "}
                Select Operations
              </Label>
              <Controller
                name="operations"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    isMulti
                    options={operationOptions}
                    components={{
                      Option: customOption,
                      NoOptionsMessage: CustomNoOptionsMessage,
                    }}
                    closeMenuOnSelect={false}
                    className="mt-1"
                    placeholder="Select operations"
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
              {errors.operations && (
                <p className="mt-1 text-[11px] text-red">
                  {errors.operations.message}
                </p>
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

export default AddArticleDialog;
