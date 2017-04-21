// Waterflow Sensor test
int count = 0;
int prevCount = 0;
int sensor1 = 5;      // Pin P61 of the launchpad

void setup() {
  // put your setup code here, to run once:

  pinMode(sensor1, INPUT);
  attachInterrupt(sensor1, buttonCount, RISING);

  Serial.begin(115200);

}

void loop() {
  // put your main code here, to run repeatedly: 
  noInterrupts();
  Serial.print("Sensor Count");
  Serial.print(count);
  Serial.print("\n");

  while(1){
    interrupts();
    if(prevCount != count){
      Serial.print(count);
      Serial.print("\n");
      prevCount = count;
    }
  }
}


// ISR
void buttonCount(){
  count = count +1;
}


