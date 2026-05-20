import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import {
  CollectionIcon,
  PageIcon,
  ProductIcon,
  SearchIcon,
} from '@shopify/polaris-icons'

import {
  Button,
  Spinner,
  Text,
  TextField,
} from '@shopify/polaris'

const RESOURCE_TYPE_META = {
  Product: {
    label: 'Products',
    icon: ProductIcon,
  },

  Collection: {
    label: 'Collections',
    icon: CollectionIcon,
  },

  Page: {
    label: 'Pages',
    icon: PageIcon,
  },
}

function deriveUrl(
  resource,
  resourceType,
  storeUrl
) {

  const base =
    storeUrl?.replace(/\/$/, '') ?? ''

  switch (resourceType) {

    case 'Product':
      return `${base}/products/${resource.handle}`

    case 'Collection':
      return `${base}/collections/${resource.handle}`

    case 'Page':
      return `${base}/pages/${resource.handle}`

    default:
      return ''
  }
}


function PickerRow({
  PolarisIcon,
  emoji,
  label,
  sublabel,
  onClick,
  chevron,
}) {

  const [hovered, setHovered] = useState(false)

  return (
    <button
      type="button"

      onClick={onClick}

      onMouseEnter={() =>
        setHovered(true)
      }

      onMouseLeave={() =>
        setHovered(false)
      }

      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '10px 14px',
        background: hovered ? 'var(--p-color-bg-surface-hover)' : 'transparent',
        border: 'none',
        borderBottom:
          '1px solid var(--p-color-border-subdued)',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >

      <span
        style={{
          color: 'var(--p-color-icon)',

          flexShrink: 0,

          display: 'flex',
          alignItems: 'center',
        }}
      >

        {PolarisIcon
          ? <PolarisIcon width={16} height={16} />
          : emoji}

      </span>

      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >

        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color:
              'var(--p-color-text)',
            whiteSpace: 'nowrap',
            overflow: 'visible',
            textOverflow: 'ellipsis',
          }}
        >
          {label}
        </div>

        {sublabel && (

          <div
            style={{
              fontSize: 12,

              color:
                'var(--p-color-text-subdued)',
            }}
          >
            {sublabel}
          </div>

        )}

      </div>

      {chevron && (

        <span
          style={{
            color:
              'var(--p-color-icon-subdued)',

            fontSize: 14,
          }}
        >
          ›
        </span>

      )}

    </button>
  )
}

function UrlPicker({
  storeUrl,
  value,
  onChange,
  fetcher,
}) {

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeType, setActiveType] = useState(null)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })

  const wrapperRef = useRef(null)
  const dropdownRef = useRef(null)

  const isSearching =
    fetcher.state !== 'idle'

  const results =
    fetcher.data?.intent === 'searchResources'
      ? fetcher.data.results
      : []

  useEffect(() => {

    const handler = (e) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)  // ← add this
      ) {
        setOpen(false)
        setQuery('')
        setActiveType(null)
      }
    }

    document.addEventListener(
      'mousedown',
      handler
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handler
      )
    }

  }, [])

  useEffect(() => {
    if (!open) return
    const update = () => {
      const rect = wrapperRef.current?.getBoundingClientRect()
      if (rect) setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    }
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open])

  const handleFocus = () => {
    setOpen(true)
    const rect = wrapperRef.current?.getBoundingClientRect()
    if (rect) setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
  }

  const handleQueryChange = (val) => {
    setQuery(val)

    if (activeType) {

      fetcher.submit(
        {
          intent: 'searchResources',
          query: val,
          resourceType: activeType,
        },
        {
          method: 'POST',
        }
      )
    }
  }

  const drillInto = (type) => {
    setActiveType(type)
    setQuery('')
  
    fetcher.submit(
      {
        intent: 'searchResources',
        query: '',
        resourceType: type,
      },
      {
        method: 'POST',
      }
    )
  }

  const goBack = () => {
    setActiveType(null)
    setQuery('')
  }

  const selectResult = (resource) => {

    onChange(
      deriveUrl(
        resource,
        activeType,
        storeUrl
      )
    )

    setOpen(false)

    setQuery('')

    setActiveType(null)
  }

  const selectManual = () => {

    onChange(query)

    setOpen(false)

    setQuery('')

    setActiveType(null)
  }

  const TypeIcon =
    activeType
      ? RESOURCE_TYPE_META[activeType]?.icon
      : SearchIcon

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'relative' }}
    >
      <TextField
        label="Badge URL"
        placeholder="Paste a link or search"
        value={open ? query : (value ?? '')}
        onChange={handleQueryChange}
        onFocus={handleFocus}
        autoComplete="off"
        prefix={<TypeIcon />}
        connectedRight={
          value && !open
            ? (
              <Button
                variant="plain"
                tone="critical"
                onClick={() => onChange('')}
              >
                Clear
              </Button>
            )
            : undefined
        }
      />

      {open && createPortal(
        <div
         ref={dropdownRef}
          style={{
            position: 'fixed',
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
            zIndex: 99999,
            background: 'var(--p-color-bg-surface)',
            border: '1px solid var(--p-color-border)',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderBottom: '1px solid var(--p-color-border-subdued)',
              background: 'var(--p-color-bg-surface-secondary)',
            }}
          >
            {activeType ? (
              <button
                type="button"
                onClick={goBack}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--p-color-text-emphasis)',
                  fontSize: 13,
                  fontWeight: 500,
                  padding: 0,
                }}
              >
                ← Back
              </button>
            ) : (
              <Text variant="bodySm" tone="subdued">
                Search or paste a link
              </Text>
            )}

            {activeType && (
              <Text variant="bodySm" tone="subdued">
                {isSearching
                  ? 'Searching…'
                  : `${results.length} result${results.length !== 1 ? 's' : ''}`}
              </Text>
            )}
          </div>

          {/* Root */}
          {!activeType && (
            <div>
              {query.length > 0 && (
                <PickerRow
                  emoji="🔗"
                  label={query}
                  sublabel="Use this URL"
                  onClick={selectManual}
                />
              )}
              {Object.entries(RESOURCE_TYPE_META).map(([type, meta]) => (
                <PickerRow
                  key={type}
                  PolarisIcon={meta.icon}
                  label={meta.label}
                  onClick={() => drillInto(type)}
                  chevron
                />
              ))}
            </div>
          )}

          {/* Results */}
          {activeType && (
            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
              {isSearching && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
                  <Spinner size="small" />
                </div>
              )}
              {!isSearching && results.length === 0 && (
                <div style={{ padding: '12px 14px', color: 'var(--p-color-text-subdued)', fontSize: 14 }}>
                  No results found.
                </div>
              )}
              {!isSearching && results.map((result) => (
                <PickerRow
                  key={result.id}
                  PolarisIcon={RESOURCE_TYPE_META[activeType]?.icon}
                  label={result.title}
                  sublabel={`/${result.handle}`}
                  onClick={() => selectResult(result)}
                />
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}

export default UrlPicker