// app/features/sections/components/DeleteSectionModal.jsx

import { Modal, Text } from '@shopify/polaris'

export default function DeleteSectionModal({ open, onClose, onConfirm, sectionType }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete section?"
      primaryAction={{
        content: 'Delete',
        tone: 'critical',
        onAction: onConfirm,
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <Text as="p">
          Are you sure you want to delete this {sectionType === 'image' ? 'image' : 'video'} section?
          This action cannot be undone.
        </Text>
      </Modal.Section>
    </Modal>
  )
}