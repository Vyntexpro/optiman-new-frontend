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
  ops: any[];
}

const BundleOperationsDialog = ({
  open,
  onClose,
  ops,
}: AssociatedOperationsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Operations Status
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
              <TableHead className="text-[11px] font-bold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ops?.map((op, index) => (
              <TableRow
                key={op.id}
                className="border-b border-slate-100 last:border-b-0"
              >
                <TableCell className="py-1 text-[11px]">{index + 1}</TableCell>
                <TableCell className="py-1 text-[11px]">
                  {op?.displayName}
                </TableCell>
                <TableCell className="py-1 text-[11px]">{op?.opId}</TableCell>
                <TableCell className="py-1 text-[11px]">
                  {" "}
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-[20px] w-[62px] font-semibold text-[9px]
                    ${
                      op.isCompleted === 1
                        ? "bg-softgreen/20 text-darkgreen border-darkgreen"
                        : "border-primary bg-slate-200/50 text-primary"
                    }
                  `}
                  >
                    {op.isCompleted === 1 ? "Completed" : "In Queue"}
                  </Button>
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

export default BundleOperationsDialog;
