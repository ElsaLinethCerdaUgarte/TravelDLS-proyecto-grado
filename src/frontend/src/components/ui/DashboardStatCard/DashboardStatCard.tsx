import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon/Icon";
import styles from "./DashboardStatCard.module.css";

type Props = {
  icon: IconName;
  value: string | number;
  label: string;
  hint?: string;
  href?: string;
};

export function DashboardStatCard({ icon, value, label, hint, href }: Props) {
  const content = <>
    <span className={styles.top}>
      <span className={styles.icon}><Icon name={icon} size={20} /></span>
      {href && <Icon name="arrow" size={16} />}
    </span>
    <strong className={styles.value}>{value}</strong>
    <span className={styles.label}>{label}</span>
    {hint && <small className={styles.hint}>{hint}</small>}
  </>;

  return href
    ? <Link href={href} className={styles.card}>{content}</Link>
    : <div className={styles.card}>{content}</div>;
}
