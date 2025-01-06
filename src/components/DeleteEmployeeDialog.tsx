"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteEmployeeDialogProps {
  isOpen: boolean;
  employeeName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteEmployeeDialog({
  isOpen,
  employeeName,
  onClose,
  onConfirm,
}: DeleteEmployeeDialogProps) {
  const t = useTranslations();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("employee.delete.title")}</DialogTitle>
          <DialogDescription>
            {t("employee.delete.description", { name: employeeName })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button variant="default" className="bg-red-500 hover:bg-red-600" onClick={onConfirm}>
            {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 