-- Recovery when Flyway reports: "Detected failed migration to version 6 ..."
-- Run against the same database as the app (e.g. functions_administration).
--
-- 1) Inspect:
--    SELECT installed_rank, version, description, success, checksum
--    FROM flyway_schema_history WHERE version = '6';
--
-- 2) Remove the failed row so Flyway can re-run V6 after deploying the fixed migration:
--    (solo si success = 0 / fallida)

DELETE FROM flyway_schema_history WHERE version = '6' AND success = 0;

-- Si tu fila fallida usa otro criterio, revisa el SELECT de arriba antes de borrar.
--
-- Si en otro entorno V6 ya se aplicó con éxito (script antiguo) y tras actualizar el JAR
-- Flyway queja de checksum en V6, ejecuta Flyway repair contra esa BD (CLI o plugin Maven).
