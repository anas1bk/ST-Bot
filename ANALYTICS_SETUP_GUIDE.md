# 📊 Analytics Dashboard Setup Guide

## 🎯 **Overview**

Your bot now includes a comprehensive analytics system that tracks:
- **File Downloads** - Most popular files and download patterns
- **Module Views** - Which modules are most accessed
- **User Activity** - User behavior and engagement metrics
- **Performance Metrics** - Response times and error tracking
- **Peak Usage Times** - When users are most active
- **Geographic Data** - User location patterns (if available)

## 🚀 **Setup Instructions**

### **1. Create Analytics Channel**

**Option A: Private Channel (Recommended)**
1. Create a new private channel named "Bot Analytics"
2. Add your bot as an admin with these permissions:
   - ✅ Send Messages
   - ✅ Post Messages
3. Get the channel ID by forwarding a message to @userinfobot
4. Update the channel ID in `config.js`:
   ```javascript
   analyticsChannel: process.env.ANALYTICS_CHANNEL || '-1001234567890',
   ```

**Option B: Public Channel**
1. Create a public channel (e.g., @bot_analytics)
2. Add your bot as an admin
3. Use the channel username in config

### **2. Update Environment Variables**

**In Render Dashboard:**
- `ANALYTICS_CHANNEL=-1001234567890` (replace with your channel ID)

**In config.js:**
```javascript
analyticsChannel: process.env.ANALYTICS_CHANNEL || '-1001234567890',
```

### **3. Configure Analytics Settings**

**In config.js, you can customize:**
```javascript
analytics: {
  enabled: true,                    // Enable/disable analytics
  trackFileDownloads: true,         // Track file downloads
  trackUserActivity: true,          // Track user actions
  trackModuleViews: true,           // Track module views
  generateWeeklyReports: true,      // Auto weekly reports
  generateMonthlyReports: true,     // Auto monthly reports
  maxDataRetentionDays: 90          // Keep data for 90 days
}
```

## 📋 **Admin Commands**

### **Real-Time Analytics**
```
/analytics
```
Shows current day stats and overall metrics.

### **Generate Reports**
```
/analytics_weekly    - Generate and send weekly report
/analytics_monthly   - Generate and send monthly report
```

### **Data Management**
```
/analytics_clean     - Clean old data (keeps last 90 days)
```

## 📊 **What Gets Tracked**

### **File Downloads**
- File name and path
- Download count and unique users
- Download history with timestamps
- User information for each download

### **Module Views**
- Module name, university, and semester
- View count and unique users
- View history with timestamps
- Navigation patterns

### **User Activity**
- First and last seen timestamps
- Total actions performed
- Action history with details
- User information (name, username, ID)

### **Daily Statistics**
- Total users per day
- Total actions per day
- File downloads per day
- Module views per day
- Feedback sent per day
- Files shared per day

### **Performance Metrics**
- Response times for operations
- Error tracking and logging
- Bot uptime calculation
- System performance trends

### **Peak Usage**
- Hourly activity patterns
- Most active time periods
- Usage distribution analysis

## 📈 **Report Format**

### **Weekly/Monthly Reports Include:**
```
📊 Weekly Analytics Report
📅 Period: 2024-01-01 to 2024-01-07

📊 Summary
• Total Actions: 1,234
• File Downloads: 567
• Module Views: 890
• Unique Users: 123
• Avg Actions/User: 10.03

📁 Top Downloaded Files
1. calculus_notes.pdf (45 downloads)
2. physics_lab.pdf (32 downloads)
3. chemistry_exam.pdf (28 downloads)

📚 Top Viewed Modules
1. Calculus (156 views)
2. Physics (134 views)
3. Chemistry (98 views)

⏰ Peak Usage Hours
1. 20:00 (89 actions)
2. 19:00 (76 actions)
3. 21:00 (65 actions)

⚡ Performance
• Avg Response Time: 245ms
• Total Errors: 3
• Uptime: 7d 12h 30m
```

## 🔧 **Data Storage**

### **File Location**
- Analytics data is stored in `analytics_data.json`
- Automatically created when bot starts
- Contains all tracking data in JSON format

### **Data Retention**
- Default: 90 days
- Configurable in `config.js`
- Old data automatically cleaned
- Manual cleanup with `/analytics_clean`

### **Data Structure**
```json
{
  "fileDownloads": {},
  "userActivity": {},
  "moduleViews": {},
  "userSessions": {},
  "dailyStats": {},
  "peakUsage": {},
  "performanceMetrics": {
    "responseTimes": [],
    "errors": [],
    "uptime": {}
  }
}
```

## 🛡️ **Privacy & Security**

### **Data Protection**
- Only user IDs are stored (no personal data)
- Data is stored locally on the server
- No external analytics services used
- Data retention is configurable

### **Admin Access**
- Only bot owner can access analytics
- All commands require owner verification
- Reports sent to private channel only

## 🚀 **Advanced Features**

### **Custom Reports**
You can modify the `generateReport()` function in `analytics.js` to create custom reports with different metrics.

### **Data Export**
Analytics data can be exported from `analytics_data.json` for external analysis.

### **Performance Monitoring**
Track bot performance and identify bottlenecks with response time metrics.

### **User Behavior Analysis**
Understand how users interact with your bot and optimize the experience.

## 🔍 **Troubleshooting**

### **Analytics Not Working**
1. Check if analytics is enabled in config
2. Verify channel permissions
3. Check bot admin status in channel
4. Review console logs for errors

### **Reports Not Sending**
1. Verify channel ID is correct
2. Check bot permissions in channel
3. Ensure channel exists and is accessible
4. Review error logs

### **Data Not Tracking**
1. Check if tracking features are enabled
2. Verify file permissions for `analytics_data.json`
3. Check console for initialization errors
4. Restart bot to reinitialize analytics

## 📞 **Support**

If you encounter issues with analytics:
1. Check the console logs for error messages
2. Verify all configuration settings
3. Test with a simple `/analytics` command
4. Contact support with specific error details

---

**🎉 Your bot now has powerful analytics capabilities! Track user behavior, optimize performance, and make data-driven decisions.**
