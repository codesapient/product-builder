import { useDraggable } from '@dnd-kit/core'
import { Button, Icon, InlineStack } from '@shopify/polaris'
import { PlusIcon } from '@shopify/polaris-icons'

export default function DraggableAddButton({ type, label, icon: SectionIcon, tone, onClickAdd }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `add-${type}`,
    data: { type, isAddButton: true },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <Button
        fullWidth
        icon={SectionIcon}
        onClick={() => !isDragging && onClickAdd(type)}
        textAlign="left"
        pressed={isDragging} // subtle pressed state while dragging
      >
        <span style={{ paddingBlock: '4px', display: 'block' }}>
          {label}
        </span>
      </Button>
    </div>
  )
}