import React, { useState, useEffect } from 'react';
import { Badge } from './badge';
import { usePerformance } from '@/hooks/usePerformance';

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    domContentLoaded: 0,
    firstContentfulPaint: 0,
  });
  const { connectionSpeed, isOnline } = usePerformance();

  useEffect(() => {
    // Measure page load performance
    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      if (navigation) {
        setMetrics({
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        });
      }
    };

    // Wait for page to fully load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  const getPerformanceColor = (time: number) => {
    if (time < 1000) return 'bg-green-500';
    if (time < 3000) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConnectionColor = () => {
    switch (connectionSpeed) {
      case 'fast': return 'bg-green-500';
      case 'slow': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-sm border border-border/20 rounded-lg p-3 shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className="text-xs">
          📊 Performance
        </Badge>
        <Badge 
          className={`text-xs text-white ${getConnectionColor()}`}
        >
          {isOnline ? '🟢 Online' : '🔴 Offline'}
        </Badge>
      </div>
      
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Load:</span>
          <Badge className={`text-white ${getPerformanceColor(metrics.loadTime)}`}>
            {Math.round(metrics.loadTime)}ms
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>DOM:</span>
          <Badge className={`text-white ${getPerformanceColor(metrics.domContentLoaded)}`}>
            {Math.round(metrics.domContentLoaded)}ms
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>FCP:</span>
          <Badge className={`text-white ${getPerformanceColor(metrics.firstContentfulPaint)}`}>
            {Math.round(metrics.firstContentfulPaint)}ms
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>Connection:</span>
          <Badge className="text-xs">
            {connectionSpeed === 'fast' ? '🚀 Fast' : connectionSpeed === 'slow' ? '🐌 Slow' : '❓ Unknown'}
          </Badge>
        </div>
      </div>
    </div>
  );
}