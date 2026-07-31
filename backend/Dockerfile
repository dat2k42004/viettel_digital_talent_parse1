# =========================================================================
# REQUIRED CONFIGURATION: MAVEN + JAVA 17
# Warning: The current repository is configured with Gradle & Java 21.
# If you run this build, please ensure you have added a 'pom.xml' and
# the code compiles successfully on Java 17.
# =========================================================================

# Stage 1: Build stage using Maven & JDK 17
FROM maven:3.8.8-eclipse-temurin-17 AS build
WORKDIR /app

# Copy Maven descriptor and source code to build the JAR
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime environment using JDK 17
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]


# =========================================================================
# ALTERNATIVE WORKING CONFIGURATION: GRADLE + JAVA 21
# Uncomment the block below to build directly using the current project settings.
# =========================================================================
#
# # Stage 1: Build stage using Gradle & JDK 21
# FROM gradle:8.5-jdk21 AS build_gradle
# WORKDIR /app
# COPY build.gradle settings.gradle ./
# RUN gradle dependencies --no-daemon
# COPY src ./src
# RUN gradle bootJar -x test --no-daemon
# 
# # Stage 2: Runtime environment using JRE 21
# FROM eclipse-temurin:21-jre-jammy
# WORKDIR /app
# COPY --from=build_gradle /app/build/libs/backend-0.0.1-SNAPSHOT.jar app.jar
# EXPOSE 8080
# ENTRYPOINT ["java", "-jar", "app.jar"]
