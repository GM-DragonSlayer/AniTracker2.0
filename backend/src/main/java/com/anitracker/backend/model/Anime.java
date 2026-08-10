package com.anitracker.backend.model;

import java.util.List;

public class Anime {

    private int id;
    private String titleRomaji;
    private String titleEnglish;
    private String poster;
    private String status;
    private int episodesWatched = 0;

    // THE MISSING FIELD: Tracks the exact episode numbers checked off in the UI
    private List<Integer> watchedEpisodes;

    // THE FIX: Track the total episodes so we can cap the +1 button
    private int totalEpisodes = 0;

    // --- Explicit Getters and Setters (Bypasses Docker Lombok Issues) ---

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTitleRomaji() { return titleRomaji; }
    public void setTitleRomaji(String titleRomaji) { this.titleRomaji = titleRomaji; }

    public String getTitleEnglish() { return titleEnglish; }
    public void setTitleEnglish(String titleEnglish) { this.titleEnglish = titleEnglish; }

    public String getPoster() { return poster; }
    public void setPoster(String poster) { this.poster = poster; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getEpisodesWatched() { return episodesWatched; }
    public void setEpisodesWatched(int episodesWatched) { this.episodesWatched = episodesWatched; }

    public List<Integer> getWatchedEpisodes() { return watchedEpisodes; }
    public void setWatchedEpisodes(List<Integer> watchedEpisodes) { this.watchedEpisodes = watchedEpisodes; }

    public int getTotalEpisodes() { return totalEpisodes; }
    public void setTotalEpisodes(int totalEpisodes) { this.totalEpisodes = totalEpisodes; }
}