export function normalizeError(err) {
  if (err.error) {
    if (typeof err.error === 'string') {
      return err.error;
    }
    if (err.error.message) {
      return err.error.message;
    }
  }

  return `Something went wrong, status code ${err.status }`;
}
