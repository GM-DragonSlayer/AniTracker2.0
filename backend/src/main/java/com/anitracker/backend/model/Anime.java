package com.anitracker.backend.model;
import lombok.Data;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

@Data
public class Anime {
    private int id;
    private String titleRomaji;
    private String titleEnglish;
    private String poster;
    private String status;

    private int episodesWatched = 0;
    private List<Integer> watchedEpisodes = new ArrayList<>();
}