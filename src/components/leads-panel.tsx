import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft, ChevronRight, ArrowDownUp, Eye, MessageCircle, Save, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { listLeads, recordCommercialOptOut, updateLead } from "@/lib/leads.functions";
import { SERVICES, STATUSES, statusKeys, whatsappContactUrl, type Lead } from "@/lib/leads";
import { countryLabel, formatPhone } from "@/lib/lead-fields";

const date = (value: string | null) => value ? new Date(value).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short", timeZone: "America/Lima" }) : "—";
const localDateInput = (value: string | null) => { if (!value) return ""; const d = new Date(value); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
const iso = (value: string) => value ? new Date(value).toISOString() : null;

function LeadDetail({ lead, onSaved, onClose }: { lead: Lead; onSaved: () => void; onClose: () => void }) {
  const save = useServerFn(updateLead);
  const optOut = useServerFn(recordCommercialOptOut);
  const [optedOutAt, setOptedOutAt] = useState(lead.commercial_opt_out_at);
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState(lead.internal_notes);
  const [last, setLast] = useState(localDateInput(lead.last_contact_at));
  const [next, setNext] = useState(localDateInput(lead.next_follow_up_at));
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  return <Dialog open onOpenChange={v => { if (!v) onClose(); }}><DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-md"><DialogHeader><DialogTitle className="pr-5 text-2xl">{lead.name}</DialogTitle><DialogDescription>{lead.service_interest} · {date(lead.created_at)} (Lima)</DialogDescription></DialogHeader>
    <dl className="grid grid-cols-2 gap-4 text-sm">{[["WhatsApp / teléfono", formatPhone(lead.phone)], ["Correo", lead.email], ["País", lead.country ? countryLabel(lead.country) : null], ["Distrito o localidad", lead.district], ["Origen", lead.source], ["Frecuencia", lead.frequency], ["Contacto preferido", lead.preferred_contact]].map(([label,value]) => <div key={label}><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 break-words font-medium">{value || "—"}</dd></div>)}</dl>
    {lead.message && <div className="border-y border-border py-4"><p className="text-sm text-muted-foreground">Consulta</p><p className="mt-2 whitespace-pre-wrap break-words text-sm">{lead.message}</p></div>}
    {lead.duplicate_of && <p className="text-sm text-accent">Posible consulta duplicada. Se conserva la solicitud anterior.</p>}
    <p className="text-xs leading-relaxed text-muted-foreground">Tratamiento de la solicitud: {date(lead.processing_timestamp)} · Política: {lead.privacy_version || "—"}<br />Contacto comercial: {optedOutAt ? `Baja registrada · ${date(optedOutAt)}` : lead.consent_contact ? `Autorizado · ${date(lead.consent_timestamp)}` : "No autorizado"}</p>
    {lead.consent_contact && !optedOutAt && <Button type="button" variant="outline" disabled={busy} className="h-auto min-h-10 whitespace-normal" onClick={async () => { if (!window.confirm("Se dejarán de enviar comunicaciones comerciales a este teléfono, también en sus otras consultas. Esta acción no se puede deshacer desde el panel.")) return; setBusy(true); setError(""); try { await optOut({ data: { id: lead.id } }); setOptedOutAt(new Date().toISOString()); onSaved(); } catch { setError("No pudimos registrar la baja. Inténtalo nuevamente."); } finally { setBusy(false); } }}>Registrar baja de comunicaciones comerciales</Button>}
    <form onSubmit={async e => { e.preventDefault(); setBusy(true); setError(""); try { await save({ data: { id: lead.id, status, internal_notes: notes, last_contact_at: iso(last), next_follow_up_at: iso(next) } }); onSaved(); onClose(); } catch { setError("No pudimos guardar los cambios. Inténtalo nuevamente."); } finally { setBusy(false); } }} className="space-y-5">
      <div><label htmlFor="lead-status" className="text-sm font-medium">Estado comercial</label><Select value={status} onValueChange={v => { if (statusKeys.includes(v as Lead["status"])) setStatus(v as Lead["status"]); }}><SelectTrigger id="lead-status" className="mt-2 h-12"><SelectValue /></SelectTrigger><SelectContent>{statusKeys.map(s => <SelectItem key={s} value={s}>{STATUSES[s]}</SelectItem>)}</SelectContent></Select></div>
      <label className="block text-sm font-medium">Notas internas<Textarea value={notes} onChange={e => setNotes(e.target.value)} maxLength={5000} className="mt-2 min-h-28" placeholder="Solo información comercial; no incluyas datos médicos." /></label>
      <label className="block text-sm font-medium">Último contacto<Input type="datetime-local" value={last} onChange={e => setLast(e.target.value)} className="mt-2 h-12" /></label>
      <label className="block text-sm font-medium">Próximo seguimiento<Input type="datetime-local" value={next} onChange={e => setNext(e.target.value)} className="mt-2 h-12" /></label>
      <p className="text-xs text-muted-foreground">Las fechas de edición usan la zona horaria de tu dispositivo.</p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-3"><Button type="submit" disabled={busy} className="h-12"><Save className="h-4 w-4" />{busy ? "Guardando…" : "Guardar cambios"}</Button><Button asChild variant="outline" className="h-12"><a href={whatsappContactUrl(lead.phone)} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" />WhatsApp</a></Button></div>
    </form>
  </DialogContent></Dialog>;
}

export function LeadsPanel() {
  const fetchLeads = useServerFn(listLeads);
  const [search, setSearch] = useState(""); const [service, setService] = useState("all"); const [status, setStatus] = useState("all"); const [page, setPage] = useState(0); const [ascending, setAscending] = useState(false); const [selected, setSelected] = useState<Lead | null>(null);
  const query = useQuery({ queryKey: ["norita-leads", search, service, status, page, ascending], queryFn: () => fetchLeads({ data: { search, service: service === "all" ? "" : service, status: status === "all" ? "" : status, page, ascending } }) });
  const data = query.data;
  return <>
    <div className="grid grid-cols-2 gap-6 border-y border-border py-7 lg:grid-cols-5">{[["Total recibidos", data?.metrics.total], ["Nuevos", data?.metrics.new], ["Llamadas agendadas", data?.metrics.call_scheduled], ["Propuestas enviadas", data?.metrics.proposal_sent], ["Clientes", data?.metrics.converted]].map(([label, value]) => <div key={label}><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 font-display text-3xl font-medium text-primary">{value ?? "—"}</p></div>)}</div>
    <div className="my-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
      <div className="relative"><Search className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" /><Input aria-label="Buscar por nombre o teléfono" maxLength={100} placeholder="Nombre o teléfono" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="h-12 pl-9" /></div>
      <Select value={service} onValueChange={v => { setService(v); setPage(0); }}><SelectTrigger aria-label="Filtrar por servicio" className="h-12"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos los servicios</SelectItem>{SERVICES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
      <Select value={status} onValueChange={v => { setStatus(v); setPage(0); }}><SelectTrigger aria-label="Filtrar por estado" className="h-12"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos los estados</SelectItem>{statusKeys.map(s => <SelectItem key={s} value={s}>{STATUSES[s]}</SelectItem>)}</SelectContent></Select>
      <Button variant="outline" className="h-12" onClick={() => { setAscending(v => !v); setPage(0); }}><ArrowDownUp className="h-4 w-4" />{ascending ? "Más antiguos" : "Más recientes"}</Button>
    </div>
    {query.isError ? <div role="alert" className="py-12 text-center"><p>No pudimos cargar los contactos.</p><Button className="mt-4" onClick={() => query.refetch()}>Reintentar</Button></div> : query.isPending ? <p role="status" className="py-12 text-center text-muted-foreground">Cargando contactos…</p> : <>
      <div className="overflow-x-auto"><table className="w-full min-w-[1180px] text-left text-sm"><thead className="border-y border-border bg-secondary/50 text-primary"><tr>{["Ingreso (Lima)", "Nombre", "WhatsApp", "Correo", "Servicio", "Ubicación", "Origen", "Estado", "Seguimiento", "Acciones"].map(h => <th key={h} className="px-3 py-4 font-semibold">{h}</th>)}</tr></thead><tbody>{data?.rows.map(l => <tr key={l.id} className="border-b border-border"><td className="px-3 py-5">{date(l.created_at)}</td><td className="px-3 py-5 font-medium">{l.name}{l.duplicate_of && <span className="mt-1 block text-xs text-accent">Posible duplicado</span>}</td><td className="whitespace-nowrap px-3 py-5">{formatPhone(l.phone)}</td><td className="max-w-56 break-all px-3 py-5">{l.email || "—"}</td><td className="max-w-52 px-3 py-5">{l.service_interest}</td><td className="px-3 py-5">{l.country ? `${countryLabel(l.country)} · ` : ""}{l.district || "—"}</td><td className="px-3 py-5">{l.source}</td><td className="px-3 py-5"><span className={l.status === "converted" ? "border-l-2 border-accent pl-2 font-semibold text-accent" : "border-l-2 border-border pl-2 text-primary"}>{STATUSES[l.status]}</span></td><td className="px-3 py-5">{date(l.next_follow_up_at)}</td><td className="px-3 py-5"><div className="flex gap-1"><Button size="icon" variant="ghost" title="Abrir ficha" aria-label={`Abrir ficha de ${l.name}`} onClick={() => setSelected(l)}><Eye className="h-4 w-4" /></Button><Button size="icon" variant="ghost" asChild><a href={whatsappContactUrl(l.phone)} target="_blank" rel="noopener noreferrer" title="Abrir WhatsApp" aria-label={`Contactar a ${l.name} por WhatsApp`}><MessageCircle className="h-4 w-4" /></a></Button></div></td></tr>)}</tbody></table></div>
      {data?.rows.length === 0 && <p className="py-16 text-center text-muted-foreground">{search || service !== "all" || status !== "all" ? "No hay contactos que coincidan con estos filtros." : "Todavía no se han recibido contactos."}</p>}
      <div className="mt-5 flex items-center justify-between gap-3 text-sm"><span>{data?.count ?? 0} contactos · Página {page + 1}</span><div className="flex gap-2"><Button size="icon" variant="outline" aria-label="Página anterior" disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft /></Button><Button size="icon" variant="outline" aria-label="Página siguiente" disabled={(page + 1) * 25 >= (data?.count ?? 0)} onClick={() => setPage(p => p + 1)}><ChevronRight /></Button></div></div>
      <section className="mt-12 border-t border-border pt-8"><h2 className="text-xl">Origen y demanda</h2><div className="mt-5 grid gap-8 md:grid-cols-2"><div><h3 className="text-sm font-semibold">Contactos por canal</h3>{Object.entries(data?.metrics.by_source ?? {}).map(([s,n]) => <p key={s} className="mt-3 flex justify-between border-b border-border pb-2 text-sm"><span>{s}</span><span>{n}</span></p>)}</div><div><h3 className="text-sm font-semibold">Servicios solicitados</h3>{Object.entries(data?.metrics.by_service ?? {}).map(([s,n]) => <p key={s} className="mt-3 flex justify-between gap-4 border-b border-border pb-2 text-sm"><span>{s}</span><span>{n}</span></p>)}</div></div><p className="mt-6 text-sm text-muted-foreground">Conversión: {data?.metrics.total ? `${((data.metrics.converted / data.metrics.total) * 100).toFixed(1)}%` : "—"} · Tiempo hasta el contacto registrado: {data?.metrics.average_first_contact_hours != null ? `${data.metrics.average_first_contact_hours.toFixed(1)} h` : "—"}</p></section>
    </>}
    {selected && <LeadDetail key={selected.id} lead={selected} onClose={() => setSelected(null)} onSaved={() => query.refetch()} />}
  </>;
}