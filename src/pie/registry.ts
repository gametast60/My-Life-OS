import type { AIRole, AIRoleId } from "./types";

class AIRoleRegistry {
  private roles: Map<AIRoleId, AIRole> = new Map();

  register(role: AIRole): void {
    this.roles.set(role.id, role);
  }

  get(roleId: AIRoleId): AIRole {
    return this.roles.get(roleId) ?? (this.roles.get("custom") as AIRole);
  }

  getAll(): AIRole[] {
    return Array.from(this.roles.values());
  }

  getByLegacyMode(mode: string): AIRole {
    const match = Array.from(this.roles.values()).find((r) => r.legacyAIMode === mode);
    return match ?? (this.roles.get("custom") as AIRole);
  }

  ids(): AIRoleId[] {
    return Array.from(this.roles.keys()) as AIRoleId[];
  }
}

export const aiRoleRegistry = new AIRoleRegistry();
