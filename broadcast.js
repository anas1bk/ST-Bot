#!/usr/bin/env node

/**
 * Broadcast System for Engineering Bot
 * Handles sending announcements to all bot users and subscribers
 */

const fs = require('fs');
const path = require('path');

class BroadcastSystem {
  constructor(bot, security, analytics) {
    this.bot = bot;
    this.security = security;
    this.analytics = analytics;
    this.broadcastDataFile = 'broadcast_data.json';
    this.userDataFile = 'user_data.json';
    this.broadcastQueue = [];
    this.isBroadcasting = false;
    this.rateLimit = {
      maxMessagesPerMinute: 20,
      maxMessagesPerHour: 100,
      messagesSent: 0,
      lastReset: Date.now()
    };
    
    this.loadData();
    this.setupRateLimitReset();
  }

  // Load broadcast and user data
  loadData() {
    try {
      // Load broadcast history
      if (fs.existsSync(this.broadcastDataFile)) {
        this.broadcastHistory = JSON.parse(fs.readFileSync(this.broadcastDataFile, 'utf8'));
      } else {
        this.broadcastHistory = {
          broadcasts: [],
          userStats: {},
          lastBroadcastId: 0
        };
      }

      // Load user data
      if (fs.existsSync(this.userDataFile)) {
        this.userData = JSON.parse(fs.readFileSync(this.userDataFile, 'utf8'));
      } else {
        this.userData = {
          users: {},
          subscribers: [],
          totalUsers: 0,
          activeUsers: 0
        };
      }
    } catch (error) {
      console.error('Error loading broadcast data:', error);
      this.broadcastHistory = { broadcasts: [], userStats: {}, lastBroadcastId: 0 };
      this.userData = { users: {}, subscribers: [], totalUsers: 0, activeUsers: 0 };
    }
  }

  // Save broadcast and user data
  saveData() {
    try {
      fs.writeFileSync(this.broadcastDataFile, JSON.stringify(this.broadcastHistory, null, 2));
      fs.writeFileSync(this.userDataFile, JSON.stringify(this.userData, null, 2));
    } catch (error) {
      console.error('Error saving broadcast data:', error);
    }
  }

  // Setup rate limit reset
  setupRateLimitReset() {
    setInterval(() => {
      const now = Date.now();
      const oneMinute = 60 * 1000;
      const oneHour = 60 * 60 * 1000;

      if (now - this.rateLimit.lastReset >= oneMinute) {
        this.rateLimit.messagesSent = 0;
        this.rateLimit.lastReset = now;
      }
    }, 60000); // Check every minute
  }

  // Register a new user
  registerUser(userId, userInfo) {
    if (!this.userData.users[userId]) {
      this.userData.users[userId] = {
        id: userId,
        first_name: userInfo.first_name || '',
        last_name: userInfo.last_name || '',
        username: userInfo.username || '',
        joined_at: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        message_count: 0,
        is_subscriber: false,
        is_blocked: false
      };
      this.userData.totalUsers++;
      this.saveData();
    } else {
      // Update last activity
      this.userData.users[userId].last_activity = new Date().toISOString();
      this.userData.users[userId].message_count++;
    }
  }

  // Subscribe user to broadcasts
  subscribeUser(userId) {
    if (!this.userData.subscribers.includes(userId)) {
      this.userData.subscribers.push(userId);
      if (this.userData.users[userId]) {
        this.userData.users[userId].is_subscriber = true;
      }
      this.saveData();
      return true;
    }
    return false;
  }

  // Unsubscribe user from broadcasts
  unsubscribeUser(userId) {
    const index = this.userData.subscribers.indexOf(userId);
    if (index > -1) {
      this.userData.subscribers.splice(index, 1);
      if (this.userData.users[userId]) {
        this.userData.users[userId].is_subscriber = false;
      }
      this.saveData();
      return true;
    }
    return false;
  }

  // Block user from broadcasts
  blockUser(userId) {
    if (this.userData.users[userId]) {
      this.userData.users[userId].is_blocked = true;
      this.unsubscribeUser(userId);
      this.saveData();
      return true;
    }
    return false;
  }

  // Unblock user
  unblockUser(userId) {
    if (this.userData.users[userId]) {
      this.userData.users[userId].is_blocked = false;
      this.saveData();
      return true;
    }
    return false;
  }

