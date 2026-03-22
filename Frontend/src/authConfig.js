import { LogLevel } from "@azure/msal-browser";

export const msalConfig = {
    auth: {
        clientId: "825f6989-41ad-4edc-95a9-ef9e28b226da", 
        authority: "https://login.microsoftonline.com/5ac096d7-4048-4d58-9169-9c2e9a7ae698", 
        redirectUri: "http://localhost:5173",
    },
    cache: {
        cacheLocation: "sessionStorage", // Recomendado para SPA
        storeAuthStateInCookie: false,
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) return;
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                }
            }
        }
    }
};

export const loginRequest = {
    // Definimos el Scope para poder solicitarle un Access Token (Bearer) válido para nuestra .NET API
    scopes: ["api://825f6989-41ad-4edc-95a9-ef9e28b226da/access_as_user"]
};
