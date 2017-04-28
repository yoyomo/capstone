#line 1 "C:/Users/Jesus/Documents/ICOM5047/CC3200/remoteControlHTTP/remoteControlHTTP.ino"
#include <WiFi.h>

#define LITER_PER_PULSE 0.0745    


#include "Energia.h"

void setup();
void loop();
boolean endsWith(char* inString, char* compString);
void printWifiStatus();
void sensor0_ISR();
void sensor1_ISR();
void sensor2_ISR();
void sensor3_ISR();

#line 6
IPAddress staticIp(192, 168, 0, 20);



char ssid[] = "LIB-7326462";

char password[] = "rntxgfFh38pq";


int sensors[4] = {5, 6, 7, 8};          
int valves[4] = {19, 18, 17, 14};       
boolean valveOn[4] = {false, false, false, false};
int valve_id = -1;                      

char ammount_string[11] = {0};          
int literAmount[4] = { -1, -1, -1, -1}; 

int pulseCount[4] = {0, 0, 0, 0};       

boolean messageOK = false;



WiFiServer server(80);

void setup() {

  
  pinMode(valves[0], OUTPUT);
  pinMode(valves[1], OUTPUT);
  pinMode(valves[2], OUTPUT);
  pinMode(valves[3], OUTPUT);
  pinMode(sensors[0], INPUT);
  pinMode(sensors[1], INPUT);
  pinMode(sensors[2], INPUT);
  pinMode(sensors[3], INPUT);
  digitalWrite(valves[0], LOW);
  digitalWrite(valves[1], LOW);
  digitalWrite(valves[2], LOW);
  digitalWrite(valves[3], LOW);

  attachInterrupt(sensors[0], sensor0_ISR, RISING);
  attachInterrupt(sensors[1], sensor1_ISR, RISING);
  attachInterrupt(sensors[2], sensor2_ISR, RISING);
  attachInterrupt(sensors[3], sensor3_ISR, RISING);

  Serial.begin(115200);      


  
  Serial.print("Attempting to connect to Network named: ");
  
  Serial.println(ssid);
  



  WiFi.begin(ssid, password);
  while ( WiFi.status() != WL_CONNECTED) {
    
    Serial.print(".");
    delay(300);
  }

  Serial.println("\nYou're connected to the network");
  Serial.println("Waiting for an ip address");
  WiFi.config(staticIp);

  while (WiFi.localIP() == INADDR_NONE) {
    
    Serial.print(".");
    delay(300);
  }

  Serial.println("\nIP Address obtained");

  
  printWifiStatus();

  Serial.println("Starting webserver on port 80");
  server.begin();                           
  Serial.println("Webserver started!");
}

void loop() {
  
  int i = 0;
  WiFiClient client = server.available();   
  interrupts();
  if (client) {                             
    Serial.println("new client");           
    char buffer[150] = {0};                 
    while (client.connected()) {            
      if (client.available()) {             
        char c = client.read();             
        Serial.write(c);                    
        if (c == '\n') {                    

          
          
          if (strlen(buffer) == 0) {
            
            
            client.println("HTTP/1.1 200 OK");
            client.println("Content-type:text/html");
            client.println("[{\"status\":\"received\"}]");










            
            break;
          }
          else {      
            memset(buffer, 0, 150);
            i = 0;
          }
        }
        else if (c != '\r') {    
          buffer[i++] = c;      
        }

        
        if (endsWith(buffer, "HTTP/1.1")) {
          int j = 0;
          valve_id = buffer[28] - '0';
          if (valve_id >= 0 && valve_id < 4) {
            while (buffer[j + 43] != '%') {
              ammount_string[j] = buffer[j + 43];
              
              j++;
            }
            literAmount[valve_id] = atoi(ammount_string);
            messageOK = true;
          }
        }
      }
    }
    
    client.stop();
    Serial.println("client disonnected");
    if (messageOK) {
      Serial.print("valve_id: ");
      Serial.println(valve_id);
      Serial.print("\nAmount: ");
      Serial.println(literAmount[valve_id]);
      digitalWrite(valves[valve_id], HIGH);
      valveOn[valve_id] = true;
      Serial.print("Valve on: ");
      Serial.println(valveOn[valve_id]);
      messageOK = false;
      memset(ammount_string, 0, 11);
      
    }
  }
}





boolean endsWith(char* inString, char* compString) {
  int compLength = strlen(compString);
  int strLength = strlen(inString);

  
  int i;
  for (i = 0; i < compLength; i++) {
    char a = inString[(strLength - 1) - i];
    char b = compString[(compLength - 1) - i];
    if (a != b) {
      return false;
    }
  }
  return true;
}

void printWifiStatus() {
  
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  
  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
  
  Serial.print("To see this page in action, open a browser to http://");
  Serial.println(ip);
}


void sensor0_ISR() {
  noInterrupts();
  if (valveOn[0]) {
    if ((pulseCount[0] * LITER_PER_PULSE)  < literAmount[0]) {
      pulseCount[0] = pulseCount[0] + 1;
    }
    else {
      digitalWrite(valves[0], LOW);
      valveOn[0] = false;
      pulseCount[0] = 0;
    }
  }
  interrupts();
}
void sensor1_ISR() {
  noInterrupts();
  if (valveOn[1]) {
    if ((pulseCount[1] * LITER_PER_PULSE)  < literAmount[1]) {
      pulseCount[1] = pulseCount[1] + 1;

    }
    else {
      digitalWrite(valves[1], LOW);
      valveOn[1] = false;
      pulseCount[1] = 0;
    }
  }
  interrupts();
}
void sensor2_ISR() {
  noInterrupts();
  if (valveOn[2]) {
    if ((pulseCount[2] * LITER_PER_PULSE)  < literAmount[2]) {
      pulseCount[2] = pulseCount[2] + 1;
    }
    else {
      digitalWrite(valves[2], LOW);
      valveOn[2] = false;
      pulseCount[2] = 0;
    }
  }
  interrupts();
}
void sensor3_ISR() {
  noInterrupts();
  if (valveOn[3]) {
    if ((pulseCount[3] * LITER_PER_PULSE)  < literAmount[3]) {
      pulseCount[3] = pulseCount[3] + 1;
    }
    else {
      digitalWrite(valves[3], LOW);
      valveOn[3] = false;
      pulseCount[3] = 0;
    }
  }
  interrupts();
}




