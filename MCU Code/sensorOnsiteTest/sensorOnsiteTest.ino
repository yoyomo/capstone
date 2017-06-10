#define LITER_PER_PULSE 0.0745    // 1/13.42

// Valve variables
int sensors[4] = {5, 6, 7, 8};          // sensor pins
int valves[4] = {19, 18, 17, 14};       // Valve pins

int count0 = 0;
int count1 = 0;
int count2 = 0;
int liters0 = 0; 
int liters1 = 0;
int liters2 = 0;


void setup() {
  // Set up GPIO
  //pinMode(valves[0], OUTPUT);
  //pinMode(valves[1], OUTPUT);
  //pinMode(valves[2], OUTPUT);
  
    pinMode(sensors[0], INPUT);
    pinMode(sensors[1], INPUT);
    pinMode(sensors[2], INPUT);
  
  //digitalWrite(valves[0], LOW);
  //digitalWrite(valves[1], LOW);
  //digitalWrite(valves[2], LOW);
 

  attachInterrupt(sensors[0], sensor0_ISR, RISING);
  attachInterrupt(sensors[1], sensor1_ISR, RISING);
  attachInterrupt(sensors[2], sensor2_ISR, RISING);
  

  Serial.begin(115200);      // initialize serial communication
  Serial.println("Liters:");
}

void loop() {
  // put your main code here, to run repeatedly: 
  liters0 = LITER_PER_PULSE * count0;
  liters1 = LITER_PER_PULSE * count1;
  liters2 = LITER_PER_PULSE * count2; 
  Serial.print(liters0);
  Serial.print("     ");
  Serial.print(liters1);
  Serial.print("     ");
  Serial.println(liters2);
  
}



void sensor0_ISR(){
  count0 = count0 +1; 
}


void sensor1_ISR(){
  count1 = count1 +1; 
}


void sensor2_ISR(){
  count2 = count2 +1; 
}

