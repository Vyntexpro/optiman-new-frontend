import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useArticlesQuery, useDeleteArticleMutation } from "@/api/article";
import { Plus, Search } from "lucide-react";
import NoDataAvailable from "@/app-components/common/NoData";
import { useContext, useState } from "react";
import { DeleteConfirmationDialog } from "@/app-components/common/DeleteConfirmAlert";
import TableSkeleton from "@/app-components/common/TableSkeleton";
import CustomPagination from "@/app-components/common/Pagination";
import { Input } from "@/components/ui/input";
import useDebounce from "@/lib/helperFunctions";
import { AuthContext } from "@/context/AuthContext";
import { format } from "date-fns";
import AddArticleDialog from "@/app-components/forms/Article";
import AssociatedOperationsDialog from "@/app-components/popups/ArticleOperations";

const Article = () => {
  const [open, setOpen] = useState(false);
  const [openOps, setOpenOps] = useState(false);
  const [selectedOps, setSelectedOps] = useState<any[]>([]);
  const [selectedArticleName, setSelectedArticleName] = useState("");
  const [editData, setEditData] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [pageNo, setPageNo] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const { companyId } = useContext(AuthContext);
  const pageSize = 10;
  const {
    data: articles,
    isLoading,
    refetch,
  } = useArticlesQuery(pageNo, pageSize, companyId, debouncedSearch);
  const deleteMutation = useDeleteArticleMutation();
  return (
    <div className="pb-10">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-[22px] font-bold ">Article Libraries</h2>
          </div>

          <div className="flex flex-row items-center gap-[8px]">
            <div className="relative w-[300px]">
              <Search className="absolute left-3 top-3.5 text-primary w-4 h-4" />
              <Input
                type="text"
                placeholder="Search articles..."
                className="input-style h-[40px] pl-9 bg-white"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPageNo(0);
                }}
              />
            </div>
            <Button
              className="h-[40px] text-[11px] mt-[1px] font-semibold"
              onClick={() => {
                setEditData(null);
                setOpen(true);
              }}
            >
              <Plus />
              Add New Article
            </Button>
          </div>
        </div>
        <div className="rounded-lg bg-white border border-slate-200 shadow-2xl shadow-primary/10 backdrop-blur-lg px-4 py-2 mt-[10px]">
          {isLoading ? (
            <TableSkeleton />
          ) : articles && articles.content && articles.content.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 bg-lightgray">
                  <TableHead className="text-[11px] font-bold py-2">
                    Sr#
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">Date</TableHead>
                  <TableHead className="text-[11px] font-bold">Name</TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Article No
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Operations
                  </TableHead>
                  <TableHead className="text-[11px] font-bold">Edit</TableHead>
                  <TableHead className="text-[11px] font-bold">
                    Delete
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.content.map((article: any, index: number) => (
                  <TableRow
                    key={article.id}
                    className={`
                      border-b border-slate-100 last:border-b-0
                      hover:bg-slate-50 transition-articles
                    `}
                  >
                    <TableCell className="py-3 text-[11px]">
                      {index + 1 + pageNo * pageSize}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {" "}
                      {article.createdAt
                        ? format(new Date(article.createdAt), "dd/MM/yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {article.articleName}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      {article.articleId}
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary bg-slate-200/50 font-semibold text-primary text-[9.5px] h-[26px]"
                        onClick={() => {
                          setSelectedOps(article.operationLibs || []);
                          setSelectedArticleName(article.articleName);
                          setOpenOps(true);
                        }}
                      >
                        Associated Operations
                      </Button>
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary text-primary text-[9px] h-[26px]"
                        onClick={() => {
                          setEditData(article);
                          setOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                    <TableCell className="py-3 text-[11px]">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-lightred text-red font-semibold text-[9px] h-[26px]"
                        onClick={() => setDeleteId(article.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <NoDataAvailable />
          )}
          <DeleteConfirmationDialog
            open={deleteId !== null}
            onClose={() => setDeleteId(null)}
            onConfirm={async () => {
              if (deleteId) {
                await deleteMutation.mutateAsync(deleteId);
                const { data } = await refetch();
                if (data && data.content.length === 0 && pageNo > 0) {
                  setPageNo((prev) => prev - 1);
                  await refetch();
                }
                setDeleteId(null);
              }
            }}
          />
          <AssociatedOperationsDialog
            open={openOps}
            onClose={() => setOpenOps(false)}
            operations={selectedOps}
            articleName={selectedArticleName}
          />
        </div>

        <AddArticleDialog
          open={open}
          onClose={() => setOpen(false)}
          isEdit={!!editData}
          articleData={editData}
          refetch={refetch}
        />
      </div>

      {articles && articles.content && articles.content.length > 0 && (
        <div className="pt-[30px] flex flex-row justify-center">
          <CustomPagination
            pageNo={pageNo}
            setPageNo={setPageNo}
            totalElements={articles?.totalElements ?? 0}
            pageSize={pageSize}
          />
        </div>
      )}
    </div>
  );
};

export default Article;
