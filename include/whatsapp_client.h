// WhatsApp Client Header
// This header file contains the definitions and declarations for the WhatsApp client.

#ifndef WHATSAPP_CLIENT_H
#define WHATSAPP_CLIENT_H

// Function declarations
void initializeWhatsAppClient();
void sendMessage(const char* recipient, const char* message);
void receiveMessages();

#endif // WHATSAPP_CLIENT_H