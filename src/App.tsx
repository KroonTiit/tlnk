import { useEffect, useRef, useState } from 'react'
import Keypad from './Keypad'
import { initialHistory, type HistoryRecord } from './history'
import { convert, formatMoney, parseAmount } from './money'
import HistoryRow from "./HistoryRow.tsx";

type Tab = 'exchange' | 'history'

interface RatesResponse {
  base: string
  currencies: string[]
  rates: Record<string, string>
  updatedAt: string
}

interface Quote {
  quoteId: string
  from: string
  to: string
  rate: string
  amount: number
  createdAt: string
  expiresAt: string
}


export default function App() {
  const [tab, setTab] = useState<Tab>('exchange')
  const [amount, setAmount] = useState('0')
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('USD')
  const [currencies, setCurrencies] = useState<string[]>([])
  const [quote, setQuote] = useState<Quote | null>(null)
  const [result, setResult] = useState('0')
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [history, setHistory] = useState<HistoryRecord[]>(initialHistory)
  const [selected, setSelected] = useState(0)

  const listRef = useRef<HTMLUListElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)

  useEffect(() => {
    fetch('/api/rates')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load rates: ${res.status}`)
        return res.json()
      })
      .then((data: RatesResponse) => {
        setCurrencies(data.currencies)
        setFrom(data.currencies[0])
        setTo(data.currencies[1])

      })
      .catch((err) => console.error(err))
  }, [])

  useEffect(() => {
    setLoading(true)

    const controller = new AbortController()

    const timer = setTimeout(() => {
      if(amount !== '0') {
        fetch('/api/quote', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({from, to, amount: parseAmount(amount)}),
        })
          .then((res) => {
            if (!res.ok) throw new Error(`Quote request failed: ${res.status}`)
            return res.json()
          })
          .then((data: Quote) => {
            setQuote(data)
            setResult(formatMoney(convert(data.amount, data.rate)))
            setLoading(false)
          })
          .catch((err) => {
            if (err.name === 'AbortError') return // cancelled on purpose
            console.error(err)
            setLoading(false)
          })
      } else {
        setResult('0')
      }
  }, 400)
  return () => {
    clearTimeout(timer)
    controller.abort()
    }
}, [amount, from, to, refresh])

  useEffect(() => {
    if (tab !== 'history') return
    const list = listRef.current
    const row = list?.children[selected] as HTMLElement | undefined
    if (!list || !row) return

    const listRect = list.getBoundingClientRect()
    const rowRect = row.getBoundingClientRect()

    if (rowRect.top < listRect.top) {
      list.scrollTop -= listRect.top - rowRect.top
    } else if (rowRect.bottom > listRect.bottom) {
      list.scrollTop += rowRect.bottom - listRect.bottom
    }
  }, [selected, tab, history.length])

  useEffect(() => {
    const table = tableRef.current
    if (!table) return

    const handler = (e: MouseEvent) => {
      const label = (e.target as HTMLElement).innerText

      switch (label) {
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
        case '00':
          setAmount((prev) => (prev === '0' ? label : prev + label))
          break
        case '.':
          setAmount((prev) => (prev.includes('.') ? prev : `${prev}.`))
          break
        case '⌫':
          if (tab === 'exchange') {
            setAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'))
          } else {
            setHistory((prev) => prev.filter((_, i) => i !== selected))
          }
          break
        case 'C':
          if (tab === 'exchange') {
            setAmount('0')
          } else {
            setHistory([])
          }
          break
        case 'm':
          if (tab === 'exchange') {
            setHistory((prev) => [
              ...prev,
              { from, to, amount: formatMoney(parseAmount(amount)), result },
            ])
          }
          break
        case '▲':
          setSelected((prev) => Math.max(0, prev - 1))
          break
        case '▼':
          setSelected((prev) => Math.min(history.length - 1, prev + 1))
          break
        case 'OK': {
          const record = history[selected]
          if (record) {
            setFrom(record.from)
            setTo(record.to)
            setAmount(record.amount)
            setTab('exchange')
          }
          break
        }
        default:
          break
      }
    }

    table.addEventListener('click', handler)
    return () => table.removeEventListener('click', handler)
  }, [tab, amount, from, to])

  return (
    <div className="mx-auto flex h-screen max-w-sm flex-col bg-neutral-200 font-sans text-black">
    <div className="flex items-center justify-center pt-8 pb-4 text-base">
        <button
          type="button"
          data-testid="tab-exchange"
          onClick={() => setTab('exchange')}
          className={`px-4 ${tab === 'exchange' ? 'text-violet-600 underline underline-offset-4' : ''}`}
        >
          Exchange Rate
        </button>
        <span className="h-5 w-px bg-neutral-700" />
        <button
          type="button"
          data-testid="tab-history"
          onClick={() => setTab('history')}
          className={`px-4 ${
            tab === 'history' ? 'text-violet-600 underline underline-offset-4' : ''
          }`}
        >
          History
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-center px-6">
        {tab === 'exchange' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <select
                data-testid="from-currency"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-16 appearance-none bg-transparent text-lg outline-none"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <span className="text-4xl">›</span>
              <span data-testid="amount" className="text-3xl text-violet-600">{amount}</span>
            </div>

            <div  className="flex items-center justify-between">
              <select
                data-testid="to-currency"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-16 appearance-none bg-transparent text-lg outline-none"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <span className="text-4xl">›</span>
              <span data-testid="result" className="text-3xl">{result}</span>
            </div>
            <div className="mt-4 mb-1 flex items-center justify-center gap-2 text-[16px]">
              {loading ? (
                <span>Loading…</span>
              ) : (
                quote && (
                  <span data-testid="updated-at">
                    Last updated {quote.createdAt.split('T')[1].slice(0, 8)}
                  </span>
                )
              )}
              <button type="button" data-testid="refresh" className="font-bold" onClick={() => setRefresh((r) => r + 1)}>
                ⟳
              </button>
            </div>
          </div>
        )}


        {tab === 'history' && (
          <div className="flex flex-col gap-6">
            <ul
              ref={listRef}
              className="max-h-36 overflow-y-auto border-r-2 border-black pr-2 text-lg leading-tight">
              {history.map((record, i) => (
                <HistoryRow key={i} record={record} selected={i === selected} />
              ))}
            </ul>
            <p data-testid="history-count" className="text-center text-[10px]">{history.length} records</p>
          </div>
        )}
      </div>
      <div className="rounded-t-[2rem] bg-[#f3eeee] px-6 pb-6 pt-4">
        <Keypad ref={tableRef} tab={tab} />
      </div>
    </div>
  )
}
