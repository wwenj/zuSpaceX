/// <reference types="jest" />

import { BadRequestException } from "@nestjs/common";
import { AgentSkillRegistry } from "./agent-skill.registry";

describe("AgentSkillRegistry", () => {
  const registry = new AgentSkillRegistry();

  it("应该返回默认 skill", () => {
    const skill = registry.getSkill();

    expect(skill.code).toBe("author_clone");
    expect(skill.systemPrompt).toContain("写作分身");
  });

  it("应该返回指定 skill", () => {
    const skill = registry.getSkill("general_helper");

    expect(skill.code).toBe("general_helper");
  });

  it("未知 skill 应该抛错", () => {
    expect(() => registry.getSkill("unknown_skill")).toThrow(
      BadRequestException,
    );
  });
});
