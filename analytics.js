const fs = require('fs');
const path = require('path');

class Analytics {
  constructor(botConfig) {
    this.config = botConfig;
    this.dataPath = path.join(__dirname, 'analytics_data.json');
    this.data = this.loadData();
    this.startTime = new Date();
    
    // Initialize data structure if empty
    if (!this.data) {
      this.data = {
        fileDownloads: {},
        userActivity: {},
        moduleViews: {},
        userSessions: {},
        dailyStats: {},
        weeklyStats: {},
        monthlyStats: {},
        peakUsage: {},
        geographicData: {},
        performanceMetrics: {
          responseTimes: [],
          errors: [],
          uptime: {
            startTime: this.startTime.toISOString(),
            totalUptime: 0
          }
        }
      };
      this.saveData();
    }
  }

  // Load analytics data from file
  loadData() {
    try {
      if (fs.existsSync(this.dataPath)) {
        const data = fs.readFileSync(this.dataPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
    return null;
  }

  // Save analytics data to file
  saveData() {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving analytics data:', error);
    }
  }

  // Track file download
  trackFileDownload(filePath, userId, userInfo) {
    if (!this.config.analytics.enabled || !this.config.analytics.trackFileDownloads) return;

    const fileName = path.basename(filePath);
    const timestamp = new Date().toISOString();
    
    if (!this.data.fileDownloads[fileName]) {
      this.data.fileDownloads[fileName] = {
        downloads: 0,
        users: new Set(),
        lastDownloaded: null,
        downloadHistory: []
      };
    }

    this.data.fileDownloads[fileName].downloads++;
    this.data.fileDownloads[fileName].users.add(userId);
    this.data.fileDownloads[fileName].lastDownloaded = timestamp;
    this.data.fileDownloads[fileName].downloadHistory.push({
      userId,
      userInfo,
      timestamp
    });

    // Track user activity
    this.trackUserActivity(userId, userInfo, 'file_download', fileName);
    
    this.saveData();
  }

  // Track user activity
  trackUserActivity(userId, userInfo, action, details = null) {
    if (!this.config.analytics.enabled || !this.config.analytics.trackUserActivity) return;

    const timestamp = new Date().toISOString();
    const dateKey = new Date().toISOString().split('T')[0];
    
    if (!this.data.userActivity[userId]) {
      this.data.userActivity[userId] = {
        firstSeen: timestamp,
        lastSeen: timestamp,
        totalActions: 0,
        actions: [],
        userInfo: userInfo
      };
    }

    this.data.userActivity[userId].lastSeen = timestamp;
    this.data.userActivity[userId].totalActions++;
    this.data.userActivity[userId].actions.push({
      action,
      details,
      timestamp
    });

    // Track daily stats
    if (!this.data.dailyStats[dateKey]) {
      this.data.dailyStats[dateKey] = {
        totalUsers: new Set(),
        totalActions: 0,
        fileDownloads: 0,
        moduleViews: 0,
        feedbackSent: 0,
        filesShared: 0
      };
    }

    this.data.dailyStats[dateKey].totalUsers.add(userId);
    this.data.dailyStats[dateKey].totalActions++;

    // Track specific actions
    switch (action) {
      case 'file_download':
        this.data.dailyStats[dateKey].fileDownloads++;
        break;
      case 'module_view':
        this.data.dailyStats[dateKey].moduleViews++;
        break;
      case 'feedback_sent':
        this.data.dailyStats[dateKey].feedbackSent++;
        break;
      case 'file_shared':
        this.data.dailyStats[dateKey].filesShared++;
        break;
    }

    // Track peak usage times
    const hour = new Date().getHours();
    if (!this.data.peakUsage[hour]) {
      this.data.peakUsage[hour] = 0;
    }
    this.data.peakUsage[hour]++;

    this.saveData();
  }

  // Track module view
  trackModuleView(moduleName, university, semester, userId, userInfo) {
    if (!this.config.analytics.enabled || !this.config.analytics.trackModuleViews) return;

    const moduleKey = `${university}_${semester}_${moduleName}`;
    const timestamp = new Date().toISOString();
    
    if (!this.data.moduleViews[moduleKey]) {
      this.data.moduleViews[moduleKey] = {
        views: 0,
        uniqueUsers: new Set(),
        lastViewed: null,
        viewHistory: [],
        moduleInfo: {
          name: moduleName,
          university,
          semester
        }
      };
    }

    this.data.moduleViews[moduleKey].views++;
    this.data.moduleViews[moduleKey].uniqueUsers.add(userId);
    this.data.moduleViews[moduleKey].lastViewed = timestamp;
    this.data.moduleViews[moduleKey].viewHistory.push({
      userId,
      userInfo,
      timestamp
    });

    // Track user activity
    this.trackUserActivity(userId, userInfo, 'module_view', moduleKey);
    
    this.saveData();
  }

  // Track user session
  trackUserSession(userId, sessionData) {
    if (!this.config.analytics.enabled) return;

    const timestamp = new Date().toISOString();
    
    if (!this.data.userSessions[userId]) {
      this.data.userSessions[userId] = [];
    }

    this.data.userSessions[userId].push({
      ...sessionData,
      timestamp
    });

    this.saveData();
  }

  // Track performance metrics
  trackPerformance(action, responseTime, success = true, error = null) {
    if (!this.config.analytics.enabled) return;

    const timestamp = new Date().toISOString();
    
    this.data.performanceMetrics.responseTimes.push({
      action,
      responseTime,
      timestamp
    });

    if (!success) {
      this.data.performanceMetrics.errors.push({
        action,
        error: error?.message || error,
        timestamp
      });
    }

    // Keep only last 1000 entries to prevent memory issues
    if (this.data.performanceMetrics.responseTimes.length > 1000) {
      this.data.performanceMetrics.responseTimes = this.data.performanceMetrics.responseTimes.slice(-1000);
    }
    if (this.data.performanceMetrics.errors.length > 1000) {
      this.data.performanceMetrics.errors = this.data.performanceMetrics.errors.slice(-1000);
    }

    this.saveData();
  }

  // Generate weekly report
  async generateWeeklyReport(bot) {
    if (!this.config.analytics.enabled || !this.config.analytics.generateWeeklyReports) return;

    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekEnd = now;

    const report = this.generateReport(weekStart, weekEnd, 'Weekly');
    await this.sendReport(bot, report, '📊 Weekly Analytics Report');
  }

  // Generate monthly report
  async generateMonthlyReport(bot) {
    if (!this.config.analytics.enabled || !this.config.analytics.generateMonthlyReports) return;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = now;

    const report = this.generateReport(monthStart, monthEnd, 'Monthly');
    await this.sendReport(bot, report, '📈 Monthly Analytics Report');
  }

  // Generate custom report
  generateReport(startDate, endDate, periodName) {
    const report = {
      period: periodName,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      summary: {},
      topFiles: [],
      topModules: [],
      topUsers: [],
      peakHours: [],
      performance: {}
    };

    // Calculate summary
    let totalActions = 0;
    let totalDownloads = 0;
    let totalViews = 0;
    let uniqueUsers = new Set();

    // Process daily stats
    Object.keys(this.data.dailyStats).forEach(date => {
      const dateObj = new Date(date);
      if (dateObj >= startDate && dateObj <= endDate) {
        const dayStats = this.data.dailyStats[date];
        totalActions += dayStats.totalActions;
        totalDownloads += dayStats.fileDownloads;
        totalViews += dayStats.moduleViews;
        dayStats.totalUsers.forEach(userId => uniqueUsers.add(userId));
      }
    });

    report.summary = {
      totalActions,
      totalDownloads,
      totalViews,
      uniqueUsers: uniqueUsers.size,
      averageActionsPerUser: uniqueUsers.size > 0 ? (totalActions / uniqueUsers.size).toFixed(2) : 0
    };

    // Top downloaded files
    const fileStats = Object.entries(this.data.fileDownloads)
      .map(([fileName, stats]) => ({
        fileName,
        downloads: stats.downloads,
        uniqueUsers: stats.users.size
      }))
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 10);

    report.topFiles = fileStats;

    // Top viewed modules
    const moduleStats = Object.entries(this.data.moduleViews)
      .map(([moduleKey, stats]) => ({
        moduleKey,
        moduleName: stats.moduleInfo.name,
        university: stats.moduleInfo.university,
        semester: stats.moduleInfo.semester,
        views: stats.views,
        uniqueUsers: stats.uniqueUsers.size
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    report.topModules = moduleStats;

    // Top active users
    const userStats = Object.entries(this.data.userActivity)
      .map(([userId, stats]) => ({
        userId,
        userInfo: stats.userInfo,
        totalActions: stats.totalActions,
        lastSeen: stats.lastSeen
      }))
      .sort((a, b) => b.totalActions - a.totalActions)
      .slice(0, 10);

    report.topUsers = userStats;

    // Peak usage hours
    report.peakHours = Object.entries(this.data.peakUsage)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Performance metrics
    const avgResponseTime = this.data.performanceMetrics.responseTimes.length > 0
      ? this.data.performanceMetrics.responseTimes.reduce((sum, metric) => sum + metric.responseTime, 0) / this.data.performanceMetrics.responseTimes.length
      : 0;

    report.performance = {
      averageResponseTime: avgResponseTime.toFixed(2),
      totalErrors: this.data.performanceMetrics.errors.length,
      uptime: this.calculateUptime()
    };

    return report;
  }

  // Calculate uptime
  calculateUptime() {
    const now = new Date();
    const startTime = new Date(this.data.performanceMetrics.uptime.startTime);
    const uptimeMs = now - startTime;
    const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}d ${hours}h ${minutes}m`;
  }

  // Send report to analytics channel
  async sendReport(bot, report, title) {
    try {
      const channelId = this.config.analyticsChannel;
      if (!channelId) return;

      const message = this.formatReport(report, title);
      await bot.sendMessage(channelId, message, { parse_mode: 'HTML' });
    } catch (error) {
      console.error('Error sending analytics report:', error);
    }
  }

  // Format report for Telegram
  formatReport(report, title) {
    let message = `<b>${title}</b>\n`;
    message += `📅 Period: ${report.startDate.split('T')[0]} to ${report.endDate.split('T')[0]}\n\n`;

    // Summary
    message += `<b>📊 Summary</b>\n`;
    message += `• Total Actions: ${report.summary.totalActions}\n`;
    message += `• File Downloads: ${report.summary.totalDownloads}\n`;
    message += `• Module Views: ${report.summary.totalViews}\n`;
    message += `• Unique Users: ${report.summary.uniqueUsers}\n`;
    message += `• Avg Actions/User: ${report.summary.averageActionsPerUser}\n\n`;

    // Top Files
    if (report.topFiles.length > 0) {
      message += `<b>📁 Top Downloaded Files</b>\n`;
      report.topFiles.slice(0, 5).forEach((file, index) => {
        message += `${index + 1}. ${file.fileName} (${file.downloads} downloads)\n`;
      });
      message += '\n';
    }

    // Top Modules
    if (report.topModules.length > 0) {
      message += `<b>📚 Top Viewed Modules</b>\n`;
      report.topModules.slice(0, 5).forEach((module, index) => {
        message += `${index + 1}. ${module.moduleName} (${module.views} views)\n`;
      });
      message += '\n';
    }

    // Peak Hours
    if (report.peakHours.length > 0) {
      message += `<b>⏰ Peak Usage Hours</b>\n`;
      report.peakHours.forEach((hour, index) => {
        message += `${index + 1}. ${hour.hour}:00 (${hour.count} actions)\n`;
      });
      message += '\n';
    }

    // Performance
    message += `<b>⚡ Performance</b>\n`;
    message += `• Avg Response Time: ${report.performance.averageResponseTime}ms\n`;
    message += `• Total Errors: ${report.performance.totalErrors}\n`;
    message += `• Uptime: ${report.performance.uptime}\n`;

    return message;
  }

  // Get real-time stats
  getRealTimeStats() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const todayStats = this.data.dailyStats[today] || {
      totalUsers: new Set(),
      totalActions: 0,
      fileDownloads: 0,
      moduleViews: 0,
      feedbackSent: 0,
      filesShared: 0
    };

    return {
      today: {
        totalUsers: todayStats.totalUsers.size,
        totalActions: todayStats.totalActions,
        fileDownloads: todayStats.fileDownloads,
        moduleViews: todayStats.moduleViews,
        feedbackSent: todayStats.feedbackSent,
        filesShared: todayStats.filesShared
      },
      totalUsers: Object.keys(this.data.userActivity).length,
      totalFiles: Object.keys(this.data.fileDownloads).length,
      totalModules: Object.keys(this.data.moduleViews).length,
      uptime: this.calculateUptime()
    };
  }

  // Clean old data
  cleanOldData() {
    const maxAge = this.config.analytics.maxDataRetentionDays * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - maxAge);

    // Clean old daily stats
    Object.keys(this.data.dailyStats).forEach(date => {
      if (new Date(date) < cutoffDate) {
        delete this.data.dailyStats[date];
      }
    });

    // Clean old user sessions (keep only last 30 days)
    Object.keys(this.data.userSessions).forEach(userId => {
      this.data.userSessions[userId] = this.data.userSessions[userId].filter(session => {
        return new Date(session.timestamp) > cutoffDate;
      });
    });

    this.saveData();
  }

  // Track broadcast events
  trackBroadcast(broadcastId, broadcastData) {
    if (!this.config.analytics.enabled) return;

    const timestamp = new Date().toISOString();
    
    if (!this.data.broadcasts) {
      this.data.broadcasts = {};
    }

    this.data.broadcasts[broadcastId] = {
      ...broadcastData,
      timestamp,
      successRate: broadcastData.targetCount > 0 ? 
        (broadcastData.sentCount / broadcastData.targetCount * 100).toFixed(2) : 0
    };

    // Track broadcast statistics
    if (!this.data.broadcastStats) {
      this.data.broadcastStats = {
        totalBroadcasts: 0,
        totalSent: 0,
        totalFailed: 0,
        averageSuccessRate: 0,
        targetTypeStats: {}
      };
    }

    this.data.broadcastStats.totalBroadcasts++;
    this.data.broadcastStats.totalSent += broadcastData.sentCount;
    this.data.broadcastStats.totalFailed += broadcastData.failedCount;

    // Update target type statistics
    if (!this.data.broadcastStats.targetTypeStats[broadcastData.targetType]) {
      this.data.broadcastStats.targetTypeStats[broadcastData.targetType] = {
        count: 0,
        totalSent: 0,
        totalFailed: 0
      };
    }

    this.data.broadcastStats.targetTypeStats[broadcastData.targetType].count++;
    this.data.broadcastStats.targetTypeStats[broadcastData.targetType].totalSent += broadcastData.sentCount;
    this.data.broadcastStats.targetTypeStats[broadcastData.targetType].totalFailed += broadcastData.failedCount;

    // Calculate average success rate
    const totalTargets = this.data.broadcastStats.totalSent + this.data.broadcastStats.totalFailed;
    this.data.broadcastStats.averageSuccessRate = totalTargets > 0 ? 
      (this.data.broadcastStats.totalSent / totalTargets * 100).toFixed(2) : 0;

    this.saveData();
  }
}

module.exports = Analytics;
