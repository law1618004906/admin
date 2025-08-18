'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { usePermissions } from '@/hooks/use-permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Printer, FileDown, Home, ShieldAlert, Users, Search, RefreshCw } from 'lucide-react'

interface Leader {
  id: number
  full_name: string
  residence?: string | null
  phone?: string | null
  workplace?: string | null
  center_info?: string | null
  station_number?: string | null
  votes_count: number
  _count?: { individuals: number }
  totalIndividualsVotes?: number
}

interface Individual {
  id: number
  full_name: string
  leader_name?: string | null
  residence?: string | null
  phone?: string | null
  workplace?: string | null
  center_info?: string | null
  station_number?: string | null
  votes_count: number
}

export default function ReportsPage() {
  const router = useRouter()
  const { loading, isAuthenticated } = useAuth()
  const { has, loading: permsLoading } = usePermissions()

  const [leaders, setLeaders] = React.useState<Leader[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [q, setQ] = React.useState('')
  const [isFetching, setIsFetching] = React.useState(false)

  // members cache per leader name
  const [members, setMembers] = React.useState<Record<string, Individual[]>>({})
  const [printLeaderId, setPrintLeaderId] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/login')
  }, [loading, isAuthenticated, router])

  const allowed = has('reports.read') || has('individuals.read') || has('leaders.read')

  const fetchLeaders = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/leaders', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
      if (res.status === 401) {
        window.location.href = '/login'
        return
      }
      if (!res.ok) {
        throw new Error(await res.text())
      }
      const json = await res.json()
      const data: Leader[] = json?.data ?? json ?? []
      setLeaders(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setError(e?.message || 'فشل في جلب القادة')
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchLeaders()
  }, [fetchLeaders])

  const filtered = React.useMemo(() => {
    const query = q.trim()
    if (!query) return leaders
    return leaders.filter(l => (l.full_name || '').includes(query))
  }, [leaders, q])

  async function loadLeaderMembers(leaderName: string) {
    if (members[leaderName]) return members[leaderName]
    const acc: Individual[] = []
    let cursor: string | undefined = undefined
    let guard = 0
    while (guard < 50) {
      const sp = new URLSearchParams()
      sp.set('leader_name', leaderName)
      sp.set('pageSize', '200')
      sp.set('sortBy', 'id')
      sp.set('sortDir', 'desc')
      if (cursor) sp.set('cursor', cursor)
      const url = `/api/individuals?${sp.toString()}`
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json()
      const pageData: Individual[] = json?.data ?? []
      acc.push(...pageData)
      const hasNext = json?.page?.hasNext
      const nextCursor = json?.page?.nextCursor
      if (!hasNext || !nextCursor) break
      cursor = String(nextCursor)
      guard++
    }
    setMembers(prev => ({ ...prev, [leaderName]: acc }))
    return acc
  }

  async function printLeader(l: Leader) {
    setIsFetching(true)
    try {
      await loadLeaderMembers((l.full_name || '').trim())
      setPrintLeaderId(l.id)
      // give the browser a tick to render
      setTimeout(() => {
        window.print()
        // reset after print
        setTimeout(() => setPrintLeaderId(null), 300)
      }, 150)
    } finally {
      setIsFetching(false)
    }
  }

  async function exportPdf(l: Leader) {
    // Using browser print-to-PDF mechanism for now (no extra deps)
    await printLeader(l)
  }

  if (loading || permsLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  if (!allowed) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <ShieldAlert className="h-5 w-5" /> غير مصرح لك
            </CardTitle>
            <CardDescription>لا تملك صلاحية عرض هذه الصفحة (reports.read).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')}>العودة للرئيسية <Home className="h-4 w-4 mr-2" /></Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; inset: 0; margin: 0; padding: 0; }
          .page-break { page-break-after: always; }
        }
      `}</style>

      <Card className="bg-card/60 border-border" data-print-hide>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> التقارير
          </CardTitle>
          <CardDescription>
            طباعة وتصدير تقارير القادة وأفرادهم.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 items-end">
            <div className="space-y-2">
              <Label htmlFor="q">بحث عن قائد</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="q" className="pl-9" placeholder="اكتب اسم القائد..." value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
            </div>
            <Button variant="outline" onClick={() => fetchLeaders()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} /> تحديث
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-md bg-red-50 text-red-700 border border-red-200" data-print-hide>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-print-hide>
        {filtered.map((l) => (
          <Card key={l.id} className="bg-card/60 border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{(l.full_name || '').trim()}</span>
                <div className="flex gap-2" data-print-hide>
                  <Button size="sm" variant="outline" onClick={() => printLeader(l)} disabled={isFetching}>
                    <Printer className="h-4 w-4 mr-1" /> طباعة
                  </Button>
                  <Button size="sm" onClick={() => exportPdf(l)} disabled={isFetching}>
                    <FileDown className="h-4 w-4 mr-1" /> تصدير PDF
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                إجمالي الأفراد: {(l._count?.individuals ?? 0).toLocaleString('ar-EG')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-1">
                {l.phone && <p>الهاتف: {l.phone}</p>}
                {l.residence && <p>السكن: {l.residence}</p>}
                {l.workplace && <p>العمل: {l.workplace}</p>}
                {l.center_info && <p>المركز: {l.center_info}</p>}
                {l.station_number && <p>المحطة: {l.station_number}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Printable sections, one per leader. Visible only during print */}
      {filtered.map((l) => {
        const leaderName = (l.full_name || '').trim()
        const people = members[leaderName] || []
        const show = printLeaderId === l.id
        return (
          <div key={`print-${l.id}`} className={show ? 'print-section' : 'hidden'}>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-2">تقرير القائد: {leaderName}</h1>
              <div className="mb-4 text-sm">
                {l.phone && <div>الهاتف: {l.phone}</div>}
                {l.residence && <div>السكن: {l.residence}</div>}
                {l.workplace && <div>العمل: {l.workplace}</div>}
                {l.center_info && <div>المركز: {l.center_info}</div>}
                {l.station_number && <div>المحطة: {l.station_number}</div>}
                <div>عدد الأفراد: {(l._count?.individuals ?? people.length).toLocaleString('ar-EG')}</div>
              </div>

              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2">#</th>
                    <th className="border p-2">الاسم</th>
                    <th className="border p-2">الهاتف</th>
                    <th className="border p-2">السكن</th>
                    <th className="border p-2">العمل</th>
                    <th className="border p-2">المركز</th>
                    <th className="border p-2">المحطة</th>
                    <th className="border p-2">الأصوات</th>
                  </tr>
                </thead>
                <tbody>
                  {people.map((p, idx) => (
                    <tr key={p.id}>
                      <td className="border p-2">{idx + 1}</td>
                      <td className="border p-2">{p.full_name}</td>
                      <td className="border p-2">{p.phone || '-'}</td>
                      <td className="border p-2">{p.residence || '-'}</td>
                      <td className="border p-2">{p.workplace || '-'}</td>
                      <td className="border p-2">{p.center_info || '-'}</td>
                      <td className="border p-2">{p.station_number || '-'}</td>
                      <td className="border p-2">{(p.votes_count ?? 0).toLocaleString('ar-EG')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="page-break" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
