#!/usr/bin/env node

/**
 * Performance Monitoring System
 * Tracks and optimizes bot performance in real-time
 */

class PerformanceMonitor {
  constructor() {
    this.stats = {
      requests: 0,
      avgResponseTime: 0,
      memoryUsage: 0,
      startTime: Date.now(),
      peakMemory: 0,
      slowRequests: 0,
      errors: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    
    this.requestTimes = [];
    this.memoryHistory = [];
    this.errorLog = [];
    this.performanceAlerts = [];
    
    // Performance thresholds
    this.thresholds = {
      responseTime: 1000, // 1 second
      memoryUsage: 200, // 200 MB
      errorRate: 0.05, // 5%
      queueSize: 50
    };
    
    this.startMonitoring();
  }
  
  // Start monitoring
  startMonitoring() {
    // Memory monitoring every 30 seconds
    setInterval(() => {
      this.updateMemoryStats();
    }, 30 * 1000);
    
    // Performance stats every minute
    setInterval(() => {
      this.logPerformanceStats();
    }, 60 * 1000);
    
    // Cleanup old data every 5 minutes
    setInterval(() => {
      this.cleanupOldData();
    }, 5 * 60 * 1000);
    
    console.log('📊 Performance monitoring started');
  }
  
  // Track request performance
  trackRequest(startTime, endTime, success = true) {
    const responseTime = endTime - startTime;
    
    this.stats.requests++;
    this.stats.avgResponseTime = 
      (this.stats.avgResponseTime * (this.stats.requests - 1) + responseTime) / this.stats.requests;
    
    // Track slow requests
    if (responseTime > this.thresholds.responseTime) {
      this.stats.slowRequests++;
      this.performanceAlerts.push({
        type: 'SLOW_REQUEST',
        responseTime,
        timestamp: new Date().toISOString()
      });
    }
    
    // Track errors
    if (!success) {
      this.stats.errors++;
    }
    
    // Store request time for analysis
    this.requestTimes.push({
      responseTime,
      timestamp: Date.now(),
      success
    });
    
    // Keep only last 1000 requests
    if (this.requestTimes.length > 1000) {
      this.requestTimes.shift();
    }
  }
  
  // Track cache performance
  trackCacheHit() {
    this.stats.cacheHits++;
  }
  
  trackCacheMiss() {
    this.stats.cacheMisses++;
  }
  
  // Update memory statistics
  updateMemoryStats() {
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    
    this.stats.memoryUsage = heapUsedMB;
    
    if (heapUsedMB > this.stats.peakMemory) {
      this.stats.peakMemory = heapUsedMB;
    }
    
    // Track memory history
    this.memoryHistory.push({
      heapUsed: heapUsedMB,
      timestamp: Date.now()
    });
    
    // Keep only last 100 memory readings
    if (this.memoryHistory.length > 100) {
      this.memoryHistory.shift();
    }
    
    // Alert if memory usage is high
    if (heapUsedMB > this.thresholds.memoryUsage) {
      this.performanceAlerts.push({
        type: 'HIGH_MEMORY',
        memoryUsage: heapUsedMB,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  // Log performance statistics
  logPerformanceStats() {
    const uptime = Math.floor((Date.now() - this.stats.startTime) / 1000);
    const errorRate = this.stats.requests > 0 ? this.stats.errors / this.stats.requests : 0;
    const cacheHitRate = (this.stats.cacheHits + this.stats.cacheMisses) > 0 ? 
      this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses) : 0;
    
    console.log(`📊 Performance Stats:`, {
      requests: this.stats.requests,
      avgResponseTime: this.stats.avgResponseTime.toFixed(2) + 'ms',
      memoryUsage: this.stats.memoryUsage.toFixed(2) + 'MB',
      peakMemory: this.stats.peakMemory.toFixed(2) + 'MB',
      errorRate: (errorRate * 100).toFixed(2) + '%',
      cacheHitRate: (cacheHitRate * 100).toFixed(2) + '%',
      slowRequests: this.stats.slowRequests,
      uptime: uptime + 's'
    });
    
    // Log alerts if any
    if (this.performanceAlerts.length > 0) {
      console.log('⚠️ Performance Alerts:', this.performanceAlerts.slice(-5));
    }
  }
  
  // Get performance report
  getPerformanceReport() {
    const uptime = Math.floor((Date.now() - this.stats.startTime) / 1000);
    const errorRate = this.stats.requests > 0 ? this.stats.errors / this.stats.requests : 0;
    const cacheHitRate = (this.stats.cacheHits + this.stats.cacheMisses) > 0 ? 
      this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses) : 0;
    
    // Calculate percentiles
    const responseTimes = this.requestTimes.map(r => r.responseTime).sort((a, b) => a - b);
    const p50 = responseTimes[Math.floor(responseTimes.length * 0.5)] || 0;
    const p95 = responseTimes[Math.floor(responseTimes.length * 0.95)] || 0;
    const p99 = responseTimes[Math.floor(responseTimes.length * 0.99)] || 0;
    
    return {
      summary: {
        totalRequests: this.stats.requests,
        avgResponseTime: this.stats.avgResponseTime,
        p50ResponseTime: p50,
        p95ResponseTime: p95,
        p99ResponseTime: p99,
        currentMemoryUsage: this.stats.memoryUsage,
        peakMemoryUsage: this.stats.peakMemory,
        errorRate: errorRate,
        cacheHitRate: cacheHitRate,
        slowRequests: this.stats.slowRequests,
        uptime: uptime
      },
      alerts: this.performanceAlerts.slice(-10),
      recommendations: this.getRecommendations()
    };
  }
  
  // Get performance recommendations
  getRecommendations() {
    const recommendations = [];
    
    if (this.stats.avgResponseTime > 500) {
      recommendations.push('🔧 Consider implementing request queuing to reduce response times');
    }
    
    if (this.stats.memoryUsage > 150) {
      recommendations.push('🧹 Implement more aggressive memory cleanup');
    }
    
    if (this.stats.cacheHitRate < 0.7) {
      recommendations.push('💾 Increase cache duration or add more caching layers');
    }
    
    if (this.stats.errorRate > 0.02) {
      recommendations.push('🛠️ Review error handling and add more robust error recovery');
    }
    
    if (this.stats.slowRequests > this.stats.requests * 0.1) {
      recommendations.push('⚡ Optimize file operations and database queries');
    }
    
    return recommendations;
  }
  
  // Cleanup old data
  cleanupOldData() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    // Clean old request times
    this.requestTimes = this.requestTimes.filter(req => 
      now - req.timestamp < oneHour
    );
    
    // Clean old memory history
    this.memoryHistory = this.memoryHistory.filter(mem => 
      now - mem.timestamp < oneHour
    );
    
    // Clean old alerts (keep last 50)
    if (this.performanceAlerts.length > 50) {
      this.performanceAlerts = this.performanceAlerts.slice(-50);
    }
    
    // Clean old error log (keep last 100)
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }
  }
  
  // Track error
  trackError(error, context = '') {
    this.errorLog.push({
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }
  
  // Get memory trend
  getMemoryTrend() {
    if (this.memoryHistory.length < 2) return 'stable';
    
    const recent = this.memoryHistory.slice(-10);
    const first = recent[0].heapUsed;
    const last = recent[recent.length - 1].heapUsed;
    
    if (last > first * 1.1) return 'increasing';
    if (last < first * 0.9) return 'decreasing';
    return 'stable';
  }
  
  // Check if performance is healthy
  isPerformanceHealthy() {
    return (
      this.stats.avgResponseTime < this.thresholds.responseTime &&
      this.stats.memoryUsage < this.thresholds.memoryUsage &&
      this.stats.errors / Math.max(this.stats.requests, 1) < this.thresholds.errorRate
    );
  }
  
  // Reset statistics
  resetStats() {
    this.stats = {
      requests: 0,
      avgResponseTime: 0,
      memoryUsage: 0,
      startTime: Date.now(),
      peakMemory: 0,
      slowRequests: 0,
      errors: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    
    this.requestTimes = [];
    this.memoryHistory = [];
    this.errorLog = [];
    this.performanceAlerts = [];
    
    console.log('🔄 Performance statistics reset');
  }
}

module.exports = PerformanceMonitor;
