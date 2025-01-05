"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarEvent } from "@/types/types";

interface SpecialEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (event: Omit<CalendarEvent, 'id'>) => void;
  selectedDate: Date;
}

export default function SpecialEventDialog({
  isOpen,
  onClose,
  onConfirm,
  selectedDate,
}: SpecialEventDialogProps) {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [color, setColor] = useState("#3174ad");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const start = new Date(selectedDate);
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    start.setHours(startHours, startMinutes);

    const end = new Date(selectedDate);
    const [endHours, endMinutes] = endTime.split(":").map(Number);
    end.setHours(endHours, endMinutes);

    onConfirm({
      title,
      start,
      end,
      color,
      type: 'event' as const
    });

    setTitle("");
    setStartTime("09:00");
    setEndTime("10:00");
    setColor("#3174ad");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">Crear Evento Especial</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título del Evento</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Hora de inicio</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">Hora de fin</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="color">Color del evento</Label>
            <Input
              id="color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Crear Evento</Button>
          </div>
        </form>
      </div>
    </div>
  );
} 