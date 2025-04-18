FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY . .
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

EXPOSE 8080
CMD ["java", "-jar", "-Dspring.profiles.active=prod", "target/NeighborNet-Backend-0.0.1-SNAPSHOT.jar"]