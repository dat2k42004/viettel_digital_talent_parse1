package com.example.backend.shared.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

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

        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .region(s3Region)
                .serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(true)
                        .build())
                .build();
    }
}
