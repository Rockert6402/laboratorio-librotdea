package com.tdea.librotdea.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI / Swagger UI configuration.
 */
@Configuration
public class OpenApiConfig {

    /**
     * Defines the API metadata shown in Swagger UI.
     *
     * @return the OpenAPI definition
     */
    @Bean
    public OpenAPI librotdeaOpenApi() {
        return new OpenAPI().info(new Info()
                .title("LibroTdeA API")
                .description("REST API for the LibroTdeA backend")
                .version("0.0.1"));
    }
}
