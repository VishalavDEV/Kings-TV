package com.kingstv.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.kingstv.security.JwtAuthenticationFilter;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/v1/auth/**", 
                    "/api/auth/**",
                    "/uploads/**",
                    "/api/v1/health", 
                    "/api/v1/articles", "/api/v1/articles/**",
                    "/api/v1/categories", "/api/v1/categories/**",
                    "/api/v1/videos", "/api/v1/videos/**",
                    "/api/v1/pdfs", "/api/v1/pdfs/**",
                    "/api/v1/jobs", "/api/v1/jobs/**",
                    "/api/jobs", "/api/jobs/**",
                    "/api/resume/**", "/api/candidate/**", "/api/employer/**",
                    "/api/obituaries", "/api/obituaries/**",
                    "/api/v1/classifieds", "/api/v1/classifieds/**",
                    "/api/classifieds", "/api/classifieds/**",
                    "/api/sellers/**", "/api/my-classifieds",
                    "/api/v1/wishes", "/api/v1/wishes/**",
                    "/api/wishes", "/api/wishes/**",
                    "/api/v1/obituaries", "/api/v1/obituaries/**",
                    "/api/v1/directory", "/api/v1/directory/**",
                    "/api/v1/districts", "/api/v1/districts/**",
                    "/api/v1/home", "/api/v1/home/**",
                    "/api/v1/stories", "/api/v1/stories/**",
                    "/api/v1/web-stories", "/api/v1/web-stories/**",
                    "/api/v1/pages", "/api/v1/pages/**",
                    "/api/v1/comments", "/api/v1/comments/**",
                    "/api/v1/report-news/saveUpdate",
                    "/t/{shortCode}",
                    "/api/v1/deals", "/api/v1/deals/**",
                    "/api/v1/rfq", "/api/v1/rfq/**",
                    "/api/v1/nfc/stats", "/api/v1/nfc/taps",
                    "/robots.txt", "/sitemap.xml", "/rss.xml", "/news/**",
                    "/error"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
