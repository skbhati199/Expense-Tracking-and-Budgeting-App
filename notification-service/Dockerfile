FROM eclipse-temurin:17-jdk-alpine
MAINTAINER sonukumar

WORKDIR /app

# Copy the Gradle build files
COPY build.gradle settings.gradle gradlew ./
COPY gradle gradle

# Download dependencies
RUN ./gradlew dependencies --no-daemon

# Copy the project source
COPY src src

# Build the application
RUN ./gradlew build -x test --no-daemon

# Extract the built JAR
RUN mkdir -p target && \
    find build/libs -type f -name "*.jar" -not -name "*-plain.jar" -exec cp {} target/app.jar \;

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built artifact from the build stage
COPY --from=0 /app/target/app.jar app.jar

# Set the startup command
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=docker"]