  // Get broadcast statistics
  getBroadcastStats() {
    const totalUsers = this.userData.totalUsers;
    const subscribers = this.userData.subscribers.length;
    const activeUsers = Object.values(this.userData.users).filter(user => 
      new Date(user.last_activity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    return {
      totalUsers,
      subscribers,
      activeUsers,
      broadcastHistory: this.broadcastHistory.broadcasts.length,
      rateLimit: {
        messagesSent: this.rateLimit.messagesSent,
        maxPerMinute: this.rateLimit.maxMessagesPerMinute,
        maxPerHour: this.rateLimit.maxMessagesPerHour
      }
    };
  }

  // Send broadcast to all users
  async sendBroadcast(message, options = {}) {
    const {
      adminId = null,
      targetType = 'all', // 'all', 'subscribers', 'active'
      includeButtons = false,
      buttons = [],
      priority = 'normal', // 'low', 'normal', 'high', 'urgent'
      media = null // { type: 'photo'|'video'|'audio'|'document', file_id: string, caption: string }
    } = options;

    // Security validation
    if (!this.security.validateUserInput(message, 'broadcast')) {
      this.security.logSecurityEvent('INVALID_BROADCAST_CONTENT', 'Invalid content in broadcast message', 'WARNING');
      return { success: false, error: 'Invalid message content' };
    }

    // Rate limiting
    if (this.rateLimit.messagesSent >= this.rateLimit.maxMessagesPerMinute) {
      return { success: false, error: 'Rate limit exceeded. Please wait before sending another broadcast.' };
    }

    // Create broadcast record
    const broadcastId = ++this.broadcastHistory.lastBroadcastId;
    const broadcast = {
      id: broadcastId,
      message: message,
      media: media,
      adminId: adminId,
      targetType: targetType,
      priority: priority,
      timestamp: new Date().toISOString(),
      status: 'pending',
      sentCount: 0,
      failedCount: 0,
      blockedCount: 0
    };

    this.broadcastHistory.broadcasts.push(broadcast);
    this.saveData();

    // Determine target users
    let targetUsers = [];
    switch (targetType) {
      case 'subscribers':
        targetUsers = this.userData.subscribers.filter(id => 
          this.userData.users[id] && !this.userData.users[id].is_blocked
        );
        break;
      case 'active':
        targetUsers = Object.values(this.userData.users)
          .filter(user => 
            !user.is_blocked && 
            new Date(user.last_activity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          )
          .map(user => user.id);
        break;
      case 'all':
      default:
        targetUsers = Object.values(this.userData.users)
          .filter(user => !user.is_blocked)
          .map(user => user.id);
        break;
    }

    // Update broadcast status
    broadcast.status = 'sending';
    broadcast.targetCount = targetUsers.length;
    this.saveData();

    // Send messages with rate limiting
    const results = await this.sendMessagesToUsers(targetUsers, message, buttons, broadcastId, media);

    // Update broadcast with results
    broadcast.status = 'completed';
    broadcast.sentCount = results.sent;
    broadcast.failedCount = results.failed;
    broadcast.blockedCount = results.blocked;
    broadcast.completedAt = new Date().toISOString();
    this.saveData();

    // Track analytics
    this.analytics.trackBroadcast(broadcastId, {
      targetType,
      targetCount: targetUsers.length,
      sentCount: results.sent,
      failedCount: results.failed,
      priority
    });

    return {
      success: true,
      broadcastId,
      targetCount: targetUsers.length,
      sentCount: results.sent,
      failedCount: results.failed,
      blockedCount: results.blocked
    };
  }

  // Send messages to users with rate limiting
  async sendMessagesToUsers(userIds, message, buttons, broadcastId, media = null) {
    let sent = 0;
    let failed = 0;
    let blocked = 0;

    const messageOptions = buttons.length > 0 ? {
      reply_markup: {
        inline_keyboard: buttons
      }
    } : {};

    for (const userId of userIds) {
      try {
        // Check rate limit
        if (this.rateLimit.messagesSent >= this.rateLimit.maxMessagesPerMinute) {
          // Wait for rate limit reset
          await new Promise(resolve => setTimeout(resolve, 60000));
          this.rateLimit.messagesSent = 0;
        }

        // Check if user is blocked
        if (this.userData.users[userId] && this.userData.users[userId].is_blocked) {
          blocked++;
          continue;
        }

        // Send message with or without media
        if (media) {
          // Send media with caption
          const caption = message || media.caption || '';
          const mediaOptions = { ...messageOptions };
          if (caption) {
            mediaOptions.caption = caption;
          }
          
          switch (media.type) {
            case 'photo':
              await this.bot.sendPhoto(userId, media.file_id, mediaOptions);
              break;
            case 'video':
              await this.bot.sendVideo(userId, media.file_id, mediaOptions);
              break;
            case 'audio':
              await this.bot.sendAudio(userId, media.file_id, mediaOptions);
              break;
            case 'document':
              await this.bot.sendDocument(userId, media.file_id, mediaOptions);
              break;
            default:
              await this.bot.sendMessage(userId, message, messageOptions);
              break;
          }
        } else {
          // Send text message only
          await this.bot.sendMessage(userId, message, messageOptions);
        }
        
        sent++;
        this.rateLimit.messagesSent++;

        // Small delay to avoid overwhelming
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Failed to send broadcast to user ${userId}:`, error.message);
        failed++;

        // If user blocked the bot, mark as blocked
        if (error.code === 403) {
          this.blockUser(userId);
          blocked++;
        }
      }
    }

    return { sent, failed, blocked };
  }

  // Get broadcast history
  getBroadcastHistory(limit = 10) {
    return this.broadcastHistory.broadcasts
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  // Get user list for admin
  getUserList(type = 'all', limit = 50) {
    let users = [];
    
    switch (type) {
      case 'subscribers':
        users = this.userData.subscribers.map(id => this.userData.users[id]).filter(Boolean);
        break;
      case 'active':
        users = Object.values(this.userData.users).filter(user => 
          new Date(user.last_activity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
        break;
      case 'blocked':
        users = Object.values(this.userData.users).filter(user => user.is_blocked);
        break;
      case 'all':
      default:
        users = Object.values(this.userData.users);
        break;
    }

    return users
      .sort((a, b) => new Date(b.last_activity) - new Date(a.last_activity))
      .slice(0, limit);
  }

  // Export user data for backup
  exportUserData() {
    return {
      users: this.userData.users,
      subscribers: this.userData.subscribers,
      totalUsers: this.userData.totalUsers,
      exportDate: new Date().toISOString()
    };
  }

  // Import user data from backup
  importUserData(data) {
    try {
      this.userData = {
        users: data.users || {},
        subscribers: data.subscribers || [],
        totalUsers: data.totalUsers || 0,
        activeUsers: 0
      };
      this.saveData();
      return true;
    } catch (error) {
      console.error('Error importing user data:', error);
      return false;
    }
  }
}

module.exports = BroadcastSystem;
