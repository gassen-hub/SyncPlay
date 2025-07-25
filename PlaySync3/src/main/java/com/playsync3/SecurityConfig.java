package com.playsync3;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF so SockJS/STOMP handshakes can succeed
                .csrf(csrf -> csrf.disable())

                // Authorize requests
                .authorizeHttpRequests(auth -> auth
                        // Permit your public REST APIs
                        .requestMatchers(
                                "/api/testcases/**",
                                "/api/scripts/**",
                                "/api/schedules/**",
                                "/api/debug/**",
                                "/api/results/**",
                                "/api/dashboard/**",
                                "/api/screenshots/**"
                        ).permitAll()

                        // Permit native WS and SockJS endpoints
                        .requestMatchers(
                                "/ws-debug/**",
                                "/ws-debug-sockjs/**"
                        ).permitAll()

                        // Everything else requires authentication
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}
