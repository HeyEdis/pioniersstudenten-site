import { pioneerLabel } from "@/drizzle/schema";

export const makeRegistrationFixture = (
  overrides: Partial<{
    event_id: number;
    firstname: string;
    lastname: string;
    email: string;
    phonenumber: string;
    label: (typeof pioneerLabel.enumValues)[number];
  }> = {},
) => {
  const uniqueId = crypto.randomUUID().slice(0, 8);

  return {
    event_id: 1,
    firstname: "Marie",
    lastname: "Peeters",
    email: `marie.peeters.${uniqueId}@example.com`,
    phonenumber: `0470${uniqueId.slice(0, 6)}`,
    label: pioneerLabel.enumValues[0],
    ...overrides,
  };
};
