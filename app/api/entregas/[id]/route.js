import { NextResponse } from 'next/server'
import { getSupabase } from '../../../../lib/supabase'

export async function PUT(request, { params }) {
  const supabase = getSupabase()
  const body = await request.json()
  const { data, error } = await supabase.from('entregas').update(body).eq('id', params.id).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request, { params }) {
  const supabase = getSupabase()
  const { error } = await supabase.from('entregas').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
