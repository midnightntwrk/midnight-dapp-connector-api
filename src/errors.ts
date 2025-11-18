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
/**
 * All possible error codes gathered in a single object.
 */
export const ErrorCodes = {
  /** The dapp connector wasn't able to process the request */
  InternalError: 'InternalError',
  /** The user rejected the request */
  Rejected: 'Rejected',
  /** Can be thrown in various circumstances, e.g. one being a malformed transaction */
  InvalidRequest: 'InvalidRequest',
  /** Permission to perform action was rejected. */
  PermissionRejected: 'PermissionRejected',
  /** The connection to the wallet was lost */
  Disconnected: 'Disconnected',
} as const;

/**
 * All possible error codes gathered in a single union type. They are defined in {@link ErrorCodes}.
 */
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * Declaration of the error type thrown by the DApp Connector.
 *
 * It is not a class extending the base `Error` type, because
 * it would make it difficult to implement in a way where `instanceof APIError` would work.
 * Instead a check like `error.type === 'DAppConnectorAPIError'` should be used.
 */
export type APIError = Error & {
  /** indication it is a DApp Connector Error */
  type: 'DAppConnectorAPIError';
  /** The code of the error that's thrown */
  code: ErrorCode;
  /** The reason the error is thrown */
  reason: string;
};
