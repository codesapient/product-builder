import { Button, Icon, Text } from "@shopify/polaris";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DeleteIcon,
  DragHandleIcon,
  DuplicateIcon,
} from "@shopify/polaris-icons";

export default function SortableAccordionHeader({
  title,
  expanded,
  onToggle,
  onDuplicate,
  onDelete,
  dragAttributes,
  dragListeners,
  controlsId,
  leadingIcon,
  leadingIconTone = "subdued",
  titleAs = "h3",
  titleTone,
  toggleAccessibilityLabel,
  duplicateAccessibilityLabel,
  deleteAccessibilityLabel,
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div
        {...dragAttributes}
        {...dragListeners}
        style={{
          cursor: "grab",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <Icon source={DragHandleIcon} tone="subdued" />
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={controlsId}
        style={{
          appearance: "none",
          background: "transparent",
          border: 0,
          color: "inherit",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          flex: 1,
          minWidth: 0,
          padding: 0,
          textAlign: "left",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            minWidth: 0,
          }}
        >
          {leadingIcon && <Icon source={leadingIcon} tone={leadingIconTone} />}
          <Text variant="headingSm" as={titleAs} tone={titleTone}>
            {title}
          </Text>
        </span>
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Button
          variant="plain"
          icon={expanded ? ChevronUpIcon : ChevronDownIcon}
          onClick={onToggle}
          accessibilityLabel={toggleAccessibilityLabel}
        />
        {onDuplicate && (
          <Button
            variant="plain"
            icon={DuplicateIcon}
            onClick={onDuplicate}
            accessibilityLabel={duplicateAccessibilityLabel}
          />
        )}
        <Button
          variant="plain"
          tone="critical"
          icon={DeleteIcon}
          onClick={onDelete}
          accessibilityLabel={deleteAccessibilityLabel}
        />
      </div>
    </div>
  );
}
