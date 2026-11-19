FROM mysql:8.4

COPY BE/schema.sql /docker-entrypoint-initdb.d/01-schema.sql
# The official image creates MYSQL_DATABASE before its init scripts run.
# Keep the original new-database-only schema unchanged in the repository.
RUN sed -i 's/^CREATE DATABASE `troday` /CREATE DATABASE IF NOT EXISTS `troday` /' /docker-entrypoint-initdb.d/01-schema.sql
