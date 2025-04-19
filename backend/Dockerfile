FROM maven:3.8.7-openjdk-21-slim AS build
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

# Create directories for file uploads
RUN mkdir -p ./uploads
RUN mkdir -p ./thumbnails
RUN mkdir -p ./videos
RUN mkdir -p ./item-images

# Expose the port the app will run on
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "app.jar"]