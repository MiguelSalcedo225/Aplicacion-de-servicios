FROM postgres:12.11
COPY database.sql /docker-entrypoint-initdb.d/1.database.sql
COPY populate.sql /docker-entrypoint-initdb.d/2.populate.sql
COPY queries.sql /docker-entrypoint-initdb.d/3.queries.sql
COPY tgr_actualizar_estado.sql /docker-entrypoint-initdb.d/4.tgr_actualizar_estado.sql
COPY tgr_eliminar_usuario.sql /docker-entrypoint-initdb.d/5.tgr_eliminar_usuario.sql