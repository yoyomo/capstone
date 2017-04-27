// Set up 4 PWM signals for the MSP430FR6989 
// to act as sensor pulses for the CC3200 
// represeting the water flow sensors. 

int sensors[4] = {P2_7, P2_6, P3_3, P3_6};

void setup() {
  // set up GPIO
  pinMode(sensors[0], OUTPUT);
  pinMode(sensors[1], OUTPUT);
  pinMode(sensors[2], OUTPUT);
  pinMode(sensors[3], OUTPUT);

}

void loop() {
  // start sending PWM signals
  analogWrite(sensors[0], 127);
  analogWrite(sensors[1], 127);
  analogWrite(sensors[2], 127);
  analogWrite(sensors[3], 127);
  while(true);
  
}
