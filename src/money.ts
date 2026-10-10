export function parseAmount(value: string): number {
  return parseFloat(value.replace(/,/g, ''))
}
export function convert(amount: number, rate: string): number {
  return amount * parseAmount(rate)
}

export function formatMoney(value: number): string {
  const [intPart, fracPart] = value.toFixed(2).split('.')
  const withThousands = Number(intPart).toLocaleString('en-US')
  const trimmedFrac = fracPart.replace(/0+$/, '')
  return trimmedFrac ? `${withThousands}.${trimmedFrac}` : withThousands
}
