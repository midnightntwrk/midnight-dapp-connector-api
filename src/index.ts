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

// Re-export globals to ensure they're included in type resolution
export * from './globals.js';

export type {
  InitialAPI,
  ConnectedAPI,
  WalletConnectedAPI,
  HintUsage,
  Configuration,
  ExecutionStatus,
  TxStatus,
  HistoryEntry,
  DesiredOutput,
  DesiredInput,
  TokenType,
  SignDataOptions,
  Signature,
  ConnectionStatus,
  KeyMaterialProvider,
  ProvingProvider,
} from './api.js';

export { ErrorCodes } from './errors.js';
export type { ErrorCode, APIError } from './errors.js';
