-- Fase 2: mover las reglas de negocio de las reservas al servidor.

-- 1. Admin real -------------------------------------------------------------

create table public.admins (
    user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

-- Único usuario existente en auth.users (el admin actual).
insert into public.admins (user_id) select id from auth.users;

create function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke execute on function public.es_admin() from public, anon;
grant execute on function public.es_admin() to authenticated;

drop policy "Admin total" on public.citas;
drop policy "Lectura publica" on public.citas;
drop policy "Clientes actualizar estado" on public.citas;
drop policy "Permitir lectura publica de baneados" on public.baneados;
drop policy "Permitir insertar solo a admins" on public.baneados;
drop policy "Permitir borrar solo a admins" on public.baneados;

create policy "Admin total" on public.citas
    for all to authenticated
    using ((select public.es_admin())) with check ((select public.es_admin()));
create policy "Admin total" on public.baneados
    for all to authenticated
    using ((select public.es_admin())) with check ((select public.es_admin()));

-- 2. Token de cancelación -----------------------------------------------------

alter table public.citas add column token_cancelacion uuid unique;
alter table public.citas add constraint citas_token_disponible_check
    check (estado <> 'disponible' or token_cancelacion is null);

-- 3. Teléfonos normalizados a 9 dígitos -------------------------------------

create function public.normalizar_telefono(p text)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
    d text := regexp_replace(coalesce(p, ''), '\D', '', 'g');
begin
    if length(d) = 11 and left(d, 2) = '34' then
        d := substr(d, 3);
    end if;
    return d;
end;
$$;
revoke execute on function public.normalizar_telefono(text) from public, anon, authenticated;

update public.citas set telefono = public.normalizar_telefono(telefono) where telefono is not null;
update public.baneados set telefono = public.normalizar_telefono(telefono);

alter table public.citas add constraint citas_telefono_check check (telefono ~ '^\d{9}$');
alter table public.baneados add constraint baneados_telefono_check check (telefono ~ '^\d{9}$');

-- 4. reservar_cita ------------------------------------------------------------

create function public.reservar_cita(p_id uuid, p_nombre text, p_telefono text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_tel text := public.normalizar_telefono(p_telefono);
    v_nombre text := btrim(regexp_replace(coalesce(p_nombre, ''), '\s+', ' ', 'g'));
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

    return jsonb_build_object('token', v_token, 'fecha_hora', v_fecha);
end;
$$;

-- 5. cancelar_cita ------------------------------------------------------------

create function public.cancelar_cita(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
    update public.citas
    set estado = 'disponible',
        nombre_cliente = null,
        telefono = null,
        token_cancelacion = null
    where token_cancelacion = p_token
      and estado = 'reservada'
      and fecha_hora > now();
    return found;
end;
$$;

-- 6. Permisos de anon -----------------------------------------------------------

-- TRUNCATE no pasa por RLS: nadie desde la API debe tenerlo.
revoke truncate, references, trigger on public.citas, public.baneados from anon, authenticated;
revoke all on public.citas from anon;
revoke all on public.baneados from anon;

create view public.huecos_disponibles
with (security_invoker = false) as
    select id, fecha_hora, tipo, duracion_minutos
    from public.citas
    where estado = 'disponible'
      and fecha_hora > now() + interval '1 hour';

revoke all on public.huecos_disponibles from anon, authenticated;
grant select on public.huecos_disponibles to anon, authenticated;

revoke execute on function public.reservar_cita(uuid, text, text) from public;
revoke execute on function public.cancelar_cita(uuid) from public;
grant execute on function public.reservar_cita(uuid, text, text) to anon, authenticated;
grant execute on function public.cancelar_cita(uuid) to anon, authenticated;
