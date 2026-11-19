FROM maven:3-eclipse-temurin-17-noble AS build
WORKDIR /build
COPY BE/pom.xml ./pom.xml
COPY BE/src ./src
RUN mvn --batch-mode --no-transfer-progress package

FROM eclipse-temurin:17-jre-jammy
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --system --uid 10001 --create-home troday \
    && mkdir -p /app/uploads \
    && chown -R troday:troday /app
WORKDIR /app
COPY --from=build --chown=troday:troday /build/target/troday-api-0.0.1-SNAPSHOT.jar /app/app.jar
USER troday
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
