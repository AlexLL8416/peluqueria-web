import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js"
import { JWT } from "npm:google-auth-library"

serve(async (req) => {
  try {
    const payload = await req.json()
    const { type, record, old_record } = payload

    // 1. Analizamos la situación
    const estabaReservada = old_record?.estado === 'reservada'
    const estaReservadaAhora = record?.estado === 'reservada'
    const tieneGoogleId = record?.google_event_id ? true : false

    // 2. Decidimos qué acción tomar
    let accion = 'IGNORAR'

    if (estaReservadaAhora && !tieneGoogleId) {
      accion = 'CREAR'
    } else if (type === 'UPDATE' && estabaReservada && !estaReservadaAhora && tieneGoogleId) {
      accion = 'BORRAR'
    }

    // 3. Cortafuegos general
    if (accion === 'IGNORAR') {
      return new Response("Ignorado: Evitando bucles o estados irrelevantes", { status: 200 })
    }

    // 4. Variables de entorno
    const clientEmail = Deno.env.get('GOOGLE_CLIENT_EMAIL') ?? ''
    const privateKey = Deno.env.get('GOOGLE_PRIVATE_KEY')?.replace(/\\n/g, '\n') ?? ''
    const calendarId = Deno.env.get('CALENDAR_ID') ?? ''

    const client = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/calendar.events'],
    })
    const tokenInfo = await client.getAccessToken()
    const accessToken = tokenInfo.token

    // --- RUTA A: CANCELAR CITA ---
    if (accion === 'BORRAR') {
      console.log(`Intentando borrar evento ${record.google_event_id} de Google...`)
      
      const deleteUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${record.google_event_id}`
      
      const resBorrado = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })

      // El bloque a prueba de fallos: Si da error PERO es 404 (No existe) o 410 (Borrado), continuamos.
      if (!resBorrado.ok && resBorrado.status !== 404 && resBorrado.status !== 410) {
        const errorText = await resBorrado.text()
        console.error("Fallo crítico en Google:", errorText)
        throw new Error(`Error HTTP ${resBorrado.status} al borrar en Google`)
      }

      console.log("Evento borrado en Google (o ya no existía). Vaciando Supabase...")

      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
      const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey)

      const { error: updateError } = await supabaseClient
        .from('citas')
        .update({ google_event_id: null })
        .eq('id', record.id)

      if (updateError) {
        console.error("Fallo al actualizar la tabla citas:", updateError)
        throw updateError
      }

      console.log("¡Hueco liberado con éxito!")
      return new Response(JSON.stringify({ success: true, action: 'deleted' }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      })
    }

    // --- RUTA B: CREAR CITA ---
    if (accion === 'CREAR') {
      const startTime = new Date(record.fecha_hora)
      const duracion = record.duracion_minutos || 30
      const endTime = new Date(startTime.getTime() + duracion * 60 * 1000)

      const event = {
        summary: record.nombre_cliente ? `Cita: ${record.nombre_cliente}` : 'Cita Reservada',
        description: record.telefono ? `Teléfono: ${record.telefono}` : 'Sin teléfono',
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'Europe/Madrid',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'Europe/Madrid',
        }
      }

      const googleRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      })

      const googleData = await googleRes.json()

      if (!googleRes.ok) {
        throw new Error(`Error de Google: ${JSON.stringify(googleData)}`)
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
      const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

      const { error: updateError } = await supabase
        .from('citas')
        .update({ google_event_id: googleData.id })
        .eq('id', record.id)

      if (updateError) throw updateError

      return new Response(JSON.stringify({ success: true, googleEventId: googleData.id }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      })
    }

  } catch (error) {
    console.error("Error en Edge Function:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    })
  }
})