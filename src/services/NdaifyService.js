/* eslint-disable max-classes-per-file */

import statuses from 'statuses';
import { queryCache, queryCaches } from 'react-query';

import { globalConfig } from '@airtable/blocks';

import { replace } from '../lib/useStateRouter';
import { toQueryString, BaseError } from '../util';
import getTemplateIdParts from '../utils/getTemplateIdParts';

export class NdaifyServiceError extends BaseError {
  constructor(message = 'NDAify Endpoint Error', statusCode, data) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
  }
}

export class InvalidSessionError extends NdaifyServiceError {
  constructor(message = 'Invalid session token', statusCode, data) {
    super(message, statusCode, data);
  }
}

class FetchError extends NdaifyServiceError {
  constructor(message = 'Fetch failed', statusCode, data) {
    super(message, statusCode, data);
  }
}

class EntityNotFoundError extends NdaifyServiceError {
  constructor(message = 'Entity does not exist', statusCode, data) {
    super(message, statusCode, data);
  }
}

class ForbiddenError extends NdaifyServiceError {
  constructor(message = 'Action not allowed', statusCode, data) {
    super(message, statusCode, data);
  }
}

class RequestError extends NdaifyServiceError {
  constructor(message = 'Bad Request', statusCode, data) {
    super(message, statusCode, data);
  }
}

const NDAIFY_ENDPOINT_URL = 'https://api.ndaify.com';

const NO_SESSION = Symbol('No Session');

const DISPATCH_METHOD = {
  GET: 'GET',
  POST: 'POST',
  XHR_PUT: 'XHR_PUT',
  DELETE: 'DELETE',
};

const AUTHENTICATION_SCHEME = 'ApiKey';

const redirect = (to) => {
  replace(to);
};

const normalizeUrl = (endpoint) => {
  if (endpoint.startsWith('http')) {
    return endpoint;
  }

  return `${NDAIFY_ENDPOINT_URL}/${endpoint}`;
};

const get = (endpoint, headers, payload = {}, config = {}) => {
  let qs = toQueryString(payload);
  if (qs) {
    qs = `?${qs}`;
  }

  return fetch(`${normalizeUrl(endpoint)}${qs}`, {
    method: 'GET',
    headers,
    signal: config.signal,
  });
};

const post = (endpoint, headers, payload, config = {}) => fetch(normalizeUrl(endpoint), {
  method: 'POST',
  headers,
  body: JSON.stringify(payload),
  signal: config.signal,
});

const del = (endpoint, headers, payload, config = {}) => fetch(normalizeUrl(endpoint), {
  method: 'DELETE',
  headers,
  body: JSON.stringify(payload),
  signal: config.signal,
});

