'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    TradingView: any;
  }
}

export function GoldChart() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (container.current) {
        new window.TradingView.widget({
          container_id: 'tradingview_chart',
          symbol: 'OANDA:XAUUSD', // Gold symbol
          interval: 'D',
          timezone: 'Asia/Bangkok',
          theme: 'light',
          style: '1',
          locale: 'th_TH',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          save_image: false,
          height: 500,
          width: '100%',
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <div className="w-full">
      <div id="tradingview_chart" ref={container} />
    </div>
  );
}