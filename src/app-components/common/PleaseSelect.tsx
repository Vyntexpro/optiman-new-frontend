import { FileText } from "lucide-react";

export default function PleaseSelect() {
  return (
    <div className="flex flex-col items-center justify-center py-[83px] text-slate-500">
      <FileText className="w-8 h-8 mb-1 text-slate-400" strokeWidth={1.3} />
      <p className="text-[12px] font-semibold">Please Select One Article</p>
      <p className="text-[11px] font-light mt-2 w-[300px] text-center text-slate-400">
        Select an Article from top right dropdown to get proceed with assigning
        machines to its operations
      </p>
    </div>
  );
}
