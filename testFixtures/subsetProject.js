/* eslint-env node */
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

function createSubsetProject(source = path.resolve(__dirname, '..')) {
  const candidatePath = 'docs/editorial/christmas-c0-candidate.json';
  const approvalPath = 'docs/editorial/christmas-release-approval.json';
  const ledgerPath = 'docs/editorial/review-ledger.json';
  const candidateSource = fs.readFileSync(path.join(source, candidatePath));
  const candidate = JSON.parse(candidateSource);
  const rows = candidate.proposedOffer.freeDecks.flatMap(({ id, cards }) =>
    cards.map((card) => ({ ...card, deckId: id })),
  );
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'christmas-subset-test-')));
  const dispose = () => fs.rmSync(root, { recursive: true, force: true });
  function preparePath(relative) {
    const file = path.join(root, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    return file;
  }
  function writeJson(relative, data) {
    fs.writeFileSync(preparePath(relative), JSON.stringify(data));
  }
  function copy(relative) {
    fs.copyFileSync(path.join(source, relative), preparePath(relative));
  }
  const attestation = {
    reviewer: 'test fixture',
    reviewedAt: '2026-11-25T12:00:00Z',
    evidence: 'Synthetic review in an isolated temporary project.',
  };
  const reviewer = { id: 'fixture editor', kind: 'human' };
  const ledger = {
    schemaVersion: 1,
    records: rows.map(({ deckId, id, version, teachingFingerprint }) => ({
      deckId,
      cardId: id,
      contentVersion: version,
      fingerprint: teachingFingerprint,
      status: 'reviewed',
      reviewer,
      reviewedAt: attestation.reviewedAt,
      note: attestation.evidence,
    })),
  };
  function approve() {
    writeJson(approvalPath, {
      schemaVersion: 1,
      candidateSha256: createHash('sha256').update(candidateSource).digest('hex'),
      offer: attestation,
      pronunciation: attestation,
      distributionRights: attestation,
    });
  }
  try {
    fs.cpSync(path.join(source, 'src'), path.join(root, 'src'), { recursive: true });
    copy(candidatePath);
    for (const asset of [...rows.map((row) => row.audio), ...candidate.audioAndRights.cafeArt]) {
      copy(asset.path);
    }
    writeJson(ledgerPath, ledger);
    writeJson('src/adventures/acceptance.json', {
      schemaVersion: 1,
      records: candidate.visits.map((visit) => ({
        missionId: visit.id,
        contentVersion: visit.version,
        fingerprint: visit.fingerprint,
        status: 'reviewed',
        reviewer,
        reviewedAt: attestation.reviewedAt,
      })),
    });
    return { root, candidate, rows, ledger, ledgerPath, approve, copy, writeJson, dispose };
  } catch (error) {
    dispose();
    throw error;
  }
}

module.exports = { createSubsetProject };
