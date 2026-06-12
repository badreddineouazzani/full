# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Use the Maven wrapper (`mvnw.cmd` on Windows, `./mvnw` elsewhere):

- Run the app: `mvnw.cmd spring-boot:run`
- Build (jar): `mvnw.cmd clean package`
- Run all tests: `mvnw.cmd test`
- Run a single test class: `mvnw.cmd test -Dtest=DemoApplicationTests`
- Run a single test method: `mvnw.cmd test -Dtest=DemoApplicationTests#contextLoads`

The app serves on the default port 8080. Static landing page at `/`, REST endpoint `GET /categories`, DB connectivity probe `GET /test-db`.

## Architecture

Spring Boot 4.0.6 / Java 17 web app backed by **Microsoft SQL Server** via Spring Data JPA (Hibernate). Standard layered flow:

`Controller (@RestController) → Service (@Service) → Repository (JpaRepository) → Entity (@Entity)`

`Category` is the one real domain feature, wired end-to-end through `CategoryController` → `CategoryService` → `CategoryRepository`. Use this chain as the template when adding new domain types.

### Database schema is external — do not rely on JPA to create it

`spring.jpa.hibernate.ddl-auto=none` in `application.properties`: Hibernate **never** creates or alters tables. The schema lives in the external SQL Server database `GestionProduits` and must already exist. When adding/changing entities, the matching table/column changes must be made in the database separately.

Naming uses `PhysicalNamingStrategyStandardImpl`, so entity/field names map to **exact, case-sensitive** DB identifiers with no snake_case conversion. Always pin names explicitly with `@Table(name=...)` / `@Column(name=...)` to match the existing schema (e.g. `Category.NameCt` → column `NameCt`).

### Connection config

DB connection settings (URL, `sa` credentials pointing at `localhost\SQLEXPRESS`) are hardcoded in `src/main/resources/application.properties`. Running the app or `@SpringBootTest` tests requires a reachable SQL Server instance with the `GestionProduits` database.

## Leftover scaffolding (not part of the app)

These were connectivity experiments — ignore them and do not extend them when building features:

- `DbTest.java` (repo root): standalone `main` testing a JDBC URL against a *different* database (`AuthSpring`). Not part of the Spring build.
- `TestController`, `TestConnectionRunner`, and the `test_connection` entity/repository: DB-connection smoke tests.