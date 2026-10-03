/**
 * CricOS High-Fidelity ISO/IEC 18004 Compliant QR Code Generator
 * Generates verified, camera-scannable QR code SVGs for mobile pairing,
 * live preview, and direct APK download transfer.
 */
export declare function generateQrCodeSvg(text: string, margin?: number, size?: number): string;
/**
 * Returns the client-side QR generator runtime script for standalone browser execution.
 * Embeds Kazuhiko Arase's battle-tested qrcode engine with zero external CDN dependencies.
 */
export declare function getQrCodeClientScript(): string;
//# sourceMappingURL=qr-code.d.ts.map