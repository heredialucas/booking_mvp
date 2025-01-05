interface CalendarContextMenuProps {
  position: { x: number; y: number } | null;
  onClose: () => void;
  onCreateEvent: () => void;
  onViewDay: () => void;
  onViewWeek: () => void;
}

export default function CalendarContextMenu({
  position,
  onClose,
  onCreateEvent,
  onViewDay,
  onViewWeek
}: CalendarContextMenuProps) {
  if (!position) return null;

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div
      className="context-menu fixed z-50 bg-white rounded-lg shadow-lg py-1 w-48"
      style={{ top: position.y, left: position.x }}
    >
      <button
        className="w-full px-4 py-2 text-left hover:bg-gray-100"
        onClick={() => handleAction(onViewDay)}
      >
        Ver día
      </button>
      <button
        className="w-full px-4 py-2 text-left hover:bg-gray-100"
        onClick={() => handleAction(onViewWeek)}
      >
        Ver semana
      </button>
      <button
        className="w-full px-4 py-2 text-left hover:bg-gray-100"
        onClick={() => handleAction(onCreateEvent)}
      >
        Crear evento
      </button>
    </div>
  );
} 