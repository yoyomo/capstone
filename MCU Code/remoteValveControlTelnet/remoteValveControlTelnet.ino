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
int valve[] = {0, 1, 2, 3, 4};

WiFiServer server(23);

boolean alreadyConnected = false;

void setup() {
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
      clientBuffer[index] = client.read();
      index = (index+1) % 128;
      Serial.write(clientBuffer[index - 1]);
      
    }
  }
  else{
    Serial.println("No Client");
    delay(300);
  }

   
  
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

