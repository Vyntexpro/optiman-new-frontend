import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface AssociatedOperationsDialogProps {
  open: boolean;
  onClose: () => void;
  operations: any[];
  articleName: string;
}

const AssociatedOperationsDialog = ({
  open,
  onClose,
  operations,
  articleName,
}: AssociatedOperationsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Associated Operations - {articleName}
          </DialogTitle>
        </DialogHeader>

        <Table>
          <TableHeader>
            <TableRow className="bg-lightgray border-b border-slate-200">
              <TableHead className="text-[11px] font-bold">Sr#</TableHead>
              <TableHead className="text-[11px] font-bold">
                Operation Name
              </TableHead>
              <TableHead className="text-[11px] font-bold">
                Operation No
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations.map((op, index) => (
              <TableRow
                key={op.id}
                className="border-b border-slate-100 last:border-b-0"
              >
                <TableCell className="py-1 text-[11px]">{index + 1}</TableCell>
                <TableCell className="py-1 text-[11px]">
                  {op.operationName}
                </TableCell>
                <TableCell className="py-1 text-[11px]">
                  {op.operationNo}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <DialogFooter>
          <Button
            variant="outline"
            className="border-primary text-primary text-[11px] h-[32px] w-[70px]"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssociatedOperationsDialog;
