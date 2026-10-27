"use client";
import { useState } from "react";
import { DetailCard } from "@/components/ui/DetailCard/DetailCard";
import { PageHeader, DataState, ActionButton, Modal, StatusBadge, workspaceStyles as w } from "@/components/ui/Workspace/Workspace";
import { TimedNotice } from "@/components/ui/TimedNotice/TimedNotice";
import { useResource } from "../hooks/useResource";
import { api, truckLabels, type Truck } from "../services/operationsApi";
export function AssignedTruck() {
  const resource = useResource<Truck>("/driver/truck");
  const [confirm,setConfirm]=useState(false), [busy,setBusy]=useState(false), [error,setError]=useState(""), [message,setMessage]=useState("");
  const truck = resource.data;
  async function report() {
    setBusy(true); setError("");
    try { await api("/driver/truck/status","PATCH",{status:"mantenimiento"}); setConfirm(false); setMessage("Mantenimiento reportado a tu empresa."); resource.reload(); }
    catch(cause) {setError(cause instanceof Error ? cause.message : "No se pudo reportar.");}
    finally {setBusy(false);}
  }
  return <>
    <PageHeader eyebrow="TU COMPAÑERO DE RUTA" title="Mi camión" description="Consulta tu vehículo asignado e informa si requiere mantenimiento." action={<ActionButton icon="refresh" onClick={resource.reload}>Actualizar</ActionButton>} />
    {message && <TimedNotice message={message} onDismiss={()=>setMessage("")} />}
    {resource.loading || resource.error || !truck ? <DataState loading={resource.loading} error={resource.error} empty="Aún no tienes un camión asignado" onRetry={resource.reload} /> :
      <DetailCard title={truck.plate} eyebrow="VEHÍCULO ASIGNADO" icon="truck" facts={[
        {label:"Estado",value:<StatusBadge status={truck.status} label={truckLabels[truck.status]} />},{label:"Chasis",value:truck.chassis},{label:"Categoría",value:truck.category?.nameCategory || "—"},{label:"Empresa",value:truck.company?.businessName || "—"}
      ]}><ActionButton variant="danger" disabled={["mantenimiento","maintenance"].includes(truck.status)} onClick={()=>setConfirm(true)}>Reportar mantenimiento</ActionButton></DetailCard>}
    {confirm && <Modal title="Reportar mantenimiento" onClose={()=>setConfirm(false)} busy={busy}><p>Tu camión se marcará en mantenimiento. La empresa podrá revisar su disponibilidad.</p>
      {error && <p className={w.error} role="alert">{error}</p>}<div className={w.actions}><ActionButton disabled={busy} onClick={()=>setConfirm(false)}>Volver</ActionButton><ActionButton disabled={busy} variant="danger" onClick={report}>{busy ? "Reportando…" : "Confirmar reporte"}</ActionButton></div></Modal>}
  </>;
}
