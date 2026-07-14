package com.kingstv;

import com.kingstv.models.User;
import com.kingstv.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;

@SpringBootApplication
public class BackendJavaApplication implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public static void main(String[] args) {
        SpringApplication.run(BackendJavaApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        updatePasswordIfPresent("admin@king24x7.com", "admin123");
        updatePasswordIfPresent("vendor@king24x7.com", "vendor123");
        updatePasswordIfPresent("editor@king24x7.com", "editor123");
        updatePasswordIfPresent("reporter@king24x7.com", "reporter123");
        updatePasswordIfPresent("user@king24x7.com", "user123");
    }

    private void updatePasswordIfPresent(String email, String rawPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
            System.out.println("Updated password for " + email);
        }
    }
}

