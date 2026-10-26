"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon/Icon";
import { Select } from "@/components/ui/Select/Select";
import { useClientSession } from "../ClientShell/ClientShell";
import { ActionButton, DataState, Modal, PageHeader, Pagination, StatusBadge, workspaceStyles as ui } from "@/components/ui/Workspace/Workspace";
import {
  ClientApiError, createDetail, createOrder, deleteDetail, getCompanies, getOrder,
  getOrders, getTracking, respondPrice, simulatePayment, updateDetail,
} from "../../services/clientApi";
import {
  formatDate, formatMoney, matchesOrderFilter, orderStatusLabels, packagingTypes,
  type Company, type NewDetail, type Order, type OrderFilter, type Tracking,
} from "../../types/client";
import styles from "./ClientOrders.module.css";

const blankDetail = (): NewDetail => ({
  cargoDescription: "", amount: 1, unitWeight: "1",
  deliveryAddress: "", typePackaging: "caja",
});

const orderFilters: { value: OrderFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pendiente", label: "Pendientes" },
  { value: "esperando_aprobacion", label: "Cotizados" },
  { value: "en_transito", label: "En tránsito" },
  { value: "entregado", label: "Finalizados" },
  { value: "cancelled", label: "Cancelados y rechazados" },
];

export function ClientOrders({ initialNew = false, initialOrderId }: { initialNew?: boolean; initialOrderId?: number }) {
  const { user } = useClientSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(Boolean(user.idClient));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyPage, setCompanyPage] = useState(1);
  const [companyLastPage, setCompanyLastPage] = useState(1);
  const [companySearch, setCompanySearch] = useState("");
  const [companyDraft, setCompanyDraft] = useState("");
  const [companyLoading, setCompanyLoading] = useState(initialNew && Boolean(user.idClient));
  const [companyVersion, setCompanyVersion] = useState(0);
  const [companyError, setCompanyError] = useState("");
  const [chooserOpen, setChooserOpen] = useState(initialNew && Boolean(user.idClient));
  const [company, setCompany] = useState<Company | null>(null);
  const [draft, setDraft] = useState<NewDetail>(blankDetail);
  const [cart, setCart] = useState<NewDetail[]>([]);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState<NewDetail>(blankDetail);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer">("transfer");
  const [tracking, setTracking] = useState<Tracking | null>(null);
  const [trackingError, setTrackingError] = useState("");

  useEffect(() => {
    if (!user.idClient) return;
    const idClient = user.idClient;
    const controller = new AbortController();
    async function load() {
      try {
        if (filter === "all") {
          const result = await getOrders(idClient, page, perPage, controller.signal);
          if (controller.signal.aborted) return;
          setOrders(result.data);
          setTotal(result.meta.total);
          setLastPage(Math.max(1, result.meta.lastPage));
        } else {
          const first = await getOrders(idClient, 1, 100, controller.signal);
          const all = [...first.data];
          for (let current = 2; current <= first.meta.lastPage; current++) {
            const next = await getOrders(idClient, current, 100, controller.signal);
            all.push(...next.data);
          }
          if (controller.signal.aborted) return;
          const filtered = all.filter((order) => matchesOrderFilter(order.status, filter));
          const filteredLastPage = Math.max(1, Math.ceil(filtered.length / perPage));
          if (page > filteredLastPage) { setPage(filteredLastPage); return; }
          setOrders(filtered.slice((page - 1) * perPage, page * perPage));
          setTotal(filtered.length);
          setLastPage(filteredLastPage);
        }
        setError("");
        setLoading(false);
      } catch (cause) {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : "No se pudieron cargar tus pedidos.");
        setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [user.idClient, page, perPage, filter, version]);

  useEffect(() => {
    if (!chooserOpen) return;
    const controller = new AbortController();
    getCompanies(companyPage, companySearch, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      setCompanies(result.data);
      setCompanyLastPage(Math.max(1, result.meta.lastPage));
      setCompanyLoading(false);
      setCompanyError("");
    }).catch((cause) => {
      if (controller.signal.aborted) return;
      setCompanyError(cause instanceof Error ? cause.message : "No se pudieron cargar las empresas.");
      setCompanyLoading(false);
    });
    return () => controller.abort();
  }, [chooserOpen, companyPage, companySearch, companyVersion]);

  useEffect(() => {
    if (!initialOrderId || !user.idClient) return;
    let active = true;
    getOrder(initialOrderId).then((order) => {
      if (active && order.idClient === user.idClient) setSelected(order);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [initialOrderId, user.idClient]);

  function reload() { setLoading(true); setVersion((value) => value + 1); }

  async function openOrder(order: Order) {
    setSelected(order);
    setDetailsLoading(true);
    setActionError("");
    setEditMode(false);
    setTracking(null);
    setTrackingError("");
    try {
      const fresh = await getOrder(order.idOrder);
      if (fresh.idClient !== user.idClient) throw new Error("Este pedido no pertenece a tu cuenta.");
      setSelected(fresh);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "No se pudo cargar el detalle.");
    } finally { setDetailsLoading(false); }
  }

  function addDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCart((items) => [...items, { ...draft }]);
    setDraft(blankDetail());
  }

  async function submitOrder() {
    if (!user.idClient || !company || cart.length === 0 || saving) return;
    setSaving(true);
    setActionError("");
    let createdId: number | null = null;
    try {
      const order = await createOrder(user.idClient, company.idCompany);
      createdId = order.idOrder;
      for (const detail of cart) await createDetail(order.idOrder, detail);
      setCompany(null);
      setChooserOpen(false);
      setCart([]);
      setDraft(blankDetail());
      setNotice(`Pedido #${order.idOrder} creado correctamente.`);
      setPage(1);
      reload();
    } catch (cause) {
      setActionError(`${cause instanceof Error ? cause.message : "No se pudo crear el pedido."}${createdId ? ` El pedido #${createdId} quedó creado; revisa su carga antes de intentarlo de nuevo.` : ""}`);
      if (createdId) reload();
    } finally { setSaving(false); }
  }

  async function replyPrice(accepted: boolean) {
    if (!selected || saving) return;
    setSaving(true); setActionError("");
    try {
      const updated = await respondPrice(selected.idOrder, accepted);
      setSelected(updated);
      setNotice(accepted ? "Cotización aceptada. El pedido continuará sin pago simulado." : "Cotización rechazada.");
      reload();
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : "No se pudo responder a la cotización."); }
    finally { setSaving(false); }
  }

  async function pay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || saving) return;
    setSaving(true); setActionError("");
    const data = new FormData(event.currentTarget);
    try {
      const updated = await simulatePayment(selected.idOrder, {
        method: paymentMethod,
        billingEmail: String(data.get("billingEmail") || "").trim(),
        ...(paymentMethod === "card" ? {
          cardHolderName: String(data.get("cardHolderName") || "").trim(),
          cardNumber: String(data.get("cardNumber") || "").replace(/\s/g, ""),
          expiry: String(data.get("expiry") || "").trim(),
          cvc: String(data.get("cvc") || "").trim(),
        } : { transferReference: String(data.get("transferReference") || "").trim() }),
      });
      setSelected(updated);
      setPaymentOpen(false);
      setNotice("Pago simulado registrado correctamente.");
      reload();
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : "No se pudo registrar el pago."); }
    finally { setSaving(false); }
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const item = selected?.details?.find((detail) => !detail.deletedAt);
    if (!item || !selected || saving) return;
    setSaving(true); setActionError("");
    try {
      await updateDetail(item.idDetails, editDraft);
      const updated = await getOrder(selected.idOrder);
      setSelected(updated);
      setEditMode(false);
      setNotice("Carga actualizada correctamente.");
      reload();
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : "No se pudo actualizar la carga."); }
    finally { setSaving(false); }
  }

  async function removeDetail(id: number) {
    if (!selected || saving) return;
    setSaving(true); setActionError("");
    try {
      await deleteDetail(id);
      setSelected(await getOrder(selected.idOrder));
      setNotice("Carga eliminada del pedido.");
      reload();
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : "No se pudo eliminar la carga."); }
    finally { setSaving(false); }
  }

  async function loadTracking() {
    if (!selected) return;
    setTrackingError("");
    try { setTracking(await getTracking(selected.idOrder)); }
    catch (cause) { setTrackingError(cause instanceof ClientApiError && cause.status === 404 ? "Todavía no hay una ubicación disponible." : cause instanceof Error ? cause.message : "No se pudo consultar la ubicación."); }
  }

  const activeDetails = selected?.details?.filter((detail) => !detail.deletedAt) ?? [];
  const quotedAmount = activeDetails.reduce((sum, detail) => sum + Number(detail.amount || 0), 0);

  return <>
    <PageHeader eyebrow="DE PRINCIPIO A DESTINO" title="Mis pedidos" description="Solicita un envío, revisa cotizaciones y sigue cada carga desde un solo lugar."
      action={<button className={ui.primary} disabled={!user.idClient} onClick={() => { setChooserOpen(true); setCompanyLoading(true); }}><Icon name="plus" size={17} />Nuevo pedido</button>} />
    {!user.idClient && <p className={ui.notice}>Completa tu perfil de cliente para poder crear y consultar pedidos. <Link href="/client/profile">Ir a mi perfil</Link></p>}
    {notice && <p className={ui.notice} role="status">{notice}</p>}
    <section className={ui.card} aria-label="Listado de pedidos">
      <div className={styles.toolbar}><div className={styles.filters} role="group" aria-label="Filtrar pedidos">{orderFilters.map(({ value, label }) => <button key={value} type="button" className={filter === value ? styles.filterActive : ""} onClick={() => { if (filter === value) return; setFilter(value); setPage(1); setLoading(true); }} aria-pressed={filter === value}>{label}</button>)}</div>
        <button className={ui.secondary} onClick={reload} disabled={loading} aria-label="Actualizar pedidos"><Icon name="refresh" size={17} /></button></div>
      {loading || error || orders.length === 0 ? <DataState loading={loading} error={error} empty={filter === "all" ? "Aún no hay pedidos para mostrar." : "No hay pedidos en esta categoría."} onRetry={reload} /> :
        <div className={ui.tableWrap}><table className={ui.table}><thead><tr><th>Pedido</th><th>Empresa</th><th>Estado</th><th>Cargas</th><th>Fecha</th><th>Acción</th></tr></thead><tbody>{orders.map((order) => <tr key={order.idOrder}><td><strong>#{order.idOrder}</strong></td><td>{order.company?.businessName || `Empresa #${order.idCompany}`}</td><td><StatusBadge status={order.status} label={orderStatusLabels[order.status]} /></td><td>{order.details?.filter((item) => !item.deletedAt).length ?? "—"}</td><td>{formatDate(order.createdAt)}</td><td><ActionButton icon="eye" onClick={() => void openOrder(order)}>Ver detalles</ActionButton></td></tr>)}</tbody></table></div>}
      <Pagination page={page} lastPage={lastPage} total={total} perPage={perPage} disabled={loading} onPage={(value) => { setPage(value); setLoading(true); }} onPerPage={(value) => { setPerPage(value); setPage(1); setLoading(true); }} />
    </section>
    {chooserOpen && <Modal title="Elige una empresa" eyebrow="TRAVELDLS · TU ESPACIO" onClose={() => setChooserOpen(false)}>
      <p className={ui.muted}>Encuentra una empresa de transporte para tu pedido.</p>
      <form className={styles.companySearch} onSubmit={(event) => { event.preventDefault(); setCompanyPage(1); setCompanySearch(companyDraft.trim()); setCompanyVersion((value) => value + 1); setCompanyLoading(true); }}><input aria-label="Buscar empresa" placeholder="Buscar empresa…" value={companyDraft} onChange={(event) => setCompanyDraft(event.target.value)} /><button className={ui.secondary}>Buscar</button></form>
      {companyLoading || companyError || companies.length === 0 ? <DataState loading={companyLoading} error={companyError} empty="No se encontraron empresas." onRetry={() => { setCompanyLoading(true); setCompanyVersion((value) => value + 1); }} /> : <div className={styles.companyGrid}>{companies.map((item) => <button key={item.idCompany} className={styles.companyCard} onClick={() => { setCompany(item); setChooserOpen(false); setCart([]); setActionError(""); }}><span><Icon name="building" /></span><strong>{item.businessName}</strong><small>{item.ruc || "Empresa de transporte"}</small><span className={styles.companyArrow}>Solicitar transporte <Icon name="arrow" size={15} /></span></button>)}</div>}
      <div className={styles.companyPager}><button className={ui.secondary} disabled={companyPage <= 1} onClick={() => { setCompanyPage(companyPage - 1); setCompanyLoading(true); }}>Anterior</button><span>{companyPage} / {companyLastPage}</span><button className={ui.secondary} disabled={companyPage >= companyLastPage} onClick={() => { setCompanyPage(companyPage + 1); setCompanyLoading(true); }}>Siguiente</button></div>
    </Modal>}
    {company && <Modal title={`Pedido para ${company.businessName}`} eyebrow="TRAVELDLS · TU ESPACIO" busy={saving} onClose={() => setCompany(null)}>
      <p className={ui.muted}>Agrega una o varias cargas. Podrás revisar cada una antes de enviar tu solicitud.</p>
      <form className={ui.form} onSubmit={addDraft}>
        <DetailFields value={draft} onChange={setDraft} />
        <button className={ui.secondary} type="submit"><Icon name="plus" size={16} />Añadir carga</button>
      </form>
      {cart.length > 0 && <div className={styles.cart}><h3>Cargas del pedido</h3>{cart.map((item, index) => <div key={index} className={styles.cartItem}><div><strong>{item.cargoDescription}</strong><small>{item.unitWeight} kg · {item.deliveryAddress}</small></div><button className={ui.inlineButton} onClick={() => setCart((items) => items.filter((_, position) => position !== index))}>Quitar</button></div>)}</div>}
      {actionError && <p className={ui.error} role="alert">{actionError}</p>}
      <div className={ui.actions}><button className={ui.secondary} disabled={saving} onClick={() => setCompany(null)}>Cancelar</button><button className={ui.primary} disabled={saving || cart.length === 0} onClick={() => void submitOrder()}>{saving ? "Enviando…" : "Enviar pedido"} <Icon name="arrow" size={16} /></button></div>
    </Modal>}
    {selected && <Modal title={`Pedido #${selected.idOrder}`} eyebrow="TRAVELDLS · TU ESPACIO" busy={saving} onClose={() => { setSelected(null); setPaymentOpen(false); setEditMode(false); }}>
      <div className={styles.orderSummary}><StatusBadge status={selected.status} label={orderStatusLabels[selected.status]} /><span>{selected.company?.businessName || `Empresa #${selected.idCompany}`}</span><span>{formatDate(selected.createdAt)}</span></div>
      {detailsLoading ? <DataState loading empty="" /> : <>
        <h3 className={styles.subhead}>Cargas del pedido</h3>
        {activeDetails.length ? activeDetails.map((item) => <div key={item.idDetails} className={styles.detailItem}><div><strong>{item.cargoDescription}</strong><small>{item.unitWeight} · {packagingTypes.find((type) => type.value === item.typePackaging)?.label || item.typePackaging}</small><small>Entrega: {item.deliveryAddress}</small>{item.driver && <small>Conductor: {item.driver.user?.name || item.driver.name || "Asignado"}</small>}</div><strong>{Number(item.amount) > 0 ? formatMoney(Number(item.amount)) : "Por cotizar"}</strong></div>) : <p className={ui.muted}>Este pedido aún no tiene cargas.</p>}
        {quotedAmount > 0 && <p className={styles.total}>Monto del pedido <strong>{formatMoney(quotedAmount)}</strong></p>}
        {selected.status === "pendiente" && activeDetails.length === 1 && <button className={ui.inlineButton} onClick={() => { const item = activeDetails[0]; setEditDraft({ cargoDescription: item.cargoDescription, amount: Number(item.amount), unitWeight: String(Number.parseFloat(item.unitWeight) || 1), deliveryAddress: item.deliveryAddress, typePackaging: item.typePackaging }); setEditMode(true); }}>Editar carga</button>}
        {selected.status === "pendiente" && activeDetails.length > 1 && <p className={ui.muted}>Puedes quitar cargas de un pedido pendiente.</p>}
        {selected.status === "pendiente" && activeDetails.length > 1 && activeDetails.map((item) => <button key={item.idDetails} className={ui.inlineButton} disabled={saving} onClick={() => void removeDetail(item.idDetails)}>Quitar {item.cargoDescription}</button>)}
        {selected.status === "esperando_aprobacion" && <div className={styles.quote}><p>La empresa envió una cotización. Puedes aceptarla sin registrar pago, rechazarla o completar un pago simulado que también aceptará el pedido.</p><div className={ui.actions}><button className={ui.secondary} disabled={saving} onClick={() => void replyPrice(false)}>Rechazar</button><button className={ui.secondary} disabled={saving} onClick={() => void replyPrice(true)}>Aceptar sin pago</button>{quotedAmount > 0 && <button className={ui.primary} disabled={saving} onClick={() => { setActionError(""); setPaymentOpen(true); }}>Pagar y aceptar</button>}</div></div>}
        {selected.payment && <p className={ui.notice}>Pago registrado: {selected.payment.referenceCode}</p>}
        {selected.status === "en_transito" && <div className={styles.quote}><p>Consulta la última ubicación reportada para tu pedido.</p><button className={ui.secondary} onClick={() => void loadTracking()}><Icon name="route" size={16} />Consultar ubicación</button>{trackingError && <p className={ui.error} role="alert">{trackingError}</p>}{tracking && <p>Actualizada el {formatDate(tracking.updatedAt)} · <a href={`https://www.openstreetmap.org/?mlat=${tracking.latitude}&mlon=${tracking.longitude}#map=14/${tracking.latitude}/${tracking.longitude}`} target="_blank" rel="noopener noreferrer">Ver ubicación en el mapa</a></p>}</div>}
      </>}
      {editMode && <form className={ui.form} onSubmit={(event) => void saveEdit(event)}><h3 className={styles.subhead}>Editar carga</h3><DetailFields value={editDraft} onChange={setEditDraft} /><div className={ui.actions}><button type="button" className={ui.secondary} onClick={() => setEditMode(false)}>Cancelar</button><button className={ui.primary} disabled={saving}>Guardar cambios</button></div></form>}
      {paymentOpen && <form className={ui.form} onSubmit={(event) => void pay(event)}><h3 className={styles.subhead}>Pago simulado</h3><p className={ui.muted}>Esta operación registra una simulación en TravelDLS; no realiza un cobro bancario.</p><label className={ui.field}>Método<Select label="Método de pago" value={paymentMethod} options={[{value:"transfer",label:"Transferencia"},{value:"card",label:"Tarjeta"}]} onChange={(value) => setPaymentMethod(value as "card" | "transfer")} /></label><label className={ui.field}>Correo de facturación<input type="email" name="billingEmail" defaultValue={user.email} required /></label>{paymentMethod === "transfer" ? <label className={ui.field}>Referencia de transferencia<input name="transferReference" required minLength={4} maxLength={100} /></label> : <div className={ui.formGrid}><label className={ui.field}>Titular<input name="cardHolderName" required minLength={3} /></label><label className={ui.field}>Número de tarjeta de prueba<input name="cardNumber" inputMode="numeric" required minLength={12} maxLength={23} autoComplete="off" /></label><label className={ui.field}>Vencimiento<input name="expiry" placeholder="MM/AA" required minLength={4} maxLength={5} autoComplete="off" /></label><label className={ui.field}>CVC<input name="cvc" inputMode="numeric" required minLength={3} maxLength={4} autoComplete="off" /></label></div>}<div className={ui.actions}><button type="button" className={ui.secondary} onClick={() => setPaymentOpen(false)}>Cancelar</button><button className={ui.primary} disabled={saving}>{saving ? "Registrando…" : "Confirmar simulación"}</button></div></form>}
      {actionError && <p className={ui.error} role="alert">{actionError}</p>}
      <div className={ui.actions}><button className={ui.secondary} disabled={saving} onClick={() => setSelected(null)}>Cerrar</button></div>
    </Modal>}
  </>;
}

function DetailFields({ value, onChange }: { value: NewDetail; onChange: (value: NewDetail) => void }) {
  const update = <K extends keyof NewDetail>(key: K, next: NewDetail[K]) => onChange({ ...value, [key]: next });
  return <><label className={ui.field}>Descripción de la carga<input value={value.cargoDescription} onChange={(event) => update("cargoDescription", event.target.value)} required minLength={3} maxLength={255} placeholder="Ej. cajas de repuestos" /></label>
    <label className={ui.field}>Peso de la carga (kg)<input type="number" min="0.01" step="any" value={value.unitWeight} onChange={(event) => update("unitWeight", event.target.value)} required placeholder="Ej. 25" /></label>
    <label className={ui.field}>Dirección de entrega<input value={value.deliveryAddress} onChange={(event) => update("deliveryAddress", event.target.value)} required minLength={5} maxLength={255} placeholder="Ciudad, barrio y dirección" /></label>
    <label className={ui.field}>Embalaje<Select label="Tipo de embalaje" value={value.typePackaging} options={packagingTypes} onChange={(next) => update("typePackaging", next)} /></label>
    <label className={ui.field}>Monto estimado de la carga<input type="number" min="0.01" step="0.01" value={value.amount} onChange={(event) => update("amount", Number(event.target.value))} required /><small>La empresa podrá asignar una cotización antes del pago.</small></label>
  </>;
}
