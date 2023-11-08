package com.example.edumatch.util;


import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.LinearLayout;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.edumatch.views.MessageChipView;

import java.util.List;

public class MessageAdapter extends RecyclerView.Adapter<MessageAdapter.MessageViewHolder> {
    private final List<MessageItem> messages;

    public MessageAdapter(List<MessageItem> messages) {
        this.messages = messages;
    }

    // ChatGPT usage: Yes
    @NonNull
    @Override
    public MessageViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        MessageChipView messageChipView = new MessageChipView(parent.getContext());
        return new MessageViewHolder(messageChipView);
    }

    // ChatGPT usage: Yes
    @Override
    public int getItemCount() {
        return messages.size();
    }

    // ChatGPT usage: Yes
    @Override
    public void onViewRecycled(@NonNull MessageViewHolder holder) {
        super.onViewRecycled(holder);
    }

    // ChatGPT usage: Yes
    @Override
    public void onBindViewHolder(MessageViewHolder holder, int position) {
        MessageItem messageItem = messages.get(position);
        holder.bind(messageItem);
    }

    // ChatGPT usage: Yes
    public static class MessageViewHolder extends RecyclerView.ViewHolder {
        private final MessageChipView messageChipView;

        // ChatGPT usage: Yes
        public MessageViewHolder(MessageChipView itemView) {
            super(itemView);
            messageChipView = itemView;
        }

        // ChatGPT usage: Yes
        public void bind(MessageItem messageItem) {
            messageChipView.setChipText(messageItem.getText());
            messageChipView.setIsReceiver(!messageItem.isUserMessage());

            // Set the width to 200dp
            LinearLayout.LayoutParams layoutParams = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
            );
            messageChipView.setLayoutParams(layoutParams);

            // Set the gravity to left if it's a received message
            if (!messageItem.isUserMessage()) {
                messageChipView.setGravity(Gravity.RIGHT);
            }
        }
    }

}

