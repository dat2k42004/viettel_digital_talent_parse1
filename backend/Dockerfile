# =========================================================================
# RECOMMENDED CONFIGURATION: GRADLE + JAVA 21 (Matches current codebase)
# =========================================================================

# Stage 1: Build stage using Gradle & JDK 21
FROM gradle:8.5-jdk21 AS build
WORKDIR /app

# Copy configuration files first to cache dependencies
COPY build.gradle settings.gradle ./
RUN gradle dependencies --no-daemon

# Copy source files and build production-ready bootable JAR, skipping tests
COPY src ./src
RUN gradle bootJar -x test --no-daemon

# Stage 2: Clean and minimal runtime environment using JRE 21
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy the compiled boot jar from the build stage
COPY --from=build /app/build/libs/backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]


# =========================================================================
# ALTERNATIVE REQUESTED CONFIGURATION: MAVEN + JAVA 17
# To use this, uncomment the section below and ensure you have converted
# the project to Maven by adding a 'pom.xml' and downgrading Java to 17.
# =========================================================================
#
# # Stage 1: Build stage using Maven & JDK 17
# FROM maven:3.8.8-eclipse-temurin-17 AS build_legacy
# WORKDIR /app
# 
# COPY pom.xml .
# COPY src ./src
# RUN mvn clean package -DskipTests
# 
# # Stage 2: Runtime environment using JDK 17
# FROM eclipse-temurin:17-jdk-jammy
# WORKDIR /app
# COPY --from=build_legacy /app/target/*.jar app.jar
# 
# EXPOSE 8080
# ENTRYPOINT ["java", "-jar", "app.jar"]
