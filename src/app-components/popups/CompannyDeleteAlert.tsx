import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Spinner from "../common/Spinner";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  description?: string;
}

export function CompanyDeleteAlert({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "Do you really want to delete this company? This action cannot be undone.",
}: DeleteConfirmationDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="font-bold text-md">{title}</DialogTitle>
          <DialogDescription className="py-2 font-medium text-gray/80 !mt-[0px] text-[12px]">
            {description}

            <p className="text-[11px] text-left text-[#FF4647] bg-lightred p-2 rounded-lg mt-[10px] flex items-center gap-2">
              <AlertTriangle size={14} className="text-[#FF4647] shrink-0" />
              All your dashboard data will get deleted including users.
            </p>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-0">
          <Button
            variant="outline"
            className="border-primary text-primary text-[11px] h-[32px] w-[70px]"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="bg-red hover:bg-red/90 font-semibold text-white text-[11px] h-[32px] w-[70px]"
            disabled={loading}
          >
            {loading ? (
              <Spinner
                size="w-5 h-5"
                color="border-white"
                borderSize="border-2"
              />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
