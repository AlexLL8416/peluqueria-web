-- Fase 3: endurecimiento tras el linter de Supabase y límite anti-bots.

-- 1. huecos_disponibles sin SECURITY DEFINER ----------------------------------
-- anon solo puede leer estas columnas de citas, y solo de huecos reservables.
-- estado hace falta porque la vista filtra por él.
grant select (id, fecha_hora, tipo, duracion_minutos, estado) on public.citas to anon;

create policy "Huecos publicos" on public.citas
    for select to anon, authenticated
    using (estado = 'disponible' and fecha_hora > now() + interval '1 hour');

alter view public.huecos_disponibles set (security_invoker = true);

-- 2. Funciones que no deben ser invocables por la API -------------------------

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- 3. Índices -----------------------------------------------------------------

create index citas_fecha_hora_idx on public.citas (fecha_hora);
create index citas_telefono_reservada_idx on public.citas (telefono, fecha_hora)
    where estado = 'reservada';

-- 4. Límite de reservas por IP --------------------------------------------------
-- Frena a un bot que vaya reservando huecos con teléfonos inventados.
-- Esquema privado: no se expone por la API.

create schema if not exists privado;
revoke all on schema privado from public, anon, authenticated;

create table privado.reservas_ip (
    ip_hash text not null,
    created_at timestamptz not null default now()
);
create index reservas_ip_hash_idx on privado.reservas_ip (ip_hash, created_at);

create or replace function public.reservar_cita(p_id uuid, p_nombre text, p_telefono text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_tel text := public.normalizar_telefono(p_telefono);
    v_nombre text := btrim(regexp_replace(coalesce(p_nombre, ''), '\s+', ' ', 'g'));
    v_cabeceras json := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json;
    v_ip text := btrim(coalesce(
        v_cabeceras ->> 'cf-connecting-ip',
        split_part(v_cabeceras ->> 'x-forwarded-for', ',', 1),
        ''));
    v_ip_hash text;
    v_fecha timestamptz;
    v_semana timestamp;
    v_token uuid := gen_random_uuid();
begin
    if v_tel !~ '^\d{9}$' then
        raise exception 'telefono_invalido';
    end if;

    if char_length(v_nombre) not between 2 and 60
       or v_nombre !~ '^[A-Za-zÀ-ÖØ-öø-ÿĀ-ž]+([ ''.-][A-Za-zÀ-ÖØ-öø-ÿĀ-ž]+)*$' then
        raise exception 'nombre_invalido';
    end if;

    if exists (select 1 from public.baneados b where b.telefono = v_tel) then
        raise exception 'baneado';
    end if;

    -- Máximo 3 reservas por IP en 24 h. Sin IP (llamada desde SQL) no aplica.
    if v_ip <> '' then
        v_ip_hash := md5(v_ip);
        perform pg_advisory_xact_lock(hashtext('ip:' || v_ip_hash));
        if (select count(*) from privado.reservas_ip r
            where r.ip_hash = v_ip_hash
              and r.created_at > now() - interval '24 hours') >= 3 then
            raise exception 'demasiadas_reservas';
        end if;
    end if;

    -- Bloquea el hueco: una segunda llamada concurrente espera y, al
    -- reevaluar el WHERE, ya no lo encuentra disponible.
    select c.fecha_hora into v_fecha
    from public.citas c
    where c.id = p_id
      and c.estado = 'disponible'
      and c.fecha_hora > now() + interval '1 hour'
    for update;

    if not found then
        raise exception 'no_disponible';
    end if;

    -- Serializa las reservas de un mismo teléfono para que el límite
    -- semanal no se pueda saltar con dos llamadas simultáneas.
    perform pg_advisory_xact_lock(hashtext('reserva:' || v_tel));

    v_semana := date_trunc('week', v_fecha at time zone 'Europe/Madrid');
    if exists (
        select 1 from public.citas c
        where c.telefono = v_tel
          and c.estado = 'reservada'
          and c.fecha_hora >= v_semana at time zone 'Europe/Madrid'
          and c.fecha_hora < (v_semana + interval '1 week') at time zone 'Europe/Madrid'
    ) then
        raise exception 'limite_semanal';
    end if;

    update public.citas
    set estado = 'reservada',
        nombre_cliente = v_nombre,
        telefono = v_tel,
        token_cancelacion = v_token
    where id = p_id;

    if v_ip_hash is not null then
        insert into privado.reservas_ip (ip_hash) values (v_ip_hash);
    end if;

    return jsonb_build_object('token', v_token, 'fecha_hora', v_fecha);
end;
$$;

-- RGPD: el hash de la IP solo se guarda lo que dura la ventana del límite.
select cron.schedule(
    'purgar-reservas-ip',
    '15 * * * *',
    $$ delete from privado.reservas_ip where created_at < now() - interval '24 hours'; $$
);
