package com.example.backend.shared.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

@Configuration
public class R2StorageConfig {

    @Value("${app.r2.endpoint}")
    private String endpoint;

    @Value("${app.r2.region}")
    private String region;

    @Value("${app.r2.access-key}")
    private String accessKey;

    @Value("${app.r2.secret-key}")
    private String secretKey;

    @Bean
    public S3Client s3Client() {
        Region s3Region = "auto".equalsIgnoreCase(region) ? Region.US_EAST_1 : Region.of(region);
        URI endpointUri = parseEndpointUri(endpoint);

        return S3Client.builder()
                .endpointOverride(endpointUri)
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(
                                (accessKey != null && !accessKey.isBlank()) ? accessKey : "dummy_access_key",
                                (secretKey != null && !secretKey.isBlank()) ? secretKey : "dummy_secret_key"
                        )
                ))
                .region(s3Region)
                .serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(true)
                        .build())
                .build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        Region s3Region = "auto".equalsIgnoreCase(region) ? Region.US_EAST_1 : Region.of(region);
        URI endpointUri = parseEndpointUri(endpoint);

        return S3Presigner.builder()
                .endpointOverride(endpointUri)
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(
                                (accessKey != null && !accessKey.isBlank()) ? accessKey : "dummy_access_key",
                                (secretKey != null && !secretKey.isBlank()) ? secretKey : "dummy_secret_key"
                        )
                ))
                .region(s3Region)
                .serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(true)
                        .build())
                .build();
    }

    private URI parseEndpointUri(String rawEndpoint) {
        if (rawEndpoint == null || rawEndpoint.isBlank()) {
            return URI.create("https://placeholder.r2.cloudflarestorage.com");
        }
        String formatted = rawEndpoint.trim();
        if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
            formatted = "https://" + formatted;
        }
        try {
            URI uri = URI.create(formatted);
            if (uri.getScheme() == null) {
                return URI.create("https://" + formatted);
            }
            return uri;
        } catch (Exception e) {
            return URI.create("https://placeholder.r2.cloudflarestorage.com");
        }
    }
}
