import { describe, expect, it } from "bun:test";
import {
  account,
  accountRelations,
  addressRelations,
  adminRelations,
  admin,
  eventRelations,
  members,
  membersRelations,
  notification,
  notificationRelations,
  registrationRelations,
  registrations,
  session,
  sessionRelations,
  verification,
} from "@/drizzle/schema";

type RelationConfig = {
  config: (helpers: {
    one: (table: unknown, config: unknown) => unknown;
    many: (table: unknown) => unknown;
  }) => Record<string, unknown>;
};

type IndexedTable = {
  [key: symbol]: ((columns: unknown) => Array<{ config: { name: string } }>) | unknown;
};

type TableWithForeignKeys = {
  [key: symbol]: Array<{ reference: () => unknown; getName: () => string }> | unknown;
};

type TimestampWithUpdate = {
  onUpdateFn: () => Date;
};

const relationHelpers = {
  one: (table: unknown, config: unknown) => ({
    table,
    config,
    withFieldName: (fieldName: string) => ({ fieldName, table, config }),
  }),
  many: (table: unknown) => ({
    table,
    withFieldName: (fieldName: string) => ({ fieldName, table }),
  }),
};

const indexNamesFor = (table: IndexedTable) => {
  const extraConfigBuilder = table[Symbol.for("drizzle:ExtraConfigBuilder")] as
    | ((columns: unknown) => Array<{ config: { name: string } }>)
    | undefined;
  const extraConfigColumns = table[Symbol.for("drizzle:ExtraConfigColumns")];

  return extraConfigBuilder?.(extraConfigColumns).map((index) => index.config.name) ?? [];
};

const foreignKeyNamesFor = (table: TableWithForeignKeys) => {
  const foreignKeys = table[Symbol.for("drizzle:PgInlineForeignKeys")] as Array<{
    getName: () => string;
    reference: () => unknown;
  }>;

  return foreignKeys.map((foreignKey) => {
    foreignKey.reference();
    return foreignKey.getName();
  });
};

describe("Schema metadata", () => {
  it("exports relation configs for domain and auth tables", () => {
    expect((membersRelations as RelationConfig).config(relationHelpers)).toHaveProperty(
      "address",
    );
    expect((addressRelations as RelationConfig).config(relationHelpers)).toHaveProperty(
      "members",
    );
    expect(
      (registrationRelations as RelationConfig).config(relationHelpers),
    ).toHaveProperty("event");
    expect((eventRelations as RelationConfig).config(relationHelpers)).toHaveProperty(
      "registration",
    );
    expect(
      (notificationRelations as RelationConfig).config(relationHelpers),
    ).toEqual(expect.objectContaining({ member: expect.any(Object), registration: expect.any(Object) }));
    expect((adminRelations as RelationConfig).config(relationHelpers)).toEqual(
      expect.objectContaining({ sessions: expect.any(Object), accounts: expect.any(Object) }),
    );
    expect((sessionRelations as RelationConfig).config(relationHelpers)).toHaveProperty(
      "admin",
    );
    expect((accountRelations as RelationConfig).config(relationHelpers)).toHaveProperty(
      "admin",
    );
  });

  it("exports auth table indexes", () => {
    expect(indexNamesFor(session)).toContain("session_userId_idx");
    expect(indexNamesFor(account)).toContain("account_userId_idx");
    expect(indexNamesFor(verification)).toContain("verification_identifier_idx");
  });

  it("exports foreign keys and update timestamp callbacks", () => {
    expect(foreignKeyNamesFor(members)).toContain("members_address_id_addresses_id_fk");
    expect(foreignKeyNamesFor(registrations)).toContain(
      "registrations_event_id_events_id_fk",
    );
    expect(foreignKeyNamesFor(notification)).toEqual(
      expect.arrayContaining([
        "notifications_member_id_members_id_fk",
        "notifications_registration_id_registrations_id_fk",
      ]),
    );
    expect(foreignKeyNamesFor(session)).toContain("session_user_id_admins_id_fk");
    expect(foreignKeyNamesFor(account)).toContain("account_user_id_admins_id_fk");

    expect((admin.updatedAt as TimestampWithUpdate).onUpdateFn()).toBeInstanceOf(Date);
    expect((session.updatedAt as TimestampWithUpdate).onUpdateFn()).toBeInstanceOf(
      Date,
    );
    expect((account.updatedAt as TimestampWithUpdate).onUpdateFn()).toBeInstanceOf(
      Date,
    );
    expect((verification.updatedAt as TimestampWithUpdate).onUpdateFn()).toBeInstanceOf(
      Date,
    );
  });
});
