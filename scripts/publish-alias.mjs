#!/usr/bin/env node
// This file is part of MIDNIGHT-DAPP-CONNECTOR-API.
// Copyright (C) 2025 Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Mirrors the transitional `@midnight-ntwrk/dapp-connector-api` (dashed) alias to
// npmjs during the org migration to `@midnightntwrk`. Stages a copy of the package
// in a temp dir, rewrites the scope in package.json, the README and the compiled
// `dist/**`, prepends a migration banner, then publishes it under the dashed scope.
//
// Auth and provenance come entirely from the environment (NODE_AUTH_TOKEN and/or
// NPM_CONFIG_PROVENANCE, via the .npmrc that actions/setup-node writes), so this
// script is identical whether releasing with a token (now) or OIDC Trusted
// Publishing (later). The canonical `@midnightntwrk` scope is published first by
// `changeset publish` (see .github/workflows/cd.yml); this only mirrors the alias
// afterwards, so it never leads the canonical scope. Versions already on the
// registry are skipped so re-runs are idempotent.
//
// Usage:
//   node scripts/publish-alias.mjs              # dist-tag from changesets pre mode, else `latest`
//   node scripts/publish-alias.mjs --tag canary # force the `canary` dist-tag

import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const SOURCE_SCOPE = '@midnightntwrk/dapp-connector-api';
const ALIAS_SCOPE = '@midnight-ntwrk/dapp-connector-api';

const toAlias = (s) => s.split(SOURCE_SCOPE).join(ALIAS_SCOPE);

// Migration banner prepended to the alias (dashed) package README so the notice is
// visible on npmjs. `primaryName` is the @midnightntwrk target.
const migrationBanner = (primaryName) =>
  [
    '> [!IMPORTANT]',
    '> **This package has moved.** The `@midnight-ntwrk` scope is published only',
    '> during the migration window and will stop receiving updates. Please migrate to',
    `> [\`${primaryName}\`](https://www.npmjs.com/package/${primaryName}).`,
    '',
    '---',
    '',
    '',
  ].join('\n');

const { values } = parseArgs({ options: { tag: { type: 'string' } }, strict: true });

// Resolve the dist-tag once: an explicit --tag wins (the canary flow passes
// --tag canary), otherwise honor changesets pre mode (.changeset/pre.json with
// `mode: "pre"` → its tag, e.g. beta), otherwise undefined so npm publishes under
// `latest`.
const readPreState = () => {
  try {
    return JSON.parse(readFileSync('.changeset/pre.json', 'utf8'));
  } catch {
    return undefined; // No .changeset/pre.json (or unreadable) → not in pre mode.
  }
};

const resolveDistTag = (explicitTag, preState) => {
  if (explicitTag) return explicitTag;
  if (preState?.mode === 'pre' && typeof preState.tag === 'string' && preState.tag.length > 0) {
    return preState.tag;
  }
  return undefined;
};

const distTag = resolveDistTag(values.tag, readPreState());
const tagArgs = distTag ? ['--tag', distTag] : [];

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'));

if (pkg.private) {
  console.log('Root package is private; nothing to publish.');
  process.exit(0);
}

const aliasName = toAlias(pkg.name);

// Under any non-`latest` dist-tag (a canary snapshot or a changesets pre/beta
// release) only mirror prerelease-versioned packages. A prerelease version always
// carries a semver "-"; a canonical version (no "-") must never sit under a
// prerelease dist-tag. Plain `latest` releases resolve no dist-tag so this never
// affects them.
if (distTag && !pkg.version.includes('-')) {
  console.log(`Skip ${pkg.name}@${pkg.version}: not a prerelease version for --tag ${distTag}.`);
  process.exit(0);
}

const isAlreadyPublished = (name, version) => {
  try {
    const out = execFileSync('npm', ['view', name, 'versions', '--json'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const versions = JSON.parse(out);
    return Array.isArray(versions) ? versions.includes(version) : versions === version;
  } catch {
    // Package not on the registry yet — first publish.
    return false;
  }
};

if (isAlreadyPublished(aliasName, pkg.version)) {
  console.log(`Skip ${aliasName}@${pkg.version}: already published.`);
  process.exit(0);
}

// Recursively rewrite the source scope to the dashed alias scope in every text
// file under `dir` that contains it (dist/** is all JS/d.ts/map text).
const rewriteScopeInTree = (dir) => {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      rewriteScopeInTree(full);
      continue;
    }
    const content = readFileSync(full, 'utf8');
    if (content.includes(SOURCE_SCOPE)) {
      writeFileSync(full, toAlias(content));
    }
  }
};

// Directories that must never be copied into the publish staging area (large,
// irrelevant, or would confuse npm). `files` in package.json still decides what
// actually ships, so extra copied files are otherwise harmless.
const EXCLUDE = new Set(['node_modules', '.git', '.yarn', 'docs']);

const stage = mkdtempSync(join(tmpdir(), 'publish-alias-'));
try {
  cpSync(repoRoot, stage, {
    recursive: true,
    filter: (src) => !src.split('/').some((seg) => EXCLUDE.has(seg)),
  });

  const pkgPath = join(stage, 'package.json');
  writeFileSync(pkgPath, toAlias(readFileSync(pkgPath, 'utf8')));
  rewriteScopeInTree(join(stage, 'dist'));

  // Rewrite the README body to the dashed scope (so examples match the installed
  // package) and prepend a migration banner pointing at the @midnightntwrk target.
  // npm ships README.md even when `files` omits it.
  const readmePath = join(stage, 'README.md');
  const readmeBody = existsSync(readmePath) ? toAlias(readFileSync(readmePath, 'utf8')) : '';
  writeFileSync(readmePath, migrationBanner(pkg.name) + readmeBody);

  console.log(`Publishing ${aliasName}@${pkg.version} (alias)${distTag ? ` (dist-tag: ${distTag})` : ''}...`);
  execFileSync('npm', ['publish', '--access', 'public', ...tagArgs], {
    cwd: stage,
    stdio: 'inherit',
  });
  console.log('Alias published.');
} finally {
  rmSync(stage, { recursive: true, force: true });
}
