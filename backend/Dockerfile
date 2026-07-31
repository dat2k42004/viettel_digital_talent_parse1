# =========================================================================
# PRODUCTION DOCKERFILE FOR BACKEND (GRADLE + JAVA 21)
# Fixes "pom.xml not found" error on Render/Cloud deployment
# =========================================================================

# Stage 1: Build stage using Gradle & JDK 21
FROM gradle:8.5-jdk21 AS build
WORKDIR /app

# Copy Gradle configuration files first to cache dependencies layer
COPY build.gradle settings.gradle ./
RUN gradle dependencies --no-daemon

# Copy source files and build executable Spring Boot JAR (skipping tests)
COPY src ./src
RUN gradle bootJar -x test --no-daemon

# Stage 2: Minimal & secure runtime environment using JRE 21
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy the compiled bootable JAR from stage 1
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
