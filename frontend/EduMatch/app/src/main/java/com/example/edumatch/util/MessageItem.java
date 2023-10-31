package com.example.edumatch.util;

public class MessageItem {
    private final String text;
    private final boolean isUserMessage;

    public MessageItem(String text, boolean isUserMessage) {
        this.text = text;
        this.isUserMessage = isUserMessage;
    }

    public String getText() {
        return text;
    }

    public boolean isUserMessage() {
        return isUserMessage;
    }
}