export class BaseError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

export const toQueryString = (params) => Object.keys(params)
  // filter out keys for undefined values
  .filter((k) => params[k] !== undefined && params[k] !== null)
  .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
  .join('&');

export const timeout = (t) => new Promise((resolve) => setTimeout(() => resolve(), t));

export const scrollToTop = () => {
  window.scrollTo(0, 0);
  document.body.focus();
};
