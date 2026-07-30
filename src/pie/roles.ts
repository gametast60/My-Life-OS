import type { AIRole, AIRoleId } from "./types";
import { aiRoleRegistry } from "./registry";
import { registerAllRoles } from "./roles/index";

registerAllRoles();

export { aiRoleRegistry };

export function getRole(roleId: AIRoleId): AIRole {
  return aiRoleRegistry.get(roleId);
}

export function getRoleByLegacyMode(mode: string): AIRole {
  return aiRoleRegistry.getByLegacyMode(mode);
}

export const AI_ROLES: Record<AIRoleId, AIRole> = aiRoleRegistry
  .getAll()
  .reduce((acc, r) => {
    (acc as any)[r.id] = r;
    return acc;
  }, {} as Record<AIRoleId, AIRole>);
