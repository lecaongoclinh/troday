FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build
COPY BE/pom.xml ./pom.xml
COPY BE/src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -B -ntp package

FROM eclipse-temurin:17-jre-jammy
RUN command -v curl \
    && groupadd --system troday && useradd --system --gid troday troday
WORKDIR /app
COPY --from=build /build/target/troday-api-0.0.1-SNAPSHOT.jar ./app.jar
USER troday
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
