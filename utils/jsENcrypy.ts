import JSEncrypt from "jsencrypt";

// 公钥
const publicKey = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu5d5zIRSfpSEogPwcyAzAln9Dh1Z5666JMXce6+69H0FcTEDtWDPCNgT+nrqoxypcytqW6LY/6m78Wsb3GHRuOtqdS6UpCJrJMx2QDh9EsFXjsocFPk1UQ3T3+ROnDuQ3ATNKABK526/W/ak0/5KF4KEmTWZwwM06Q0OE0D19pKJ84YYZQWXQO1oY5lQohsnzH2jEz2LCGqjCF0jOFRWQy9WhCHVh0Vx+3QLYP2HWL6BCe2ayEOSTLurgnoJHgSqzrNrMF+8NV9tOZW1yvb/jlBX8J1E0rONfHJedROL8G7uQhdTE4giGvIwawq+GlGiiuuxqUb0ZJP+/0x03qmSSQIDAQAB
-----END PUBLIC KEY-----
`;

// 私钥
const privateKey = `
-----BEGIN RSA PRIVATE KEY-----
<YOUR_PRIVATE_KEY_HERE>
-----END RSA PRIVATE KEY-----
`;

/**
 * 使用公钥加密数据
 * @param plaintext 明文数据
 * @returns 加密后的数据
 */
function encryptWithPublicKey(plaintext: string): string | false {
	const encryptor = new JSEncrypt();
	encryptor.setPublicKey(publicKey);
	return encryptor.encrypt(plaintext);
}

/**
 * 使用私钥解密数据
 * @param encryptedData 加密后的数据
 * @returns 解密后的明文数据
 */
function decryptWithPrivateKey(encryptedData: string): string | false {
	const decryptor = new JSEncrypt();
	decryptor.setPrivateKey(privateKey);
	return decryptor.decrypt(encryptedData);
}

/**
 * 示例
 */
function exampleUsage() {
	const plaintext = "This is a secret message.";

	// 加密
	const encrypted = encryptWithPublicKey(plaintext);
	if (!encrypted) {
		console.error("加密失败");
		return;
	}
	console.log("加密后的数据:", encrypted);

	// 解密
	const decrypted = decryptWithPrivateKey(encrypted);
	if (!decrypted) {
		console.error("解密失败");
		return;
	}
	console.log("解密后的数据:", decrypted);
}

exampleUsage();

export { encryptWithPublicKey };
