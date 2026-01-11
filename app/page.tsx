'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart, IChartApi, ISeriesApi, CandlestickData, LineData } from 'lightweight-charts'

interface MASettings {
  period: number
  type: 'SMA' | 'EMA' | 'WMA'
  color: string
  enabled: boolean
}

export default function Home() {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const ma1SeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const ma2SeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const ma3SeriesRef = useRef<ISeriesApi<'Line'> | null>(null)

  const [ma1, setMa1] = useState<MASettings>({ period: 20, type: 'SMA', color: '#2962FF', enabled: true })
  const [ma2, setMa2] = useState<MASettings>({ period: 50, type: 'SMA', color: '#FF6D00', enabled: true })
  const [ma3, setMa3] = useState<MASettings>({ period: 200, type: 'SMA', color: '#00E676', enabled: true })

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 600,
      layout: {
        background: { color: '#0a0e27' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#1e222d' },
        horzLines: { color: '#1e222d' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#2B2B43',
      },
      timeScale: {
        borderColor: '#2B2B43',
        timeVisible: true,
        secondsVisible: false,
      },
    })

    chartRef.current = chart

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    })

    candlestickSeriesRef.current = candlestickSeries

    const ma1Series = chart.addLineSeries({
      color: ma1.color,
      lineWidth: 2,
      title: `MA${ma1.period}`,
    })
    ma1SeriesRef.current = ma1Series

    const ma2Series = chart.addLineSeries({
      color: ma2.color,
      lineWidth: 2,
      title: `MA${ma2.period}`,
    })
    ma2SeriesRef.current = ma2Series

    const ma3Series = chart.addLineSeries({
      color: ma3.color,
      lineWidth: 2,
      title: `MA${ma3.period}`,
    })
    ma3SeriesRef.current = ma3Series

    // Generate sample data
    const data = generateSampleData(300)
    candlestickSeries.setData(data)

    // Calculate and set MA data
    updateMAData(data, ma1, ma1Series)
    updateMAData(data, ma2, ma2Series)
    updateMAData(data, ma3, ma3Series)

    chart.timeScale().fitContent()

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [])

  useEffect(() => {
    if (!candlestickSeriesRef.current) return

    const data = candlestickSeriesRef.current.data() as CandlestickData[]

    if (ma1SeriesRef.current) {
      ma1SeriesRef.current.applyOptions({
        color: ma1.color,
        title: `${ma1.type}${ma1.period}`,
        visible: ma1.enabled,
      })
      updateMAData(data, ma1, ma1SeriesRef.current)
    }

    if (ma2SeriesRef.current) {
      ma2SeriesRef.current.applyOptions({
        color: ma2.color,
        title: `${ma2.type}${ma2.period}`,
        visible: ma2.enabled,
      })
      updateMAData(data, ma2, ma2SeriesRef.current)
    }

    if (ma3SeriesRef.current) {
      ma3SeriesRef.current.applyOptions({
        color: ma3.color,
        title: `${ma3.type}${ma3.period}`,
        visible: ma3.enabled,
      })
      updateMAData(data, ma3, ma3SeriesRef.current)
    }
  }, [ma1, ma2, ma3])

  return (
    <main style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px', fontSize: '28px', fontWeight: 'bold' }}>
        MT5 Moving Average Indicator
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <MAControl
          label="MA 1"
          settings={ma1}
          onChange={setMa1}
        />
        <MAControl
          label="MA 2"
          settings={ma2}
          onChange={setMa2}
        />
        <MAControl
          label="MA 3"
          settings={ma3}
          onChange={setMa3}
        />
      </div>

      <div
        ref={chartContainerRef}
        style={{
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
        }}
      />

      <div style={{ marginTop: '20px', padding: '15px', background: '#1a1e2e', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>About Moving Averages</h3>
        <p style={{ lineHeight: '1.6', color: '#b0b0b0' }}>
          <strong>SMA (Simple Moving Average):</strong> Average price over the specified period.<br />
          <strong>EMA (Exponential Moving Average):</strong> Weighted average giving more importance to recent prices.<br />
          <strong>WMA (Weighted Moving Average):</strong> Linear weighted average with more weight on recent prices.
        </p>
      </div>
    </main>
  )
}

function MAControl({ label, settings, onChange }: {
  label: string
  settings: MASettings
  onChange: (settings: MASettings) => void
}) {
  return (
    <div style={{
      padding: '15px',
      background: '#1a1e2e',
      borderRadius: '8px',
      border: '1px solid #2B2B43'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{label}</h3>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => onChange({ ...settings, enabled: e.target.checked })}
            style={{ marginRight: '8px', cursor: 'pointer' }}
          />
          <span>Enabled</span>
        </label>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#b0b0b0' }}>
          Period: {settings.period}
        </label>
        <input
          type="range"
          min="5"
          max="200"
          value={settings.period}
          onChange={(e) => onChange({ ...settings, period: parseInt(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#b0b0b0' }}>
          Type
        </label>
        <select
          value={settings.type}
          onChange={(e) => onChange({ ...settings, type: e.target.value as 'SMA' | 'EMA' | 'WMA' })}
          style={{
            width: '100%',
            padding: '8px',
            background: '#0a0e27',
            color: '#e0e0e0',
            border: '1px solid #2B2B43',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          <option value="SMA">SMA</option>
          <option value="EMA">EMA</option>
          <option value="WMA">WMA</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#b0b0b0' }}>
          Color
        </label>
        <input
          type="color"
          value={settings.color}
          onChange={(e) => onChange({ ...settings, color: e.target.value })}
          style={{
            width: '100%',
            height: '40px',
            border: '1px solid #2B2B43',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        />
      </div>
    </div>
  )
}

function generateSampleData(count: number): CandlestickData[] {
  const data: CandlestickData[] = []
  let basePrice = 1.1000
  const startTime = Math.floor(Date.now() / 1000) - count * 3600

  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.5) * 0.0020
    basePrice += change

    const open = basePrice
    const close = basePrice + (Math.random() - 0.5) * 0.0015
    const high = Math.max(open, close) + Math.random() * 0.0010
    const low = Math.min(open, close) - Math.random() * 0.0010

    data.push({
      time: (startTime + i * 3600) as any,
      open,
      high,
      low,
      close,
    })
  }

  return data
}

function updateMAData(
  candleData: CandlestickData[],
  settings: MASettings,
  series: ISeriesApi<'Line'>
) {
  if (!settings.enabled || candleData.length === 0) {
    series.setData([])
    return
  }

  const maData: LineData[] = []

  for (let i = settings.period - 1; i < candleData.length; i++) {
    let value: number

    if (settings.type === 'SMA') {
      let sum = 0
      for (let j = 0; j < settings.period; j++) {
        sum += candleData[i - j].close
      }
      value = sum / settings.period
    } else if (settings.type === 'EMA') {
      const multiplier = 2 / (settings.period + 1)
      if (i === settings.period - 1) {
        let sum = 0
        for (let j = 0; j < settings.period; j++) {
          sum += candleData[j].close
        }
        value = sum / settings.period
      } else {
        const prevEMA = maData[maData.length - 1]?.value ?? candleData[i].close
        value = (candleData[i].close - prevEMA) * multiplier + prevEMA
      }
    } else { // WMA
      let sum = 0
      let weightSum = 0
      for (let j = 0; j < settings.period; j++) {
        const weight = settings.period - j
        sum += candleData[i - j].close * weight
        weightSum += weight
      }
      value = sum / weightSum
    }

    maData.push({
      time: candleData[i].time as any,
      value,
    })
  }

  series.setData(maData)
}
