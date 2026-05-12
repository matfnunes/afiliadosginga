'use client'

import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

const PLATAFORMAS = ['Instagram', 'TikTok', 'Telegram', 'YouTube', 'Twitch', 'Discord', 'Threads']
const FORMATOS = ['Story', 'Reels', 'Feed', 'Banner', 'Livestream', 'Podcast']
const STATUS = ['Pendente', 'Entregue', 'Auditado', 'Reprovado']

const STATUS_COLORS = {
  Pendente: 'bg-yellow-100 text-yellow-800',
  Entregue: 'bg-blue-100 text-blue-800',
  Auditado: 'bg-green-100 text-green-800',
  Reprovado: 'bg-red-100 text-red-800',
}

const EMPTY_FORM = { afiliado: '', plataforma: 'Instagram', formato: 'Story', data: '', status: 'Pendente', link: '' }

export default function Dashboard() {
  const [entries, setEntries] = useState([])
  const [afiliados, setAfiliados] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [showForm, setShowForm] = useState(false)
  const [filters, setFilters] = useState({ plataforma: '', formato: '', status: '' })
  const [editId, setEditId] = useState(null)

  useEffect(() => {
    fetchEntries()
    fetchAfiliados()
  }, [])

  async function fetchAfiliados() {
    const { data } = await supabase.from('afiliados').select('nome').order('nome')
    if (data) setAfiliados(data.map(a => a.nome))
  }

  async function fetchEntries() {
    setLoading(true)
    const { data, error } = await supabase
      .from('entregas')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setEntries(data)
    setLoading(false)
  }

  const filtered = entries.filter(e =>
    (!filters.plataforma || e.plataforma === filters.plataforma) &&
    (!filters.formato || e.formato === filters.formato) &&
    (!filters.status || e.status === filters.status)
  )

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.afiliado || !form.data) return
    setSaving(true)

    if (editId !== null) {
      await supabase.from('entregas').update(form).eq('id', editId)
      setEditId(null)
    } else {
      await supabase.from('entregas').insert(form)
    }

    setForm(EMPTY_FORM)
    setShowForm(false)
    setSaving(false)
    fetchEntries()
  }

  function handleEdit(entry) {
    setForm({ afiliado: entry.afiliado, plataforma: entry.plataforma, formato: entry.formato, data: entry.data, status: entry.status, link: entry.link || '' })
    setEditId(entry.id)
    setShowForm(true)
  }

  async function handleDelete(id) {
    await supabase.from('entregas').delete().eq('id', id)
    fetchEntries()
  }

  function handleCancel() {
    setForm(EMPTY_FORM)
    setEditId(null)
    setShowForm(false)
  }

  const counts = STATUS.reduce((acc, s) => {
    acc[s] = entries.filter(e => e.status === s).length
    return acc
  }, {})

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Affiliate Content Dashboard</h1>
        <p className="text-gray-500 mt-1">Auditoria contratual de entregas de afiliados</p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {STATUS.map(s => (
          <div key={s} className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${STATUS_COLORS[s]}`}>{s}</span>
            <p className="text-2xl font-bold text-gray-800">{counts[s]}</p>
          </div>
        ))}
      </div>

      {/* Filtros + Botão */}
      <div className="flex flex-wrap gap-3 mb-6 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Plataforma</label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            value={filters.plataforma}
            onChange={e => setFilters(f => ({ ...f, plataforma: e.target.value }))}
          >
            <option value="">Todas</option>
            {PLATAFORMAS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Formato</label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            value={filters.formato}
            onChange={e => setFilters(f => ({ ...f, formato: e.target.value }))}
          >
            <option value="">Todos</option>
            {FORMATOS.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          >
            <option value="">Todos</option>
            {STATUS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM) }}
          className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + Nova Entrega
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {editId !== null ? 'Editar Entrega' : 'Nova Entrega'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Afiliado *</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                value={form.afiliado}
                onChange={e => setForm(f => ({ ...f, afiliado: e.target.value }))}
                required
              >
                <option value="">Selecione...</option>
                {afiliados.map(nome => <option key={nome}>{nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Plataforma</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                value={form.plataforma}
                onChange={e => setForm(f => ({ ...f, plataforma: e.target.value }))}
              >
                {PLATAFORMAS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Formato</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                value={form.formato}
                onChange={e => setForm(f => ({ ...f, formato: e.target.value }))}
              >
                {FORMATOS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Data *</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={form.data}
                onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              >
                {STATUS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Link do conteúdo</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="https://..."
                value={form.link}
                onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2 md:col-span-3 flex gap-3 justify-end">
              <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition font-medium"
              >
                {saving ? 'Salvando...' : editId !== null ? 'Salvar alterações' : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Afiliado</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Plataforma</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Formato</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Data</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Link</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">Carregando...</td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">Nenhuma entrega encontrada.</td>
              </tr>
            )}
            {!loading && filtered.map(entry => (
              <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-800">{entry.afiliado}</td>
                <td className="px-4 py-3 text-gray-600">{entry.plataforma}</td>
                <td className="px-4 py-3 text-gray-600">{entry.formato}</td>
                <td className="px-4 py-3 text-gray-600">{entry.data}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[entry.status]}`}>
                    {entry.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {entry.link
                    ? <a href={entry.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Ver</a>
                    : <span className="text-gray-300">—</span>
                  }
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => handleEdit(entry)} className="text-xs text-indigo-600 hover:underline">Editar</button>
                    <button onClick={() => handleDelete(entry.id)} className="text-xs text-red-500 hover:underline">Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-4 text-right">{filtered.length} registro(s) exibido(s)</p>
    </div>
  )
}
