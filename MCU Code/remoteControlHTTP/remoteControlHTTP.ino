#include <WiFi.h>

#define LITER_PER_PULSE 0.0745    // 1/13.42

/******************************************************
 ************* Network variables ********************** 
 ******************************************************/

IPAddress staticIp(192, 168, 43, 203);

byte mac[6];                            // mac address 
// your network name also called SSID
char ssid[] = "GALAXY_S4_4853";
// your network password
char password[] = "lepx9639";

/*****************************************************
 *********** Sensors & Valves ************************ 
 *****************************************************/
// Valve variables
int sensors[4] = {5, 6, 7, 8};          // sensor pins: P61, P59, P05, P62
int valves[4] = {19, 18, 17, 14};       // Valve pins: P18, P08, P45, P06
boolean valveOn[4] = {false, false, false, false};
int valve_id = -1;                      // initialize to invalid value

char ammount_string[11] = {0};          // extract the amount sent through the request
int literAmount[4] = { -1, -1, -1, -1}; // store amount of liters sent through the request

int pulseCount[4] = {0, 0, 0, 0};       // keep track of sensor pulses

boolean messageOK = false;              // Received a valid message
boolean irrigateOK = false;             // Received irrigation message
boolean stopOK = false;                 // Received stop message



WiFiServer server(80);

void setup() {

  // Set up GPIO
  pinMode(valves[0], OUTPUT);
  pinMode(valves[1], OUTPUT);
  pinMode(valves[2], OUTPUT);
  //pinMode(valves[3], OUTPUT);
  pinMode(sensors[0], INPUT);
  pinMode(sensors[1], INPUT);
  pinMode(sensors[2], INPUT);
  //pinMode(sensors[3], INPUT);
  digitalWrite(valves[0], LOW);
  digitalWrite(valves[1], LOW);
  digitalWrite(valves[2], LOW);
  //digitalWrite(valves[3], LOW);

  attachInterrupt(sensors[0], sensor0_ISR, RISING);
  attachInterrupt(sensors[1], sensor1_ISR, RISING);
  attachInterrupt(sensors[2], sensor2_ISR, RISING);
  //attachInterrupt(sensors[3], sensor3_ISR, RISING);

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
  WiFi.config(staticIp);

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
            client.println("Content-type:application/json");
            client.println("{\"status\":\"received\"}");

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

        // Check to see which of the client requests it is: irrigate, stop, or checkstatus:
        if (endsWith(buffer, "HTTP/1.1")) {
          int j = 0;
          Serial.println("reading GET header");
          if (buffer[11] == 'i'){                       // GET /micro/irrigate/
            Serial.println("in irrigate command");
            Serial.println(buffer[11]);
            Serial.println(buffer[19]);
            if(buffer[20] == '%'){                      // if the get requests displays the { as %7D
              Serial.println("When { is %7D");
              if(buffer[37] == '%'){                    // if " is show as %22
                Serial.println("when the number is surrounded by \" ");
                Serial.println(buffer[39]);
                valve_id = buffer[40] - '0';
                Serial.println(valve_id);
                if (valve_id >= 0 && valve_id < 4) {
                  while (buffer[j + 59] != '%') {
                    ammount_string[j] = buffer[j + 59];
                    //Serial.print(ammount_string[j]);
                    j++;
                  }  
                }
              } // end condition for " "
              else{                                     // if there is not " character surrounding the numbers
                Serial.println("when the number is not surrounded by \"");
                valve_id = buffer[37] - '0';
                if (valve_id >= 0 && valve_id < 4) {
                  while (buffer[j + 52] != '%') {
                    ammount_string[j] = buffer[j + 52];
                    //Serial.print(ammount_string[j]);
                    j++;
                  }  
                }
              } // end condition for the case where the numbers are NOT surrounded by " " 
            } // end case where the { is displayed as %7D
            
            if(buffer[20] == '{'){                      // for when the message displays { as {
              Serial.println("if { shows as {");
              if(buffer[35] == '%'){                    // if the numbers are surrounded by " " 
                Serial.println("number surrouded by \"");
                valve_id = buffer[38] - '0';
                if (valve_id >= 0 && valve_id < 4) {
                  while (buffer[j + 59] != '}') {
                    ammount_string[j] = buffer[j + 59];
                    //Serial.print(ammount_string[j]);
                    j++;
                  }
                }
              } // end condition where the numbers are surrounded by " "
              else {
                Serial.println("number not surrounded by \" ");
                valve_id = buffer[35] - '0';
                if (valve_id >= 0 && valve_id < 4) {
                  while (buffer[j + 50] != '}') {
                    ammount_string[j] = buffer[j + 50];
                    //Serial.print(ammount_string[j]);
                    j++;
                  }
                }
              } // end case where nothing surrounds the numbers
            }// end case where { is displayed as is
            
            literAmount[valve_id] = atoi(ammount_string);
            irrigateOK = true;  
            Serial.println("Exiting irrigate command");
          
          } // end procedure for the /micro/irrigate/ command
          
          if (buffer[11] == 's'){                       // GET /micro/stop/
            Serial.println("in stop command");
            if(buffer[16] == '%'){                      // for when the message displays { as %7D
              if(buffer[33] == '%'){                    // check if the number is surrounded by " "  
                valve_id = buffer[36] - '0';
              }
              else {
                valve_id = buffer[33] - '0';
              }
            }
            if(buffer[16] == '{'){
              if(buffer[31] == '%'){                    // check if the number is surrounded by " "  
                valve_id = buffer[34] - '0';
              }
              else {
                valve_id = buffer[31] - '0';
              }
            }
            stopOK = true;
          }// end of /micro/stop/ command
          if (buffer[11] == 'c'){                       // GET /micro/checkstatus
            
          }
         }
       }
     }
   
    // close the connection:
    client.stop();
    Serial.println("client disonnected");
    if (irrigateOK) {
      Serial.println("irrigate");
      Serial.print("valve_id: ");
      Serial.println(valve_id);
      Serial.print("\nAmount: ");
      Serial.println(literAmount[valve_id]);
      digitalWrite(valves[valve_id], HIGH);
      valveOn[valve_id] = true;
      Serial.print("Valve on: ");
      Serial.println(valveOn[valve_id]);
      irrigateOK = false;
      memset(ammount_string, 0, 11);
    }
    if(stopOK){
      Serial.println("stop");
      Serial.println(valve_id);
      digitalWrite(valves[valve_id], LOW);
      valveOn[valve_id] = false;
      pulseCount[valve_id] = 0; 
      stopOK = false;
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

// prints Current status after connecting to a network. 
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
  WiFi.macAddress(mac);
  Serial.print("MAC: ");
  Serial.print(mac[5],HEX);
  Serial.print(":");
  Serial.print(mac[4],HEX);
  Serial.print(":");
  Serial.print(mac[3],HEX);
  Serial.print(":");
  Serial.print(mac[2],HEX);
  Serial.print(":");
  Serial.print(mac[1],HEX);
  Serial.print(":");
  Serial.println(mac[0],HEX);
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
//void sensor3_ISR() {
//  noInterrupts();
//  if (valveOn[3]) {
//    if ((pulseCount[3] * LITER_PER_PULSE)  < literAmount[3]) {
//      pulseCount[3] = pulseCount[3] + 1;
//    }
//    else {
//      digitalWrite(valves[3], LOW);
//      valveOn[3] = false;
//      pulseCount[3] = 0;
//    }
//  }
//  interrupts();
//}

