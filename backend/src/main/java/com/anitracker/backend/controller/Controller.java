package com.anitracker.backend.controller;

import com.anitracker.backend.model.Anime;
import com.anitracker.backend.model.User;
import com.anitracker.backend.service.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "${FRONTEND_URL:http://localhost:5173}")
public class Controller {

    @Autowired
    private Service userService;

    // --- 1. Account Endpoints ---
    // POST /api/users
    // Body: { "email": "test@test.com", "userName": "Goku", "password": "password123" }
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User savedUser = userService.createUser(user);
        return ResponseEntity.ok(savedUser);
    }

    // GET /api/users/test@test.com
    @GetMapping("/{email}")
    public ResponseEntity<User> getUser(@PathVariable String email) {
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    // --- 2. Anime Tracking Endpoints ---

    // POST /api/users/test@test.com/anime
    // Body: { "id": 20, "title": "Naruto", "poster": "http://..." }
    @PostMapping("/{email}/anime")
    public ResponseEntity<User> addAnimeToWatchlist(
            @PathVariable String email,
            @RequestBody Anime anime) {

        User updatedUser = userService.addAnimeToWatchlist(email, anime);
        return ResponseEntity.ok(updatedUser);
    }

    // PUT /api/users/test@test.com/anime/20/episodes?count=12
    @PutMapping("/{email}/anime/{animeId}/episodes")
    public ResponseEntity<User> updateEpisodesWatched(
            @PathVariable String email,
            @PathVariable int animeId,
            @RequestParam("count") int episodes) {

        User updatedUser = userService.updateEpisodesWatched(email, animeId, episodes);
        return ResponseEntity.ok(updatedUser);
    }

    // PUT /api/users/test@test.com/anime/20/status?state=COMPLETED
    @PutMapping("/{email}/anime/{animeId}/status")
    public ResponseEntity<User> updateAnimeStatus(
            @PathVariable String email,
            @PathVariable int animeId,
            @RequestParam("state") String status) {

        User updatedUser = userService.updateAnimeStatus(email, animeId, status);
        return ResponseEntity.ok(updatedUser);
    }

    // DELETE /api/users/test@test.com/anime/20
    @DeleteMapping("/{email}/anime/{animeId}")
    public ResponseEntity<User> removeAnime(
            @PathVariable String email,
            @PathVariable int animeId) {

        User updatedUser = userService.removeAnime(email, animeId);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {
        try {
            User user = userService.getUserByEmail(loginRequest.getEmail());

            // Explicitly check if the password from the DB matches the password they typed
            if (user.getPassword() != null && user.getPassword().equals(loginRequest.getPassword())) {
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(401).body("Invalid password");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body("User not found");
        }
    }
}
