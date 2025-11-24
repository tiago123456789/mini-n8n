"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
class Encrypter {
    key;
    constructor() {
        this.key = process.env.ENCRYPT_KEY;
    }
    encrypt(message) {
        if (!this.key) {
            throw new Error("Key not found");
        }
        const iv = (0, crypto_1.randomBytes)(16).toString('hex');
        const cipher = (0, crypto_1.createCipheriv)('aes256', Buffer.from(this.key, 'hex'), Buffer.from(iv, 'hex'));
        const encryptedMessage = cipher.update(message, 'utf8', 'hex') + cipher.final('hex');
        return `${encryptedMessage}.${iv}`;
    }
    decrypt(encryptedMessage) {
        if (!this.key) {
            throw new Error("Key not found");
        }
        const messageSplited = encryptedMessage.split('.');
        const message = messageSplited[0];
        const iv = messageSplited[1];
        if (!iv) {
            throw new Error("IV not found");
        }
        const decipher = (0, crypto_1.createDecipheriv)('aes256', Buffer.from(this.key, 'hex'), Buffer.from(iv, 'hex'));
        if (!message) {
            throw new Error("Message not found");
        }
        const decryptedMessage = decipher.update(message, 'hex', 'utf-8') + decipher.final('utf8');
        return decryptedMessage.toString();
    }
}
exports.default = Encrypter;
//# sourceMappingURL=encrypter.util.js.map