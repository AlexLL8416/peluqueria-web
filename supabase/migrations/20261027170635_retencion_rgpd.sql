-- Fase 2.8: anonimizar los datos personales de las citas antiguas (RGPD).

create extension if not exists pg_cron;

select cron.schedule(
    'anonimizar-citas-antiguas',
    '0 3 * * *',
    $$
    update public.citas
    set nombre_cliente = null,
        telefono = null,
        token_cancelacion = null
    where fecha_hora < now() - interval '6 months'
      and (nombre_cliente is not null or telefono is not null or token_cancelacion is not null);
    $$
);
