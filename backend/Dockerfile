# =========================================================================
# ULTRA-LIGHTWEIGHT & LAYERED PRODUCTION DOCKERFILE FOR BACKEND
# Spring Boot 3.4 + Gradle 8.5 + JDK 21 Alpine
# =========================================================================

# Stage 1: Build executable Spring Boot JAR
FROM gradle:8.5-jdk21-alpine AS build
WORKDIR /app

# Cache dependency resolution
COPY build.gradle settings.gradle ./
RUN gradle dependencies --no-daemon

# Compile Spring Boot executable fat JAR
COPY src ./src
RUN gradle bootJar -x test --no-daemon

# Stage 2: Extract Spring Boot 3.4 JAR layers into separate components
FROM eclipse-temurin:21-jre-alpine AS extractor
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

# Stage 3: Ultra-minimal production runtime image (Alpine JRE)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy isolated layers (Spring dependencies layer is cached by Docker & Harbor!)
COPY --from=extractor /app/dependencies/ ./
COPY --from=extractor /app/spring-boot-loader/ ./
COPY --from=extractor /app/snapshot-dependencies/ ./
COPY --from=extractor /app/application/ ./

EXPOSE 8080
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
