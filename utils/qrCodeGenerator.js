// QR Code Generator untuk Testing
// Fungsi sederhana untuk generate QR codes untuk situs yang ada

export const AVAILABLE_QR_CODES = {
  BOROBUDUR: {
    qr_code: 'BOROBUDUR_QR_2024',
    situs_name: 'Candi Borobudur',
    lokasi: 'Magelang, Jawa Tengah',
    description: 'QR code untuk mengakses informasi Candi Borobudur'
  },
  PRAMBANAN: {
    qr_code: 'PRAMBANAN_QR_2024', 
    situs_name: 'Candi Prambanan',
    lokasi: 'Yogyakarta',
    description: 'QR code untuk mengakses informasi Candi Prambanan'
  }
};

// Function untuk validasi QR code
export const validateQRCode = (qrCodeData) => {
  const validCodes = Object.values(AVAILABLE_QR_CODES).map(code => code.qr_code);
  return validCodes.includes(qrCodeData);
};

// Function untuk mendapatkan info situs dari QR code
export const getSitusInfoFromQR = (qrCodeData) => {
  return Object.values(AVAILABLE_QR_CODES).find(code => code.qr_code === qrCodeData);
};

// Function untuk generate QR code URL (untuk testing dengan online QR generator)
export const generateQRCodeURL = (qrCodeData) => {
  const baseURL = 'https://api.qrserver.com/v1/create-qr-code/';
  const params = new URLSearchParams({
    size: '200x200',
    data: qrCodeData,
    format: 'png'
  });
  return `${baseURL}?${params.toString()}`;
};

// Export semua QR codes yang tersedia
export const getAllQRCodes = () => {
  return Object.values(AVAILABLE_QR_CODES);
};

// Instructions untuk testing
export const TESTING_INSTRUCTIONS = `
🎯 CARA TESTING QR SCANNER:

1. WEB VERSION (Manual Input):
   - Buka QR Scanner
   - Input manual: "BOROBUDUR_QR_2024" atau "PRAMBANAN_QR_2024"
   - Atau gunakan tombol test yang tersedia

2. MOBILE VERSION (Scan QR):
   - Generate QR code dengan online generator
   - Gunakan text: "BOROBUDUR_QR_2024" atau "PRAMBANAN_QR_2024"
   - Scan dengan aplikasi

3. QR CODE GENERATOR ONLINE:
   - Buka: https://www.qr-code-generator.com/
   - Pilih "Text"
   - Input: BOROBUDUR_QR_2024 atau PRAMBANAN_QR_2024
   - Generate dan scan dengan aplikasi
`;
