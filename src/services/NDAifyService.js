/* eslint-disable max-classes-per-file */

import statuses from 'statuses';

import { globalConfig } from '@airtable/blocks';

import { replace } from '../lib/useStateRouter';
import { toQueryString, BaseError } from '../util';

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
          Authorization: sessionToken !== NO_SESSION ? `ApiKey ${sessionToken}` : '',
          'Content-Type': 'application/json',
        },
        payload,
      );
    }

    if (method === DISPATCH_METHOD.POST) {
      response = await post(
        endpoint,
        {
          ...config.headers,
          Authorization: sessionToken !== NO_SESSION ? `ApiKey ${sessionToken}` : '',
          'Content-Type': 'application/json',
        },
        payload,
      );
    }

    if (method === DISPATCH_METHOD.DELETE) {
      response = await del(
        endpoint,
        {
          ...config.headers,
          Authorization: sessionToken !== NO_SESSION ? `ApiKey ${sessionToken}` : '',
          'Content-Type': 'application/json',
        },
        payload,
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

export default class NdaifyService {
  constructor({ ctx, headers } = {}) {
    this.ctx = ctx;
    this.headers = headers;
  }

  getSession() {
    const sessionToken = globalConfig.get('NDAIFY_API_KEY');
    return dispatch(DISPATCH_METHOD.GET, 'sessions', { headers: this.headers })(this.ctx, sessionToken)();
  }

  tryGetSession() {
    const sessionToken = globalConfig.get('NDAIFY_API_KEY');
    return dispatch(DISPATCH_METHOD.GET, 'sessions', { headers: this.headers, noRedirect: true })(this.ctx, sessionToken)();
  }

  createNda(nda) {
    const sessionToken = globalConfig.get('NDAIFY_API_KEY');
    return dispatch(DISPATCH_METHOD.POST, 'ndas', { headers: this.headers })(this.ctx, sessionToken)(nda);
  }

  getNda(ndaId) {
    const sessionToken = globalConfig.get('NDAIFY_API_KEY');
    return dispatch(DISPATCH_METHOD.GET, `ndas/${ndaId}`, { headers: this.headers })(this.ctx, sessionToken)();
  }

  getNdaPreview(ndaId) {
    return dispatch(DISPATCH_METHOD.GET, `ndas/${ndaId}/preview`, { headers: this.headers })(this.ctx, NO_SESSION)();
  }

  getNdas() {
    const sessionToken = globalConfig.get('NDAIFY_API_KEY');
    return dispatch(DISPATCH_METHOD.GET, 'ndas', { headers: this.headers })(this.ctx, sessionToken)();
  }

  acceptNda(ndaId) {
    const sessionToken = globalConfig.get('NDAIFY_API_KEY');
    return dispatch(DISPATCH_METHOD.POST, `ndas/${ndaId}/accept`, { headers: this.headers })(this.ctx, sessionToken)();
  }

  revokeNda(ndaId) {
    const sessionToken = globalConfig.get('NDAIFY_API_KEY');
    return dispatch(DISPATCH_METHOD.POST, `ndas/${ndaId}/revoke`, { headers: this.headers })(this.ctx, sessionToken)();
  }

  declineNda(ndaId) {
    return dispatch(DISPATCH_METHOD.POST, `ndas/${ndaId}/decline`, { headers: this.headers })(this.ctx, NO_SESSION)();
  }

  resendNda(ndaId) {
    const sessionToken = globalConfig.get('NDAIFY_API_KEY');
    return dispatch(DISPATCH_METHOD.POST, `ndas/${ndaId}/resend`, { headers: this.headers })(this.ctx, sessionToken)();
  }

  createPaymentIntent(amount, currency) {
    const sessionToken = globalConfig.get('NDAIFY_API_KEY');
    return dispatch(DISPATCH_METHOD.POST, 'payment-intents', { headers: this.headers })(this.ctx, sessionToken)({
      amount,
      currency,
    });
  }

  getNdaStatistics() {
    return dispatch(DISPATCH_METHOD.GET, 'nda-statistics', { headers: this.headers })(this.ctx, NO_SESSION)();
  }

  getNdaTemplate(owner, repo, ref, path) {
    return dispatch(DISPATCH_METHOD.GET, `nda-templates/${owner}/${repo}/${ref}/${path}`, { headers: this.headers })(this.ctx, NO_SESSION)();
  }

  getOpenApiSpec() {
    return dispatch(DISPATCH_METHOD.GET, 'static/openapi.json', { headers: this.headers })(this.ctx, NO_SESSION)();
  }

  createApiKeys(name) {
    const sessionToken = globalConfig.get('NDAIFY_API_KEY');
    return dispatch(DISPATCH_METHOD.POST, 'api-keys', { headers: this.headers })(this.ctx, sessionToken)({ name });
  }

  getApiKeys() {
    const sessionToken = globalConfig.get('NDAIFY_API_KEY');
    return dispatch(DISPATCH_METHOD.GET, 'api-keys', { headers: this.headers })(this.ctx, sessionToken)();
  }

  deleteApiKey(apiKeyId) {
    const sessionToken = globalConfig.get('NDAIFY_API_KEY');
    return dispatch(DISPATCH_METHOD.DELETE, `api-keys/${apiKeyId}`, { headers: this.headers })(this.ctx, sessionToken)();
  }
}
