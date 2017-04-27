/* Operating Valves through Wifi
 *  
 *  
 *  
 * Last update: 4/24/2017
 */

#include <WiFi.h>

#define BUFF_SIZE 128

// Network name and password
char ssid[] = "LIB-7326462";
char password[] = "rntxgfFh38pq";

// other variables
char clientBuffer[BUFF_SIZE];
int valves[] = {19, 18, 17, 14}; // Pins that control the valves P18, P06, P45, P07


WiFiServer server(23);

boolean alreadyConnected = false;

void setup() {
  // Set GPIO
  pinMode(valves[0], OUTPUT);
  pinMode(valves[1], OUTPUT);
  pinMode(valves[2], OUTPUT);
  pinMode(valves[3], OUTPUT);
  
  // reset variables
  clearClientBuffer();
  
  // Connect to network
  Serial.begin(115200);
  Serial.print("Attempt to connect to Network named: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while(WiFi.status() != WL_CONNECTED) {
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
  printWifiStatus();

  server.begin();
}

void loop() {
  // client
  WiFiClient client = server.available();

  if(client){
    if(!alreadyConnected){
      client.flush();
      Serial.println("We Have a new client");
      client.println("Hello, client!");
      alreadyConnected = true;
    }

    if(client.available() > 0){
      int index = 0; 
      Serial.write(client.read());
      //clientBuffer[index] = client.read();
      //index = (index+1) % 128;
      //Serial.write(clientBuffer[index]);
      //valveOperation((int)clientBuffer[0]);
      
    }
  }
  else{
    Serial.println("No Client");
    delay(300);
  }

   
  
}

// Operate indicated valve and turn off after enough water goes through
void valveOperation(int valve){
  digitalWrite(valves[valve], HIGH);
  delay(2000);
  digitalWrite(valves[valve], LOW);
}

// Utility Functions
void clearClientBuffer(){
  for(int i = 0; i<BUFF_SIZE; i++){
    clientBuffer[i] = '\0';
  }
}

void printWifiStatus() {
  // print the SSID of the network you're attached to:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your WiFi shield's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // print the received signal strength:
  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
}

