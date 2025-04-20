FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy the Maven POM file
COPY pom.xml .
# Copy the source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Create a lightweight runtime image
FROM openjdk:21-jdk-slim
WORKDIR /app

# Copy the JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Note: Local directories for file storage are no longer needed
# since the application now uses Google Cloud Storage

# Expose the port the app will run on
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "app.jar"]