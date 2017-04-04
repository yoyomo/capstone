int sensor1 = 5;
int sensor2 = 6;
int sensor3 = 7;
int sensor4 = 8;
int valve1 = 19;
int valve2 = 18;
int valve3 = 17;
int valve4 = 15;
volatile int count = 0;

void setup() {
  // put your setup code here, to run once:

  // pin set up
  pinMode(sensor1, INPUT);
  pinMode(sensor2, INPUT);
  pinMode(sensor3, INPUT);
  pinMode(sensor4, INPUT);
  pinMode(valve1, OUTPUT);
  pinMode(valve2, OUTPUT);
  pinMode(valve3, OUTPUT);
  pinMode(valve4, OUTPUT);

  digitalWrite(valve1, LOW);
  digitalWrite(valve2, LOW);
  digitalWrite(valve3, LOW);
  digitalWrite(valve4, LOW);
  
  attachInterrupt(sensor1, counter1, RISING);
  //attachInterrupt(sensor2, counter, RISING);
  //attachInterrupt(sensor3, counter, RISING);
  //attachInterrupt(sensor4, counter, RISING);
}

void loop() {
  // put your main code here, to run repeatedly: 
  noInterrupts();
  delay(10000);
  valveOp(sensor1, valve1, 400);
  
}



void valveOp(int sensor, int valve, int liters){
  int totalLiters = 0;
  digitalWrite(valve, HIGH);
  interrupts();
  while(totalLiters <= liters){
    delay(10000);
    totalLiters = totalLiters + (count/45);
  }
  noInterrupts();
  digitalWrite(valve, LOW);
  count = 0;
}

// ISR
void counter1(){
  count = count +1;
}

