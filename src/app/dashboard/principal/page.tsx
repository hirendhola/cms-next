import { requireRole } from "@/lib/requireRole";

export default async function PrincipalDashboard() {
  await requireRole(["PRINCIPAL"]);

  return <div>Principal Dashboard Content</div>;
}
