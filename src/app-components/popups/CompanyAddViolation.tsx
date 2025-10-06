import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CompanyAddViolationProps {
  open: boolean;
  onClose: () => void;
}

const CompanyAddViolation = ({ open, onClose }: CompanyAddViolationProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="font-bold text-md">
            Action Not Allowed
          </DialogTitle>
        </DialogHeader>
        <p className=" font-medium -mt-[10px] text-gray/80 text-[12px]">
          Only one company can be created at a time. You can edit or delete the
          existing company to create a new one.
        </p>
        <DialogFooter>
          <Button onClick={onClose} className="text-[11px] h-[32px] w-[40px]">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyAddViolation;
