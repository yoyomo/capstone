#include <WiFi.h>

#define LITER_PER_PULSE 0.0745    // 1/13.42

// your network name also called SSID
char ssid[] = "LIB-7326462";
// your network password
char password[] = "rntxgfFh38pq";

// Valve variables
int sensors[4] = {5, 6, 7, 8};          // sensor pins
int valves[4] = {19, 18, 17, 14};       // Valve pins
boolean valveOn[4] = {false, false, false, false};
int valve_id = -1;                      // initialize to invalid value

char ammount_string[11] = {0};          // extract the amount sent through the request
int literAmount[4] = { -1, -1, -1, -1}; // store amount of liters sent through the request

int pulseCount[4] = {0, 0, 0, 0};       // keep track of sensor pulses

boolean messageOK = false;



WiFiServer server(80);

void setup() {

  // Set up GPIO
  pinMode(valves[0], OUTPUT);
  pinMode(valves[1], OUTPUT);
  pinMode(valves[2], OUTPUT);
  pinMode(valves[3], OUTPUT);
  digitalWrite(valves[0], LOW);
  digitalWrite(valves[1], LOW);
  digitalWrite(valves[2], LOW);
  digitalWrite(valves[3], LOW);

  attachInterrupt(sensors[0], sensor0_ISR, RISING);
  attachInterrupt(sensors[1], sensor1_ISR, RISING);
  attachInterrupt(sensors[2], sensor2_ISR, RISING);
  attachInterrupt(sensors[3], sensor3_ISR, RISING);

  Serial.begin(115200);      // initialize serial communication


  // attempt to connect to Wifi network:
  Serial.print("Attempting to connect to Network named: ");
  // print the network name (SSID);
  Serial.println(ssid);
  // Connect to WPA/WPA2 network. Change this line if using open or WEP network:
  WiFi.begin(ssid, password);
  while ( WiFi.status() != WL_CONNECTED) {
    // print dots while we wait to connect
    Serial.print(".");
    delay(300);
  }

  Serial.println("\nYou're connected to the network");
  Serial.println("Waiting for an ip address");

  while (WiFi.localIP() == INADDR_NONE) {
    // print dots while we wait for an ip addresss
    Serial.print(".");
    delay(300);
  }

  Serial.println("\nIP Address obtained");

  // you're connected now, so print out the status
  printWifiStatus();

  Serial.println("Starting webserver on port 80");
  server.begin();                           // start the web server on port 80
  Serial.println("Webserver started!");
}

void loop() {
  //Serial.println(pulseCount[0]);
  int i = 0;
  WiFiClient client = server.available();   // listen for incoming clients
  interrupts();
  if (client) {                             // if you get a client,
    Serial.println("new client");           // print a message out the serial port
    char buffer[150] = {0};                 // make a buffer to hold incoming data
    while (client.connected()) {            // loop while the client's connected
      if (client.available()) {             // if there's bytes to read from the client,
        char c = client.read();             // read a byte, then
        Serial.write(c);                    // print it out the serial monitor
        if (c == '\n') {                    // if the byte is a newline character

          // if the current line is blank, you got two newline characters in a row.
          // that's the end of the client HTTP request, so send a response:
          if (strlen(buffer) == 0) {
            // HTTP headers always start with a response code (e.g. HTTP/1.1 200 OK)
            // and a content-type so the client knows what's coming, then a blank line:
            client.println("HTTP/1.1 200 OK");
            client.println("Content-type:text/html");
//            client.println();
//
//            // the content of the HTTP response follows the header:
//            client.println("<html><head><title>Energia CC3200 WiFi Web Server</title></head><body align=center>");
//            client.println("<h1 align=center><font color=\"red\">Welcome to the CC3200 WiFi Web Server</font></h1>");
//            client.print("RED LED <button onclick=\"location.href='/H'\">HIGH</button>");
//            client.println(" <button onclick=\"location.href='/L'\">LOW</button><br>");
//
//            // The HTTP response ends with another blank line:
//            client.println();
            // break out of the while loop:
            break;
          }
          else {      // if you got a newline, then clear the buffer:
            memset(buffer, 0, 150);
            i = 0;
          }
        }
        else if (c != '\r') {    // if you got anything else but a carriage return character,
          buffer[i++] = c;      // add it to the end of the currentLine
        }

        // Check to see if the client request was "GET /H" or "GET /L":
        if (endsWith(buffer, "HTTP/1.1")) {
          int j = 0;
          valve_id = buffer[25] - '0';
          if (valve_id >= 0 && valve_id < 4) {
            while (buffer[j + 46] != '%') {
              ammount_string[j] = buffer[j + 46];
              //Serial.print(ammount_string[j]);
              j++;
            }
            literAmount[valve_id] = atoi(ammount_string);
            messageOK = true;
          }
        }
      }
    }
    // close the connection:
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


//
//a way to check if one array ends with another array
//
boolean endsWith(char* inString, char* compString) {
  int compLength = strlen(compString);
  int strLength = strlen(inString);

  //compare the last "compLength" values of the inString
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
  // print the SSID of the network you're attached to:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your WiFi IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // print the received signal strength:
  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
  // print where to go in a browser:
  Serial.print("To see this page in action, open a browser to http://");
  Serial.println(ip);
}

// Interrupt Service Routines
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

