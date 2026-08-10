package com.anitracker.backend.service;

import com.anitracker.backend.model.Anime;
import com.anitracker.backend.model.User;
import com.anitracker.backend.repo.userRepo;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Optional;

@org.springframework.stereotype.Service
public class Service {

    @Autowired
    private userRepo repo;

    public User createUser(User user){
        return repo.save(user);
    }

    public User getUserByEmail(String email) {
        return repo.findById(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public User addAnimeToWatchlist(String email, Anime incomingAnime){
        User user = getUserByEmail(email);

        Optional<Anime> existingAnime = user.getAnimeList().stream()
                .filter(a -> a.getId() == incomingAnime.getId())
                .findFirst();

        if (existingAnime.isPresent()) {
            Anime target = existingAnime.get();
            if (incomingAnime.getStatus() != null) {
                target.setStatus(incomingAnime.getStatus());
            }
            if (incomingAnime.getWatchedEpisodes() != null) {
                target.setWatchedEpisodes(incomingAnime.getWatchedEpisodes());
                target.setEpisodesWatched(incomingAnime.getWatchedEpisodes().size());
            }
            // THE CHANGE: Update total episodes for an existing anime
            if (incomingAnime.getTotalEpisodes() > 0) {
                target.setTotalEpisodes(incomingAnime.getTotalEpisodes());
            }
        } else {
            if (incomingAnime.getStatus() == null) {
                incomingAnime.setStatus("WATCHLIST");
            }
            if (incomingAnime.getWatchedEpisodes() != null) {
                incomingAnime.setEpisodesWatched(incomingAnime.getWatchedEpisodes().size());
            }
            // THE CHANGE: Save total episodes when adding a brand new anime
            if (incomingAnime.getTotalEpisodes() > 0) {
                incomingAnime.setTotalEpisodes(incomingAnime.getTotalEpisodes()); // While redundant for a direct save, this ensures safety if defaults change
            }
            user.getAnimeList().add(incomingAnime);
        }

        return repo.save(user);
    }


    public User updateEpisodesWatched(String email, int animeId, int episodes) {
        User user = getUserByEmail(email);

        for (Anime anime : user.getAnimeList()) {
            if (anime.getId() == animeId) {
                anime.setEpisodesWatched(episodes);

                if (episodes > 0 && "WATCHLIST".equals(anime.getStatus())) {
                    anime.setStatus("WATCHING");
                }
                break;
            }
        }
        return repo.save(user);
    }

    public User updateAnimeStatus(String email, int animeId, String newStatus) {
        User user = getUserByEmail(email);

        for (Anime anime : user.getAnimeList()) {
            if (anime.getId() == animeId) {
                anime.setStatus(newStatus);
                break;
            }
        }
        return repo.save(user);
    }

    public User removeAnime(String email, int animeId) {
        User user = getUserByEmail(email);
        user.getAnimeList().removeIf(anime -> anime.getId() == animeId);
        return repo.save(user);
    }
}