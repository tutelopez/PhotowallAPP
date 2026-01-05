import QRCode from 'qrcode';

export const generateEventQR = async (url: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(url, {
      width: 300,
      margin: 2
    });
  } catch (error) {
    throw new Error('Error generando QR');
  }
};
