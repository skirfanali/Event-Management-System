package com.eventhub.config;

import com.eventhub.entity.Category;
import com.eventhub.entity.User;
import com.eventhub.enums.Role;
import com.eventhub.repository.CategoryRepository;
import com.eventhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository     userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder    passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedCategories();
    }

    private void seedAdmin() {
        if (!userRepository.existsByEmail("admin@eventhub.com")) {
            User admin = User.builder()
                    .name("System Admin")
                    .email("admin@eventhub.com")
                    .password(passwordEncoder.encode("Admin@1234"))
                    .role(Role.ADMIN)
                    .active(true)
                    .emailVerified(true)
                    .build();
            userRepository.save(admin);
            log.info("✅ Default admin created: admin@eventhub.com / Admin@1234");
        }
    }

    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            List<Category> categories = List.of(
                Category.builder().name("Technical").icon("💻").color("#6366f1").description("Hackathons, coding contests, tech talks").build(),
                Category.builder().name("Cultural").icon("🎭").color("#f43f5e").description("Dance, drama, art and cultural performances").build(),
                Category.builder().name("Sports").icon("⚽").color("#22c55e").description("Tournaments, sports events and competitions").build(),
                Category.builder().name("Academic").icon("📚").color("#f59e0b").description("Seminars, symposiums and research events").build(),
                Category.builder().name("Workshop").icon("🔧").color("#8b5cf6").description("Hands-on learning workshops").build(),
                Category.builder().name("Hackathon").icon("🚀").color("#06b6d4").description("24-48 hour coding hackathons").build(),
                Category.builder().name("Music").icon("🎵").color("#ec4899").description("Live concerts and music nights").build(),
                Category.builder().name("Art").icon("🎨").color("#f97316").description("Art exhibitions and creative events").build()
            );
            categoryRepository.saveAll(categories);
            log.info("✅ {} categories seeded", categories.size());
        }
    }
}
