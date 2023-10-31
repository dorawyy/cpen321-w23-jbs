package com.example.edumatch.util;

public class PaginationManager {

    private int currentPage = 1;
    private boolean isLastPage = false;
    private boolean isLoading = false;

    public int getCurrentPage() {
        return currentPage;
    }

    public void nextPage() {
        this.currentPage++;
    }

    public boolean isLastPage() {
        return isLastPage;
    }

    public void setLastPage(boolean lastPage) {
        isLastPage = lastPage;
    }

    public boolean isLoading() {
        return isLoading;
    }

    public void setLoading(boolean loading) {
        isLoading = loading;
    }
}
