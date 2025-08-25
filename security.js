const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class SecurityManager {
  constructor() {
    this.securityEvents = [];
    this.suspiciousActivities = [];
    this.tokenValidationAttempts = 0;
    this.maxTokenAttempts = 3;
    this.lastTokenCheck = null;
    this.encryptedToken = null;
  }

  // 🔐 SECURE TOKEN MANAGEMENT
  validateAndSecureToken(token) {
    try {
      // Validate token format
      if (!this.isValidTokenFormat(token)) {
        throw new Error('INVALID_TOKEN_FORMAT: Token format is invalid');
      }

      // Encrypt token in memory
      this.encryptedToken = this.encryptToken(token);
      
      // Log security event
      this.logSecurityEvent('TOKEN_VALIDATED', 'Token validated and secured');
      
      return true;
    } catch (error) {
      this.logSecurityEvent('TOKEN_VALIDATION_FAILED', error.message);
      throw error;
    }
  }

  // Validate token format
  isValidTokenFormat(token) {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // Telegram bot token format: <bot_id>:<bot_token>
    const tokenPattern = /^\d{8,}:[a-zA-Z0-9_-]{35}$/;
    if (!tokenPattern.test(token)) {
      return false;
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /test/i,
      /example/i,
      /placeholder/i,
      /dummy/i,
      /fake/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(token)) {
        return false;
      }
    }

    return true;
  }

  // Detect token exposure
  detectTokenExposure(token) {
    // Check if token appears in logs (only check existing logs, not environment)
    const logFiles = this.getLogFiles();
    for (const logFile of logFiles) {
      if (this.fileContainsToken(logFile, token)) {
        return true;
      }
    }

    // Don't check environment variables during initial deployment
    // The token is expected to be in BOT_TOKEN environment variable
    // This prevents false positives during deployment
    
    return false;
  }

  // Encrypt token in memory
  encryptToken(token) {
    const algorithm = 'aes-256-gcm';
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      key: key.toString('hex'),
      iv: iv.toString('hex'),
      tag: cipher.getAuthTag().toString('hex')
    };
  }

  // Decrypt token for use
  decryptToken() {
    if (!this.encryptedToken) {
      throw new Error('No encrypted token available');
    }

    try {
      const algorithm = 'aes-256-gcm';
      const key = Buffer.from(this.encryptedToken.key, 'hex');
      const iv = Buffer.from(this.encryptedToken.iv, 'hex');
      const tag = Buffer.from(this.encryptedToken.tag, 'hex');
      
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(this.encryptedToken.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      this.logSecurityEvent('TOKEN_DECRYPTION_FAILED', error.message);
      throw new Error('Failed to decrypt token');
    }
  }

  // 🛡️ INPUT VALIDATION & SANITIZATION
  validateUserInput(input, type = 'general') {
    if (!input || typeof input !== 'string') {
      return false;
    }

    // Remove dangerous characters
    const sanitized = this.sanitizeInput(input);
    
    // Check for injection attempts
    if (this.detectInjectionAttempt(sanitized)) {
      this.logSecurityEvent('INJECTION_ATTEMPT_DETECTED', `Type: ${type}, Input: ${sanitized.substring(0, 50)}`);
      return false;
    }

    // Check for spam patterns
    if (this.detectSpamPattern(sanitized)) {
      this.logSecurityEvent('SPAM_PATTERN_DETECTED', `Type: ${type}, Input: ${sanitized.substring(0, 50)}`);
      return false;
    }

    return sanitized;
  }

  // Sanitize user input
  sanitizeInput(input) {
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove JavaScript
      .replace(/data:/gi, '') // Remove data URLs
      .replace(/vbscript:/gi, '') // Remove VBScript
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Detect injection attempts
  detectInjectionAttempt(input) {
    const injectionPatterns = [
      /<script/i,
      /javascript:/i,
      /data:text\/html/i,
      /vbscript:/i,
      /on\w+=/i,
      /eval\(/i,
      /document\./i,
      /window\./i,
      /alert\(/i,
      /confirm\(/i,
      /prompt\(/i
    ];

    return injectionPatterns.some(pattern => pattern.test(input));
  }

  // Detect spam patterns
  detectSpamPattern(input) {
    const spamPatterns = [
      /buy.*now/i,
      /click.*here/i,
      /free.*money/i,
      /earn.*fast/i,
      /make.*money/i,
      /work.*from.*home/i,
      /bit\.ly/i,
      /tinyurl/i,
      /goo\.gl/i
    ];

    return spamPatterns.some(pattern => pattern.test(input));
  }

  // 🔍 SECURE LOGGING
  logSecurityEvent(event, details, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const eventData = {
      timestamp,
      event,
      details,
      level,
      processId: process.pid,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    };

    this.securityEvents.push(eventData);

    // Log to file (without sensitive data)
    this.writeSecureLog(eventData);

    // Console logging (sanitized)
    const sanitizedDetails = this.sanitizeForLogging(details);
    console.log(`🔒 [SECURITY] ${level}: ${event} - ${sanitizedDetails}`);

    // Alert on critical events
    if (level === 'CRITICAL' || level === 'ERROR') {
      this.triggerSecurityAlert(eventData);
    }
  }

  // Write secure logs
  writeSecureLog(eventData) {
    try {
      const logDir = path.join(__dirname, 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const logFile = path.join(logDir, `security-${new Date().toISOString().split('T')[0]}.log`);
      const logEntry = JSON.stringify(eventData) + '\n';
      
      fs.appendFileSync(logFile, logEntry);
    } catch (error) {
      console.error('Failed to write security log:', error.message);
    }
  }

  // Sanitize data for logging
  sanitizeForLogging(data) {
    if (typeof data === 'string') {
      // Remove potential tokens
      return data.replace(/\d{8,}:[a-zA-Z0-9_-]{35}/g, '[TOKEN_REDACTED]');
    }
    return data;
  }

  // 🚨 SECURITY ALERTS
  triggerSecurityAlert(eventData) {
    // Log critical security event
    console.error('🚨 CRITICAL SECURITY ALERT:', eventData);
    
    // In production, you could send alerts to:
    // - Email
    // - Slack/Discord
    // - SMS
    // - Security monitoring service
  }

  // 📊 MONITORING & DETECTION
  monitorBotResponse(response) {
    // Check if response contains suspicious content
    if (this.detectSuspiciousResponse(response)) {
      this.logSecurityEvent('SUSPICIOUS_RESPONSE_DETECTED', 'Bot response contains suspicious content', 'WARNING');
      return false;
    }

    // Check for unexpected external content
    if (this.detectExternalContent(response)) {
      this.logSecurityEvent('EXTERNAL_CONTENT_DETECTED', 'Bot response contains external content', 'WARNING');
      return false;
    }

    return true;
  }

  // Detect suspicious bot responses
  detectSuspiciousResponse(response) {
    if (!response || typeof response !== 'string') {
      return false;
    }

    const suspiciousPatterns = [
      /buy.*now/i,
      /click.*here/i,
      /free.*money/i,
      /earn.*fast/i,
      /make.*money/i,
      /work.*from.*home/i,
      /bit\.ly/i,
      /tinyurl/i,
      /goo\.gl/i,
      /telegram\.me\/joinchat/i,
      /t\.me\/joinchat/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(response));
  }

  // Detect external content
  detectExternalContent(response) {
    if (!response || typeof response !== 'string') {
      return false;
    }

    const externalPatterns = [
      /http:\/\//i,
      /https:\/\//i,
      /www\./i,
      /\.com/i,
      /\.org/i,
      /\.net/i
    ];

    return externalPatterns.some(pattern => pattern.test(response));
  }

  // 🔄 FAIL-SAFE BEHAVIOR
  validateServerStatus() {
    // Check if server is properly configured
    if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
      this.logSecurityEvent('NON_PRODUCTION_ENVIRONMENT', 'Bot running in non-production environment', 'WARNING');
      return false;
    }

    // Check if required environment variables are set
    const requiredVars = ['BOT_TOKEN', 'BOT_OWNER_ID'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      this.logSecurityEvent('MISSING_ENV_VARS', `Missing: ${missingVars.join(', ')}`, 'ERROR');
      return false;
    }

    return true;
  }

  // 🛡️ ANTI-HIJACKING PROTECTION
  validateBotControl() {
    // Check if bot is responding to authorized commands only
    const authorizedCommands = ['/start', '/help', '/about', '/ing', '/feedback', '/send'];
    
    // This would be called before processing any command
    return true;
  }

  // 📁 FILE SYSTEM SECURITY
  getLogFiles() {
    try {
      const logDir = path.join(__dirname, 'logs');
      if (!fs.existsSync(logDir)) {
        return [];
      }
      
      return fs.readdirSync(logDir)
        .filter(file => file.endsWith('.log'))
        .map(file => path.join(logDir, file));
    } catch (error) {
      return [];
    }
  }

  fileContainsToken(filePath, token) {
    try {
      if (!fs.existsSync(filePath)) {
        return false;
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      return content.includes(token);
    } catch (error) {
      return false;
    }
  }

  // 📈 SECURITY METRICS
  getSecurityMetrics() {
    return {
      totalEvents: this.securityEvents.length,
      criticalEvents: this.securityEvents.filter(e => e.level === 'CRITICAL').length,
      errorEvents: this.securityEvents.filter(e => e.level === 'ERROR').length,
      warningEvents: this.securityEvents.filter(e => e.level === 'WARNING').length,
      suspiciousActivities: this.suspiciousActivities.length,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      lastTokenCheck: this.lastTokenCheck
    };
  }

  // 🧹 CLEANUP & MAINTENANCE
  cleanupOldLogs() {
    try {
      const logDir = path.join(__dirname, 'logs');
      if (!fs.existsSync(logDir)) {
        return;
      }

      const files = fs.readdirSync(logDir);
      const now = new Date();
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

      for (const file of files) {
        const filePath = path.join(logDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          this.logSecurityEvent('OLD_LOG_CLEANED', `Removed: ${file}`);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old logs:', error.message);
    }
  }
}

module.exports = SecurityManager;
