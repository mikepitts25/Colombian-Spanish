const SUBSET_PROFILE = 'christmas-subset';

function isSubsetBuild(env = process.env) {
  const profile = env.EAS_BUILD_PROFILE;
  const catalogue = env.COLOMBIAN_SPANISH_CATALOGUE;
  if (catalogue && catalogue !== SUBSET_PROFILE) {
    throw new Error(`Unknown Colombian Spanish build catalogue: ${catalogue}`);
  }
  if (catalogue && profile && profile !== SUBSET_PROFILE) {
    throw new Error(`The ${SUBSET_PROFILE} catalogue conflicts with EAS profile ${profile}.`);
  }
  const subset = catalogue === SUBSET_PROFILE || profile === SUBSET_PROFILE;
  if (subset && env.EAS_BUILD_PLATFORM && env.EAS_BUILD_PLATFORM !== 'ios') {
    throw new Error('The Christmas subset release profile is iOS only.');
  }
  return subset;
}

module.exports = { isSubsetBuild };
