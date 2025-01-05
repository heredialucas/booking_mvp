import { useTranslations } from 'next-intl';

interface CalendarContextMenuProps {
  position: { x: number; y: number } | null;
  onClose: () => void;
  onCreateEvent?: () => void;
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
  const t = useTranslations();

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
        {t('calendar.actions.view_day')}
      </button>
      <button
        className="w-full px-4 py-2 text-left hover:bg-gray-100"
        onClick={() => handleAction(onViewWeek)}
      >
        {t('calendar.actions.view_week')}
      </button>
      {onCreateEvent && (
        <button
          className="w-full px-4 py-2 text-left hover:bg-gray-100"
          onClick={() => handleAction(onCreateEvent)}
        >
          {t('calendar.actions.create_event')}
        </button>
      )}
    </div>
  );
} 