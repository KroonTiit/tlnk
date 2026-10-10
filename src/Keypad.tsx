import { forwardRef } from 'react'

interface KeypadProps {
  tab: 'exchange' | 'history'
}

interface KeypadButton {
  label: string
  testId: string
  historyOnly?: boolean
}

const ROWS: KeypadButton[][] = [
  [
    { label: 'C', testId: 'key-clear' },
    { label: '⌫', testId: 'key-backspace' },
    { label: 'm', testId: 'key-save' },
  ],
  [
    { label: '7', testId: 'key-7' },
    { label: '8', testId: 'key-8' },
    { label: '9', testId: 'key-9' },
    { label: '▲', testId: 'key-up', historyOnly: true },
  ],
  [
    { label: '4', testId: 'key-4' },
    { label: '5', testId: 'key-5' },
    { label: '6', testId: 'key-6' },
    { label: '▼', testId: 'key-down', historyOnly: true },
  ],
  [
    { label: '1', testId: 'key-1' },
    { label: '2', testId: 'key-2' },
    { label: '3', testId: 'key-3' },
    { label: 'OK', testId: 'key-ok', historyOnly: true },
  ],
  [
    { label: '00', testId: 'key-00' },
    { label: '0', testId: 'key-0' },
    { label: '.', testId: 'key-dot' },
  ],
]

const DISABLED_ON_HISTORY = new Set([
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '.', 'm',
])

function keyClass(label: string): string {
  const base =
    'h-16 w-full text-3xl font-normal transition-opacity disabled:cursor-default disabled:opacity-30'

  switch (label) {
    case 'C':
      return `${base} text-red-600`
    case '⌫':
      return `${base} text-violet-400`
    case '▲':
    case '▼':
    case 'OK':
      return 'mx-auto block h-10 w-10 rounded-lg bg-slate-500 text-base font-semibold text-white active:bg-slate-600'
    default:
      return `${base} active:opacity-60`
  }
}

const Keypad = forwardRef<HTMLTableElement, KeypadProps>(({ tab }, ref) => {
  return (
    <table ref={ref} className="w-full table-fixed border-collapse">
      <colgroup>
        <col className="w-1/4" />
        <col className="w-1/4" />
        <col className="w-1/4" />
        <col className="w-1/4" />
      </colgroup>
      <tbody>
      {ROWS.map((row, i) => (
        <tr key={i}>
          {row.map((button) => {
            if (button.historyOnly && tab !== 'history') {
              return null
            }
            const disabled = tab === 'history' && DISABLED_ON_HISTORY.has(button.label)
            return (
              <td key={button.label} className="p-0 text-center">
                <button
                  type="button"
                  data-testid={button.testId}
                  disabled={disabled}
                  className={keyClass(button.label)}
                >
                  {button.label}
                </button>
              </td>
            )
          })}
        </tr>
      ))}
      </tbody>
    </table>
  )
})

Keypad.displayName = 'Keypad'

export default Keypad
