/**
 * Error reporting seam.
 *
 * The API package is deliberately vendor-free: it is written to run on more than
 * one host, so it must not import a monitoring SDK directly. Instead it reports
 * errors through this seam and the host application decides what to do with
 * them (`apps/web` installs a Sentry reporter at its composition root).
 *
 * Reporting is best-effort by contract: a reporter that throws, or no reporter
 * at all, must never change the HTTP response the client receives.
 */

export interface ApiErrorContext {
  /** Request path, e.g. `/api/v1/sessions`. */
  path: string;
  /** HTTP method, e.g. `POST`. */
  method: string;
  /** Route pattern when the router knows it, for grouping. */
  routePath?: string;
}

export type ApiErrorReporter = (error: unknown, context: ApiErrorContext) => void;

let reporter: ApiErrorReporter | null = null;

/**
 * Install the process-wide error reporter. Called once by the host app.
 * Passing `null` removes it, which is what tests use to stay isolated.
 */
export function setApiErrorReporter(next: ApiErrorReporter | null): void {
  reporter = next;
}

/** True when a reporter is installed. */
export function hasApiErrorReporter(): boolean {
  return reporter !== null;
}

/**
 * Hand an error to the installed reporter. Never throws: the caller is already
 * on the failure path and must still be able to build a response.
 */
export function reportApiError(error: unknown, context: ApiErrorContext): void {
  if (!reporter) return;

  try {
    reporter(error, context);
  } catch (reportingFailure) {
    // Losing a monitoring event is bad; turning a 500 into a hang or a crash is
    // worse.
    console.error('API error reporter threw:', reportingFailure);
  }
}
