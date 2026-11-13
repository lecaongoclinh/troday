FROM mysql:8.4
# MYSQL_DATABASE creates the database before these scripts run. Keep BE SQL as
# the only schema source; remove its standalone CREATE DATABASE/USE statements.
COPY BE/schema.sql /tmp/troday-schema.sql
RUN sed -e '/^CREATE DATABASE /d' -e '/^USE /d' /tmp/troday-schema.sql > /docker-entrypoint-initdb.d/00-schema.sql \
    && rm /tmp/troday-schema.sql
COPY docker/mysql/01-demo-users.sql /docker-entrypoint-initdb.d/01-demo-users.sql
