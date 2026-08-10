package com.anitracker.backend.repo;

import com.anitracker.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface userRepo extends MongoRepository<User, String> {

}
