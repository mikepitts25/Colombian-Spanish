type ReleaseCatalogue = {
  stockDeckIds: readonly string[];
  stockCardIds: readonly string[];
};

// The scoped Metro build replaces this module with the verified catalogue's stock identities.
export const RELEASE_CATALOGUE: ReleaseCatalogue | undefined = undefined;
