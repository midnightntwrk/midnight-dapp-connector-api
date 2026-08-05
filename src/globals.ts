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
import type { InitialAPI } from './api.js';

/**
 * Type for the midnight object that holds wallet connector instances.
 * Each wallet registers itself under a unique UUID key.
 */
type MidnightConnectors = {
  [key: string]: InitialAPI;
};

declare global {
  // A single global declaration covers every access pattern: the global `window`
  // is typed `Window & typeof globalThis`, so `window.midnight` resolves through
  // the `globalThis` side — as do `globalThis.midnight` and the bare `midnight`
  // (browser, Node, and test environments alike). A separate `Window` interface
  // augmentation would be redundant.
  var midnight: MidnightConnectors | undefined;
}
