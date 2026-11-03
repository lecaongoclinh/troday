package com.troday.integration;

import java.lang.reflect.RecordComponent;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("mysql-test")
@EnabledIfEnvironmentVariable(named = "TRODAY_MYSQL_TEST_URL", matches = ".+")
class ModelMySqlTests {
    @Autowired JdbcTemplate jdbc;
    private static final Map<String, String> EXCEPTIONS = Map.of("files", "FileMetadata", "rental_houses", "RentalHouse",
            "lifestyle_criteria", "LifestyleCriterion", "contract_representative_history", "ContractRepresentativeHistory");

    @Test
    void all43ModelsAndMappersMatchRealSchemaIncludingAlterAndComputedColumns() throws Exception {
        List<String> tables = jdbc.queryForList("SELECT table_name FROM information_schema.tables WHERE table_schema=DATABASE() AND table_type='BASE TABLE' AND table_name<>'api_idempotency'", String.class);
        assertThat(tables).hasSize(43);
        for (String table : tables) {
            String singular = table.endsWith("ies") ? table.substring(0, table.length() - 3) + "y"
                    : table.endsWith("s") ? table.substring(0, table.length() - 1) : table;
            String name = EXCEPTIONS.getOrDefault(table, pascal(singular));
            Class<?> model = Class.forName("com.troday.model." + name);
            assertThat(model.isRecord()).as(table).isTrue();
            var components = model.getRecordComponents();
            List<String> columns = jdbc.queryForList("SELECT column_name FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name=? ORDER BY ordinal_position", String.class, table);
            var expected = columns.stream().map(ModelMySqlTests::camel).toList();
            assertThat(Arrays.stream(components).map(RecordComponent::getName).toList()).as(table).containsExactlyInAnyOrderElementsOf(expected);
            @SuppressWarnings("unchecked")
            RowMapper<Object> mapper = (RowMapper<Object>) Class.forName("com.troday.repository.mapper." + name + "RowMapper").getConstructor().newInstance();
            String values = Arrays.stream(components).map(c -> expression(c) + " AS `" + snake(c.getName()) + "`").collect(Collectors.joining(","));
            Object snapshot = jdbc.queryForObject("SELECT " + values, mapper);
            assertThat(snapshot).isInstanceOf(model);
            assertThat(snapshot.toString()).isEqualTo(name + "[id=9007199254740993]");
            for (var component : components) {
                Object value = component.getAccessor().invoke(snapshot);
                assertThat(value).as(table + "." + component.getName()).isNotNull();
                if (component.getType() == Instant.class) assertThat(value).isEqualTo(Instant.parse("2026-01-02T03:04:05.123456Z"));
                if (component.getType() == BigDecimal.class) assertThat((BigDecimal)value).isEqualByComparingTo("123.45");
            }
            String nulls = columns.stream().map(c -> "NULL AS `" + c + "`").collect(Collectors.joining(","));
            Object nullable = jdbc.queryForObject("SELECT " + nulls, mapper);
            for (var component : components) assertThat(component.getAccessor().invoke(nullable)).as(table + "." + component.getName()).isNull();
        }
    }

    private static String expression(RecordComponent c) {
        Class<?> type = c.getType();
        if (type == Long.class) return "9007199254740993";
        if (type == Integer.class) return "7";
        if (type == Boolean.class) return "1";
        if (type == BigDecimal.class) return "123.45";
        if (type == Instant.class) return "CAST('2026-01-02 03:04:05.123456' AS DATETIME(6))";
        if (type == LocalDate.class) return "CAST('2026-01-02' AS DATE)";
        if (type.isEnum()) return "'" + type.getEnumConstants()[0] + "'";
        if (type.getSimpleName().equals("JsonNode")) return "JSON_OBJECT('value',42)";
        return "'private-value'";
    }
    private static String pascal(String value) {
        return Arrays.stream(value.split("_")).map(s -> Character.toUpperCase(s.charAt(0)) + s.substring(1)).collect(Collectors.joining());
    }
    private static String camel(String value) { String name = pascal(value); return Character.toLowerCase(name.charAt(0)) + name.substring(1); }
    private static String snake(String value) { return value.replaceAll("([A-Z])", "_$1").toLowerCase(java.util.Locale.ROOT); }
}
