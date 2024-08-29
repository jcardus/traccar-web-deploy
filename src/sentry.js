import * as Sentry from "@sentry/react";
Sentry.init({
    dsn: "https://bad6baf4fb2072316e0edf5a1a15e994@o4507747429974016.ingest.us.sentry.io/4507857547231232",
    integrations: [
        Sentry.browserTracingIntegration()
    ],
    tracesSampleRate: 1.0,
    tracePropagationTargets: ["localhost", /^https:\/\/web.rastreosat.com.br\/api/]
});
