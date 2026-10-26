interface SourcesFieldProps {
  defaultValue?: string[]
  label?: string
}

/**
 * Optional source scope. Values are comma/space separated in the input and
 * sent as repeated `sources` parameters, matching the backend contract.
 */
export function SourcesField({
  defaultValue = [],
  label = 'Sources',
}: SourcesFieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="text"
        name="sources"
        placeholder="e.g. JUST_JOIN_IT, THE_PROTOCOL_IT"
        defaultValue={defaultValue.join(', ')}
      />
      <span className="field__hint field__hint--muted">
        Optional. Comma-separated, sent as repeated parameters.
      </span>
    </label>
  )
}
