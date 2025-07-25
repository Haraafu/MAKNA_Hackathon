#include <Arduino.h>
#include <qrcode.h>
#define TRIG_PIN 7
#define ECHO_PIN 6

bool qrDisplayed = false;

// Karena masih serial monitor, masih belum bisa di clear menggunakan ANSI
void clearScreen() {
  for (int i = 0; i < 50; i++) {
    Serial.println();
  }
}


void generateQRCode() {
  String qrText = "bc28eb34-ddae-4504-932d-7d45efda169e"; //candi borobudur
  Serial.println("=================================");
  Serial.println("Generating new QR Code...");
  Serial.println("=================================");

  QRCode qrcode;
  uint8_t qrcodeData[qrcode_getBufferSize(3)];
  qrcode_initText(&qrcode, qrcodeData, 3, 0, qrText.c_str());

  for (uint8_t y = 0; y < qrcode.size; y++) {
    for (uint8_t x = 0; x < qrcode.size; x++) {
      Serial.print(qrcode_getModule(&qrcode, x, y) ? "██" : "  ");
    }
    Serial.println();
  }
}

long readDistanceCM() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH);
  long distance = duration * 0.034 / 2;
  return distance;
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  delay(1000);

  Serial.println("QR Code Generator Activated");
  Serial.println("Bring an object closer (<10cm) to show QR Code");
}

void loop() {
  long distance = readDistanceCM();

  if (distance > 0 && distance <= 10 && !qrDisplayed) {
    clearScreen();
    generateQRCode();
    qrDisplayed = true;
  } 
  else if ((distance > 10 || distance == 0) && qrDisplayed) {
    clearScreen();
    qrDisplayed = false;
  }

  delay(500);
}