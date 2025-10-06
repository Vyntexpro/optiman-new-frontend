import { FolderOpen } from "lucide-react";

export default function NoDataAvailable() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
      <FolderOpen className="w-9 h-9 mb-1 text-slate-400" strokeWidth={1.3} />
      <p className="text-[14px] font-semibold">No Data Available</p>
    </div>
  );
}
