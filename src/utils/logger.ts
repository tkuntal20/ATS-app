export class Logger {
  static info(message: string): void {
    console.log(`ℹ️  ${message}`);
  }

  static success(message: string): void {
    console.log(`✅ ${message}`);
  }

  static warn(message: string): void {
    console.warn(`⚠️  ${message}`);
  }

  static error(message: string): void {
    console.error(`❌ ${message}`);
  }

  static debug(message: string): void {
    if (process.env.DEBUG) {
      console.log(`🐛 ${message}`);
    }
  }
}
