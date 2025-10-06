import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCompaniesQuery, useDeleteCompanyMutation } from "@/api/company";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import NoDataAvailable from "@/app-components/common/NoData";
import { useState } from "react";
import AddCompanyDialog from "@/app-components/forms/Company";
import TableSkeleton from "@/app-components/common/TableSkeleton";
import CompanyAddViolation from "@/app-components/popups/CompanyAddViolation";
import { CompanyDeleteAlert } from "@/app-components/popups/CompannyDeleteAlert";

const Companies = () => {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [violationOpen, setViolationOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data: companies, isLoading } = useCompaniesQuery();
  const deleteMutation = useDeleteCompanyMutation();

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <h2 className="text-[23px] font-bold ">Manage Company</h2>
        <Button
          className="h-[40px] flex items-center text-[11px] font-semibold"
          onClick={() => {
            if (companies && companies.length > 0) {
              setViolationOpen(true);
              return;
            }
            setEditData(null);
            setOpen(true);
          }}
        >
          <Plus />
          Add New Company
        </Button>
      </div>
      <div className="rounded-lg border border-slate-200 shadow-2xl bg-white shadow-primary/10 backdrop-blur-lg px-4 py-2 mt-[12px] mb-[30px]">
        {isLoading ? (
          <TableSkeleton />
        ) : companies && companies.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 bg-lightgray">
                <TableHead className="text-[11px] font-bold">Date</TableHead>
                <TableHead className="text-[11px] font-bold">
                  Company Name
                </TableHead>
                <TableHead className="text-[11px] font-bold">
                  Person Name
                </TableHead>
                <TableHead className="text-[11px] font-bold">Email</TableHead>
                <TableHead className="text-[11px] font-bold ">
                  Address
                </TableHead>
                <TableHead className="text-[11px] font-bold">Country</TableHead>
                <TableHead className="text-[11px] font-bold">
                  Phone No#
                </TableHead>
                <TableHead className="text-[11px] font-bold">
                  Mobile No#
                </TableHead>
                <TableHead className="text-[11px] font-bold">Edit</TableHead>
                <TableHead className="text-[11px] font-bold">Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company: any, index: number) => (
                <TableRow
                  key={company.id}
                  className={`
          border-b border-slate-100 last:border-b-0
          hover:bg-slate-50 transition-colors
        `}
                >
                  <TableCell className="py-4 text-[11px]">
                    {company.createdAt
                      ? format(new Date(company.createdAt), "dd/MM/yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell className="py-4 text-[11px]">
                    {company.companyName}
                  </TableCell>
                  <TableCell className="py-4 text-[11px]">
                    {company.personName}
                  </TableCell>
                  <TableCell className="py-4 text-[11px]">
                    {company.email}
                  </TableCell>
                  <TableCell className="py-4 text-[11px]">
                    {company.address}
                  </TableCell>
                  <TableCell className="py-4 text-[11px]">
                    {company.country}
                  </TableCell>
                  <TableCell className="py-4 text-[11px]">
                    {company.phoneNo}
                  </TableCell>
                  <TableCell className="py-4 text-[11px]">
                    {company.mobileOne}
                  </TableCell>
                  <TableCell className="py-4 text-[11px]">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary text-[9px] h-[26px] text-primary"
                      onClick={() => {
                        setEditData(company);
                        setOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                  <TableCell className="py-3">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-lightred text-red h-[26px] font-semibold text-[9px]"
                      onClick={() => setDeleteId(company.id)}
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
        <CompanyDeleteAlert
          open={deleteId !== null}
          onClose={() => setDeleteId(null)}
          onConfirm={async () => {
            if (deleteId) {
              await deleteMutation.mutateAsync(deleteId);
              setDeleteId(null);
            }
          }}
        />
      </div>
      <CompanyAddViolation
        open={violationOpen}
        onClose={() => setViolationOpen(false)}
      />
      <AddCompanyDialog
        open={open}
        onClose={() => setOpen(false)}
        isEdit={!!editData}
        companyData={editData}
      />
    </div>
  );
};

export default Companies;
