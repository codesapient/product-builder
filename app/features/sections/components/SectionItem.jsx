// app/features/sections/components/SectionItem.jsx

import { useState, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, BlockStack, Collapsible } from "@shopify/polaris";

import { getSectionMeta } from "../sectionRegistry";
import { getSectionSubtitle } from "../utils";
import DeleteSectionModal from "../../../components/DeleteSectionModal";
import SortableAccordionHeader from "./SortableAccordionHeader";

export default function SectionItem({
  section,
  onUpdate,
  onRemove,
  onDuplicate,
  savedTrigger,
  validationTrigger,
  hasValidationError,
}) {
  const [expanded, setExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Collapse section when saved
  useEffect(() => {
    setExpanded(false);
  }, [savedTrigger]);

  useEffect(() => {
    if (hasValidationError) {
      setExpanded(true);
    }
  }, [validationTrigger, hasValidationError]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // ── Everything type-specific comes from the registry ─────────────────────
  const {
    label,
    icon,
    tone,
    component: SectionComponent,
  } = getSectionMeta(section.type);

  const subtitle = getSectionSubtitle(section);

  return (
    <div ref={setNodeRef} style={style}>
      <Card>
        <BlockStack gap="300">
          <SortableAccordionHeader
            title={label}
            subtitle={subtitle}
            expanded={expanded}
            onToggle={() => setExpanded((v) => !v)}
            onDuplicate={() => onDuplicate(section.id)}
            onDelete={() => setShowDeleteModal(true)}
            dragAttributes={attributes}
            dragListeners={listeners}
            controlsId={`section-${section.id}`}
            leadingIcon={icon}
            leadingIconTone={tone}
            toggleAccessibilityLabel="Toggle section"
            duplicateAccessibilityLabel="Duplicate section"
            deleteAccessibilityLabel="Remove section"
          />

          <Collapsible open={expanded} id={`section-${section.id}`}>
            <SectionComponent
              section={section}
              onChange={(changes) => onUpdate(section.id, changes)}
              onSaved={savedTrigger}
              onValidate={validationTrigger}
            />
          </Collapsible>
        </BlockStack>
      </Card>

      <DeleteSectionModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          onRemove(section.id);
          setShowDeleteModal(false);
        }}
        sectionType={section.type}
      />
    </div>
  );
}
