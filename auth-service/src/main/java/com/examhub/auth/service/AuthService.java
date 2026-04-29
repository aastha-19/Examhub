package com.examhub.auth.service;

import com.examhub.auth.entity.User;
import com.examhub.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    public String saveUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already registered");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return "User added to the system";
    }

    public String generateToken(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        Long id = user.get().getId();
        String role = user.get().getRole();
        String name = user.get().getName();
        String className = user.get().getClassName();
        return jwtService.generateToken(id, email, name, role, className);
    }

    public void validateToken(String token) {
        jwtService.validateToken(token);
    }
}
