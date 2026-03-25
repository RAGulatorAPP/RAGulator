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

/**
 * Downloads a file from a protected API endpoint using MSAL authentication.
 * 
 * @param {import("@azure/msal-browser").IPublicClientApplication} msalInstance 
 * @param {string} url 
 * @param {string} fileName Optional filename to save as
 */
export async function downloadAuthenticatedFile(msalInstance, url, fileName = null) {
    try {
        const response = await authFetch(msalInstance, url);
        
        if (!response.ok) {
            throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Determinar nombre del archivo si no se provee
        if (!fileName) {
            const contentDisposition = response.headers.get('Content-Disposition');
            if (contentDisposition && contentDisposition.includes('filename=')) {
                fileName = contentDisposition.split('filename=')[1].replace(/["']/g, '');
            } else {
                fileName = url.split('/').pop() || 'downloaded_file';
            }
        }

        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        
        // Limpiar
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error("Error downloading file:", error);
        alert(`Error al descargar el archivo: ${error.message}`);
    }
}
