import { Card, BlockStack } from '@shopify/polaris'

export default function DropZoneIndicator() {
  return (
    <div
      style={{
        borderTop: '3px dashed rgb(34, 134, 255)',
        borderRadius: '4px',
        padding: '12px',
        backgroundColor: 'rgba(34, 134, 255, 0.05)',
        textAlign: 'center',
        fontSize: '12px',
        color: 'rgb(34, 134, 255)',
        fontWeight: 500,
      }}
    >
      Drop here to insert section
    </div>
  )
}
