// message_handler.cpp

#include <iostream>
#include <string>

class MessageHandler {
public:
    void handleMessage(const std::string &message) {
        std::cout << "Handling message: " << message << std::endl;
        // Add your message handling logic here
    }
};

int main() {
    MessageHandler handler;
    handler.handleMessage("Hello, World!");
    return 0;
}