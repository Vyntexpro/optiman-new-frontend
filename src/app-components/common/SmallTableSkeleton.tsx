import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const SmallTableSkeleton = ({
  columns = 4,
  rows = 8,
}: {
  columns?: number;
  rows?: number;
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-slate-200">
          {Array.from({ length: columns }).map((_, idx) => (
            <TableHead key={idx} className="text-[10px] font-semibold">
              <Skeleton className="h-2 w-12 rounded-md" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <TableRow
            key={rowIdx}
            className={`border-b border-slate-200 last:border-b-0 ${
              rowIdx % 2 === 0 ? "bg-slate-50" : "bg-white"
            }`}
          >
            {Array.from({ length: columns }).map((_, colIdx) => (
              <TableCell key={colIdx} className="py-[10px]">
                <Skeleton
                  className={`h-2 rounded-md ${
                    colIdx === 0
                      ? "w-2 bg-primary/30"
                      : "w-full max-w-[120px] bg-slate-200"
                  }`}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SmallTableSkeleton;
