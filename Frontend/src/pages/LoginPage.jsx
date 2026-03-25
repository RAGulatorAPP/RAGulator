import React from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../authConfig';
import { ShieldAlert, LogIn, ExternalLink } from 'lucide-react';

export default function LoginPage() {
    const { instance } = useMsal();

    const handleLogin = () => {
        instance.loginRedirect(loginRequest).catch(e => {
            console.error(e);
        });
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '48px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', maxWidth: '450px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', marginBottom: '24px' }}>
                    <ShieldAlert size={48} color="#38bdf8" />
                </div>
                <h1 style={{ margin: '0 0 16px', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.5px' }}>RAGulator Enterprise</h1>
                <p style={{ color: '#94a3b8', marginBottom: '32px', lineHeight: '1.6' }}>
                    Plataforma regida por Zero-Trust Security. Por favor, autentique su identidad mediante <b>Microsoft Entra ID</b> para acceder a los dominios RAG y de Administración Forense.
                </p>
                <button 
                    onClick={handleLogin}
                    style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '14px 24px', borderRadius: '12px', fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', width: '100%', transition: 'background 0.2s', boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)' }}
                    onMouseOver={(e) => e.target.style.background = '#2563eb'}
                    onMouseOut={(e) => e.target.style.background = '#3b82f6'}
                >
                    <LogIn size={22} />
                    Iniciar Sesión Corporativo
                </button>

                <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                    <span style={{ fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>O</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                </div>

                <a 
                    href="https://forms.office.com/e/sYJbXPmw7H"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                        marginTop: '24px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px', 
                        padding: '12px', 
                        borderRadius: '12px', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        background: 'rgba(255,255,255,0.02)', 
                        color: '#94a3b8', 
                        textDecoration: 'none', 
                        fontSize: '0.95rem', 
                        fontWeight: 500, 
                        transition: 'all 0.2s',
                        width: 'calc(100% - 24px)'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.color = '#f8fafc';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        e.currentTarget.style.color = '#94a3b8';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    }}
                >
                    <ExternalLink size={18} />
                    Solicitar Acceso
                </a>
            </div>
            <div style={{ position: 'absolute', bottom: '24px', color: '#475569', fontSize: '0.85rem' }}>
                Protegido por Microsoft Identity Web & MSAL React
            </div>
        </div>
    );
}
