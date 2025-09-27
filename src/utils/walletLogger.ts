/**
 * Shared logging utility for wallet operations
 * Provides consistent logging across wallet-related code
 */

export const WalletLogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
} as const;

export type WalletLogLevel = typeof WalletLogLevel[keyof typeof WalletLogLevel];

interface WalletLogEntry {
  level: WalletLogLevel;
  message: string;
  context?: string;
  data?: unknown;
  timestamp: Date;
}

class WalletLogger {
  private logs: WalletLogEntry[] = [];
  private maxLogs = 1000;
  
  private log(level: WalletLogLevel, message: string, context?: string, data?: unknown) {
    const entry: WalletLogEntry = {
      level,
      message,
      context,
      data,
      timestamp: new Date(),
    };
    
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    const prefix = context ? `[${context}]` : '';
    const emoji = this.getEmoji(level);
    
    switch (level) {
      case WalletLogLevel.DEBUG:
        console.debug(`${emoji} ${prefix}`, message, data || '');
        break;
      case WalletLogLevel.INFO:
        console.log(`${emoji} ${prefix}`, message, data || '');
        break;
      case WalletLogLevel.WARN:
        console.warn(`${emoji} ${prefix}`, message, data || '');
        break;
      case WalletLogLevel.ERROR:
        console.error(`${emoji} ${prefix}`, message, data || '');
        break;
    }
  }
  
  private getEmoji(level: WalletLogLevel): string {
    switch (level) {
      case WalletLogLevel.DEBUG:
        return '🔍';
      case WalletLogLevel.INFO:
        return '✅';
      case WalletLogLevel.WARN:
        return '⚠️';
      case WalletLogLevel.ERROR:
        return '❌';
    }
  }
  
  debug(message: string, context?: string, data?: unknown) {
    this.log(WalletLogLevel.DEBUG, message, context, data);
  }
  
  info(message: string, context?: string, data?: unknown) {
    this.log(WalletLogLevel.INFO, message, context, data);
  }
  
  warn(message: string, context?: string, data?: unknown) {
    this.log(WalletLogLevel.WARN, message, context, data);
  }
  
  error(message: string, context?: string, data?: unknown) {
    this.log(WalletLogLevel.ERROR, message, context, data);
  }
  
  getLogs(): WalletLogEntry[] {
    return [...this.logs];
  }
  
  clearLogs() {
    this.logs = [];
  }
}

export const walletLogger = new WalletLogger();