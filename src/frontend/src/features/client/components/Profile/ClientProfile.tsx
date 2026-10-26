"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon/Icon";
import { Select } from "@/components/ui/Select/Select";
import { useClientSession } from "../ClientShell/ClientShell";
import { DataState, PageHeader, workspaceStyles as ui } from "@/components/ui/Workspace/Workspace";
import { getProfile, saveProfile } from "../../services/clientApi";
import type { ClientProfile as ClientProfileData } from "../../types/client";
import styles from "./ClientProfile.module.css";

export function ClientProfile() {
  const { user, refresh } = useClientSession();
  const [profile, setProfile] = useState<ClientProfileData | null>(null);
  const [loading, setLoading] = useState(Boolean(user.idClient));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(0);
  const [typeClient, setTypeClient] = useState<"legal" | "natural">("natural");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user.idClient) return;
    const controller = new AbortController();
    getProfile(user.idClient, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      setProfile(result);
      setTypeClient(result.typeClient);
      setLoading(false);
      setError("");
    }).catch((cause) => {
      if (controller.signal.aborted) return;
      setError(cause instanceof Error ? cause.message : "No pudimos cargar tu perfil.");
      setLoading(false);
    });
    return () => controller.abort();
  }, [user.idClient, version]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (file && file.size > 2 * 1024 * 1024) { setError("La fotografía debe pesar 2 MB o menos."); return; }
    const fields = new FormData(event.currentTarget);
    const payload = new FormData();
    payload.set("userId", String(user.idUser));
    payload.set("companyName", String(fields.get("companyName") || "").trim());
    payload.set("ruc", String(fields.get("ruc") || "").trim());
    payload.set("address", String(fields.get("address") || "").trim());
    payload.set("typeClient", typeClient);
    if (file) payload.set("photo", file);
    setBusy(true); setError(""); setNotice("");
    try {
      const saved = await saveProfile(user.idClient, payload);
      setProfile(saved);
      setFile(null);
      await refresh();
      setNotice("Tu perfil se guardó correctamente.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo guardar tu perfil."); }
    finally { setBusy(false); }
  }

  return <>
    <PageHeader eyebrow="TU INFORMACIÓN EN ORDEN" title="Mi perfil" description="Mantén al día los datos con los que solicitas tus envíos." />
    {notice && <p className={ui.notice} role="status">{notice}</p>}
    {loading ? <div className={ui.card}><DataState loading empty="" /></div> : error && user.idClient && !profile ? <div className={ui.card}><DataState error={error} empty="" onRetry={() => { setLoading(true); setVersion((value) => value + 1); }} /></div> :
      <div className={styles.layout}>
        <aside className={`${ui.card} ${styles.identity}`}>
          <div className={styles.photo}>{profile?.photoUrl ? <Image src={profile.photoUrl} alt="Foto del perfil" width={110} height={110} unoptimized /> : <Icon name="user" size={40} />}</div>
          <h2>{profile?.companyName || user.name}</h2>
          <p>{user.email}</p>
          <span className={styles.role}>{profile?.typeClient === "legal" ? "Persona jurídica" : profile?.typeClient === "natural" ? "Persona natural" : "Nuevo perfil"}</span>
          {!user.idClient && <p className={styles.prompt}>Completa tu perfil para comenzar a crear pedidos.</p>}
        </aside>
        <section className={`${ui.card} ${ui.cardPad}`} aria-labelledby="profile-form-title">
          <div className={styles.formHeading}><div><h2 id="profile-form-title">Datos del cliente</h2><p>Esta información identifica tus solicitudes de transporte.</p></div><Icon name="shield" size={23} /></div>
          <form key={profile?.idClient ?? "new"} className={ui.form} onSubmit={(event) => void save(event)}>
            <div className={ui.formGrid}><label className={ui.field}>Nombre o razón social<input name="companyName" defaultValue={profile?.companyName || user.name} maxLength={255} required /></label><label className={ui.field}>Tipo de persona<Select label="Tipo de persona" value={typeClient} options={[{value:"natural",label:"Persona natural"},{value:"legal",label:"Persona jurídica"}]} onChange={(value) => setTypeClient(value as "legal" | "natural")} /></label></div>
            <div className={ui.formGrid}><label className={ui.field}>Identificación o RUC<input name="ruc" defaultValue={profile?.ruc || ""} maxLength={20} required /></label><label className={ui.field}>Fotografía<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const selected = event.target.files?.[0] || null; setFile(selected); }} /><small>JPG, PNG o WebP; máximo 2 MB.</small></label></div>
            <label className={ui.field}>Dirección<input name="address" defaultValue={profile?.address || ""} required /></label>
            <div className={styles.readonly}><div><span>Correo de acceso</span><strong>{user.email}</strong></div><div><span>Nombre de la cuenta</span><strong>{user.name}</strong></div></div>
            {error && <p className={ui.error} role="alert">{error}</p>}
            <div className={ui.actions}><button className={ui.primary} disabled={busy}>{busy ? "Guardando…" : profile ? "Guardar cambios" : "Crear mi perfil"}</button></div>
          </form>
        </section>
      </div>}
  </>;
}
