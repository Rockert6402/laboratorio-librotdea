package com.tdea.librotdea.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS configuration that lets the frontend at {@code http://localhost:3000} call the API.
 */
@Configuration
public class CorsConfig {

    /**
     * Allows requests from {@code http://localhost:3000} to every path
     * with the GET, POST, PUT, DELETE and OPTIONS methods.
     *
     * @return the MVC configurer that registers the CORS mapping
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:3000")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
            }
        };
    }
}
