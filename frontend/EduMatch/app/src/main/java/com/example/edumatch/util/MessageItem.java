package com.example.edumatch.util;

public class MessageItem {
    private final String text;
    private final boolean isUserMessage;

    // ChatGPT usage: Yes
    public MessageItem(String text, boolean isUserMessage) {
        this.text = text;
        this.isUserMessage = isUserMessage;
    }

    // ChatGPT usage: Yes
    public String getText() {
        return text;
    }

    // ChatGPT usage: Yes
    public boolean isUserMessage() {
        return isUserMessage;
    }
}