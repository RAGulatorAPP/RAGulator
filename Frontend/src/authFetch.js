import { loginRequest } from './authConfig';

// Centralizamos la URL del API para que cambie según el entorno (Local vs Production)
const API_BASE_URL = import.meta.env.VITE_API_URL || 
                     (window.location.hostname === 'localhost' 
                        ? 'http://localhost:5165' 
                        : 'https://ragulator.azurewebsites.net');

export const getApiUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;


/**
 * Wrapper around fetch() that automatically injects the MSAL Bearer token.
 * Use this instead of raw fetch() for all API calls to the protected backend.
 * 
 * @param {import("@azure/msal-browser").IPublicClientApplication} msalInstance 
 * @param {string} url 
 * @param {RequestInit} options 
 * @returns {Promise<Response>}
 */
export async function authFetch(msalInstance, url, options = {}) {
    const account = msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0];

    if (!account) {
        throw new Error("No hay cuenta activa en MSAL. Debe iniciar sesión.");
    }

    let tokenResponse;
    try {
        tokenResponse = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account,
        });
    } catch (err) {
        console.warn("Silent token failed, acquiring popup", err);
        tokenResponse = await msalInstance.acquireTokenPopup(loginRequest);
    }

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${tokenResponse.accessToken}`,
    };

    // Don't set Content-Type for FormData (browser sets it with boundary)
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    return fetch(url, { ...options, headers });
}