const dispatch = (
  method,
  endpoint,
  config = {},
) => (ctx, sessionToken) => async (payload) => {
  if (!sessionToken) {
    if (!config.noRedirect) {
      redirect('sessionError');
    }

    throw new InvalidSessionError('Missing sessionToken', statuses('Unauthorized'));
  }

  let response;

  try {
    if (method === DISPATCH_METHOD.GET) {
      response = await get(
        endpoint,
        {
          ...config.headers,
          Authorization: sessionToken !== NO_SESSION ? `${AUTHENTICATION_SCHEME} ${sessionToken}` : '',
          'Content-Type': 'application/json',
        },
        payload,
        {
          signal: config.abortController?.signal,
        },
      );
    }

    if (method === DISPATCH_METHOD.POST) {
      response = await post(
        endpoint,
        {
          ...config.headers,
          Authorization: sessionToken !== NO_SESSION ? `${AUTHENTICATION_SCHEME} ${sessionToken}` : '',
          'Content-Type': 'application/json',
        },
        payload,
        {
          signal: config.abortController?.signal,
        },
      );
    }

    if (method === DISPATCH_METHOD.DELETE) {
      response = await del(
        endpoint,
        {
          ...config.headers,
          Authorization: sessionToken !== NO_SESSION ? `${AUTHENTICATION_SCHEME} ${sessionToken}` : '',
          'Content-Type': 'application/json',
        },
        payload,
        {
          signal: config.abortController?.signal,
        },
      );
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    throw new FetchError('Service Unavailable', statuses('Service Unavailable'));
  }

  let data;
  try {
    data = await response.json();
    // eslint-disable-next-line
  } catch (error) {}

  if (
    response.status !== statuses('OK')
      && response.status !== statuses('Created')
      && response.status !== statuses('Accepted')
  ) {
    if (response.status === statuses('Unauthorized')) {
      if (!config.noRedirect) {
        redirect('sessionError');
      }

      throw new InvalidSessionError(data?.errorMessage, response.status, data);
    }

    if (response.status === statuses('Forbidden')) {
      throw new ForbiddenError(data?.errorMessage, response.status, data);
    }

    if (response.status === statuses('Not Found')) {
      throw new EntityNotFoundError(data?.errorMessage, response.status, data);
    }

    if (response.status === statuses('Bad Request')) {
      throw new RequestError(data?.errorMessage, response.status, data);
    }

    throw new NdaifyServiceError('Oops! Something went wrong. Try again later.', response.status, data);
  }

  return data;
};

class AirtablePlatformService {
  constructor({
    ctx,
    headers,
    abortController,
  } = {}) {
    this.ctx = ctx;
    this.headers = headers;
    this.abortController = abortController;
  }

  // eslint-disable-next-line class-methods-use-this
  getSessionToken() {
    const sessionToken = globalConfig.get('NDAIFY_API_KEY');
    return sessionToken;
  }

  // eslint-disable-next-line class-methods-use-this
  async endSession() {
    queryCaches.forEach((cache) => cache.clear());
  }
}

export default class NdaifyService extends AirtablePlatformService {
  static withCache = (queryKey, hit, miss) => {
    const data = queryCache.getQueryData(queryKey);

    if (data) {
      return hit(queryKey, data);
    }

    return miss(queryKey);
  };

  getSession() {
    const sessionToken = this.getSessionToken();
    return dispatch(DISPATCH_METHOD.GET, 'sessions', { abortController: this.abortController, headers: this.headers })(this.ctx, sessionToken)();
  }

  tryGetSession() {
    const sessionToken = this.getSessionToken();
    return dispatch(DISPATCH_METHOD.GET, 'sessions', { abortController: this.abortController, headers: this.headers, noRedirect: true })(this.ctx, sessionToken)();
  }

  createNda(nda) {
    const sessionToken = this.getSessionToken();
    return dispatch(DISPATCH_METHOD.POST, 'ndas', { abortController: this.abortController, headers: this.headers })(this.ctx, sessionToken)(nda);
  }

  getNda(ndaId) {
    const sessionToken = this.getSessionToken();
    return dispatch(DISPATCH_METHOD.GET, `ndas/${ndaId}`, { abortController: this.abortController, headers: this.headers })(this.ctx, sessionToken)();
  }

  getNdaPreview(ndaId) {
    return dispatch(DISPATCH_METHOD.GET, `ndas/${ndaId}/preview`, { abortController: this.abortController, headers: this.headers })(this.ctx, NO_SESSION)();
  }

  getNdas() {
    const sessionToken = this.getSessionToken();
    return dispatch(DISPATCH_METHOD.GET, 'ndas', { abortController: this.abortController, headers: this.headers })(this.ctx, sessionToken)();
  }

  acceptNda(ndaId) {
    const sessionToken = this.getSessionToken();
    return dispatch(DISPATCH_METHOD.POST, `ndas/${ndaId}/accept`, { abortController: this.abortController, headers: this.headers })(this.ctx, sessionToken)();
  }

  revokeNda(ndaId) {
    const sessionToken = this.getSessionToken();
    return dispatch(DISPATCH_METHOD.POST, `ndas/${ndaId}/revoke`, { abortController: this.abortController, headers: this.headers })(this.ctx, sessionToken)();
  }

  declineNda(ndaId) {
    return dispatch(DISPATCH_METHOD.POST, `ndas/${ndaId}/decline`, { abortController: this.abortController, headers: this.headers })(this.ctx, NO_SESSION)();
  }

  resendNda(ndaId) {
    const sessionToken = this.getSessionToken();
    return dispatch(DISPATCH_METHOD.POST, `ndas/${ndaId}/resend`, { abortController: this.abortController, headers: this.headers })(this.ctx, sessionToken)();
  }

  createPaymentIntent(amount, currency) {
    const sessionToken = this.getSessionToken();
    return dispatch(DISPATCH_METHOD.POST, 'payment-intents', { abortController: this.abortController, headers: this.headers })(this.ctx, sessionToken)({
      amount,
      currency,
    });
  }

  getNdaStatistics() {
    return dispatch(DISPATCH_METHOD.GET, 'nda-statistics', { abortController: this.abortController, headers: this.headers })(this.ctx, NO_SESSION)();
  }

  getNdaTemplate(ndaTemplateId) {
    const {
      owner, repo, ref, path,
    } = getTemplateIdParts(ndaTemplateId);

    return dispatch(DISPATCH_METHOD.GET, `nda-templates/${owner}/${repo}/${ref}/${path}`, { abortController: this.abortController, headers: this.headers })(this.ctx, NO_SESSION)();
  }

  getOpenApiSpec() {
    return dispatch(DISPATCH_METHOD.GET, 'static/openapi.json', { abortController: this.abortController, headers: this.headers })(this.ctx, NO_SESSION)();
  }

  createApiKey(name) {
    const sessionToken = this.getSessionToken();
    return dispatch(DISPATCH_METHOD.POST, 'api-keys', { abortController: this.abortController, headers: this.headers })(this.ctx, sessionToken)({ name });
  }

  getApiKeys() {
    const sessionToken = this.getSessionToken();
    return dispatch(DISPATCH_METHOD.GET, 'api-keys', { abortController: this.abortController, headers: this.headers })(this.ctx, sessionToken)();
  }

  deleteApiKey(apiKeyId) {
    const sessionToken = this.getSessionToken();
    return dispatch(DISPATCH_METHOD.DELETE, `api-keys/${apiKeyId}`, { abortController: this.abortController, headers: this.headers })(this.ctx, sessionToken)();
  }
}
