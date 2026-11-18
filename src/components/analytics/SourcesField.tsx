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
        placeholder="justjoin.it"
        defaultValue={defaultValue.join(', ')}
      />
    </label>
  )
}
