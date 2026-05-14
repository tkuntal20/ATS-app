export class Logger {
    static info(message) {
        console.log(`ℹ️  ${message}`);
    }
    static success(message) {
        console.log(`✅ ${message}`);
    }
    static warn(message) {
        console.warn(`⚠️  ${message}`);
    }
    static error(message) {
        console.error(`❌ ${message}`);
    }
    static debug(message) {
        if (process.env.DEBUG) {
            console.log(`🐛 ${message}`);
        }
    }
}
//# sourceMappingURL=logger.js.map