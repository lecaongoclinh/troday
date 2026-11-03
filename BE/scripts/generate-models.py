"""Generate immutable JDBC models/mappers from the reviewed MySQL source. No DB access."""
import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / 'database/source/schema.sql'
JAVA = ROOT / 'src/main/java/com/troday'
NAMES = {'files': 'FileMetadata', 'rental_houses': 'RentalHouse',
         'lifestyle_criteria': 'LifestyleCriterion', 'contract_representative_history': 'ContractRepresentativeHistory'}


def pascal(value):
    return ''.join(part.capitalize() for part in value.split('_'))


def camel(value):
    name = pascal(value)
    return name[0].lower() + name[1:]


def outputs():
    sql = SOURCE.read_text(encoding='utf-8-sig')
    for match in re.finditer(r'CREATE TABLE\s+`?(\w+)`?\s*\((.*?)\)\s*ENGINE=', sql, re.S | re.I):
        table, ddl = match.groups()
        columns = re.findall(r'^\s*`?(\w+)`?\s+((?:BIGINT|VARCHAR|CHAR|INT|TINYINT|SMALLINT|BOOLEAN|DECIMAL|NUMERIC|DATETIME|TIMESTAMP|DATE|JSON|TEXT|LONGTEXT|MEDIUMTEXT)\b[^\n]+)', ddl, re.M | re.I)
        for alter in re.finditer(r'ALTER TABLE\s+`?' + table + r'`?\s+(.*?);', sql, re.S | re.I):
            columns += re.findall(r'ADD\s+(?:COLUMN\s+)?`?(\w+)`?\s+((?:BIGINT|VARCHAR|INT|BOOLEAN|DATETIME|DATE|JSON|DECIMAL|TEXT|CHAR)\b[^,;]*(?:\([^)]*\)[^,;]*)?)', alter[1], re.I)
        # The only data columns introduced by ALTER in this schema are house metadata.
        if table == 'rental_houses':
            for name, definition in [('name', 'VARCHAR(150) NOT NULL'), ('row_version', 'BIGINT NOT NULL'),
                                     ('verification_version', 'BIGINT NOT NULL'), ('creation_key', 'VARCHAR(100)')]:
                if name not in [c[0] for c in columns]:
                    columns.append((name, definition))
        model = NAMES.get(table, pascal(table[:-3] + 'y' if table.endswith('ies') else table[:-1] if table.endswith('s') else table))
        fields, args, enums, imports = [], [], [], set()
        for column, definition in columns:
            enum_values = []
            for check in re.finditer(r'(?<![\w])`?' + column + r'`?\s+IN\s*\(([^)]+)\)', ddl, re.I):
                values = re.findall(r"'([A-Z][A-Z_0-9]*)'", check[1])
                if len(values) > len(enum_values):
                    enum_values = values
            field = camel(column)
            base = definition.split('(')[0].split()[0].rstrip(',').upper()
            if enum_values:
                typ = pascal(column)
                enums.append('    public enum ' + typ + ' { ' + ', '.join(enum_values) + ' }')
                read = f'JdbcValues.enumValue(rs, "{column}", {model}.{typ}.class)'
            elif base == 'BIGINT':
                typ, read = 'Long', f'rs.getObject("{column}", Long.class)'
            elif base in ('INT', 'TINYINT', 'SMALLINT'):
                typ, read = 'Integer', f'rs.getObject("{column}", Integer.class)'
            elif base == 'BOOLEAN':
                typ, read = 'Boolean', f'rs.getObject("{column}", Boolean.class)'
            elif base in ('DECIMAL', 'NUMERIC'):
                imports.add('java.math.BigDecimal')
                typ, read = 'BigDecimal', f'rs.getBigDecimal("{column}")'
            elif base in ('DATETIME', 'TIMESTAMP'):
                imports.add('java.time.Instant')
                typ, read = 'Instant', f'JdbcValues.instant(rs, "{column}")'
            elif base == 'DATE':
                imports.add('java.time.LocalDate')
                typ, read = 'LocalDate', f'rs.getObject("{column}", LocalDate.class)'
            elif base == 'JSON':
                imports.add('com.fasterxml.jackson.databind.JsonNode')
                typ, read = 'JsonNode', f'JdbcValues.json(rs, "{column}")'
            elif base in ('VARCHAR', 'CHAR', 'TEXT', 'LONGTEXT', 'MEDIUMTEXT'):
                typ, read = 'String', f'rs.getString("{column}")'
            else:
                raise ValueError(f'Unsupported SQL type {table}.{column}: {definition}')
            annotation = ''
            if column in ('password_hash', 'refresh_token_hash', 'session_key', 'token_hash', 'selector', 'storage_key', 'identity_number'):
                imports.add('com.fasterxml.jackson.annotation.JsonIgnore')
                annotation = '@JsonIgnore '
            comment = ' // Computed by MySQL; read only.' if 'GENERATED ALWAYS' in definition else ''
            fields.append(f'        {annotation}{typ} {field}{comment}')
            args.append('                ' + read)
        # Keep comma before a read-only field comment.
        components = ',\n'.join(f.split(' //')[0] for f in fields)
        model_text = 'package com.troday.model;\n\n'
        if imports:
            model_text += ''.join('import ' + imp + ';\n' for imp in sorted(imports)) + '\n'
        model_text += f'/** JDBC snapshot of the {table} table. Generated; expose response DTOs instead. */\n'
        model_text += f'public record {model}(\n{components}) {{\n'
        if enums:
            model_text += '\n'.join(enums) + '\n\n'
        model_text += f'    @Override\n    public String toString() {{\n        return "{model}[id=" + id + "]";\n    }}\n}}\n'
        mapper_text = f'''package com.troday.repository.mapper;

import com.troday.model.{model};
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full {table} row, preserving nullable fields and UTC timestamps. */
public final class {model}RowMapper implements RowMapper<{model}> {{
    @Override
    public {model} mapRow(ResultSet rs, int rowNum) throws SQLException {{
        return new {model}(
{',\n'.join(args)});
    }}
}}
'''
        yield JAVA / f'model/{model}.java', model_text
        yield JAVA / f'repository/mapper/{model}RowMapper.java', mapper_text


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    options = parser.parse_args()
    generated = list(outputs())
    for path, content in generated:
        if options.check:
            if not path.exists() or path.read_text(encoding='utf-8') != content:
                raise SystemExit(f'Out of date: {path}')
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding='utf-8', newline='\n')
    print(f'{len(generated) // 2} models and {len(generated) // 2} mappers ' + ('verified' if options.check else 'generated'))
