import { createCipheriv, randomBytes, createDecipheriv, randomUUID } from 'crypto'

class Encrypter {

    private key: string | undefined;
  constructor() {
    this.key = process.env.ENCRYPT_KEY;
  }

  encrypt(message: string) {
    if (!this.key) {
        throw new Error("Key not found");
    }

    const iv = randomBytes(16).toString('hex');
    const cipher = createCipheriv('aes256',
      Buffer.from(this.key, 'hex'),
      Buffer.from(iv, 'hex'));


    const encryptedMessage = cipher.update(
      message, 'utf8', 'hex') + cipher.final('hex');

    return `${encryptedMessage}.${iv}`;
  }

  decrypt(encryptedMessage: string) {
    if (!this.key) {
        throw new Error("Key not found");
    }
    const messageSplited = encryptedMessage.split('.');
    const message = messageSplited[0];
    const iv: string | undefined = messageSplited[1];

    if (!iv) {
        throw new Error("IV not found");
    }
    
    const decipher = createDecipheriv('aes256',
      Buffer.from(this.key, 'hex'),
      Buffer.from(iv, 'hex')
    );

    if (!message) {
        throw new Error("Message not found");
    }

    const decryptedMessage = decipher.update(message, 'hex', 'utf-8') + decipher.final('utf8');
    return decryptedMessage.toString();
  }
}

export default Encrypter