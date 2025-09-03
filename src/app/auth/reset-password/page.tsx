'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [validToken, setValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      validateToken(tokenParam);
    } else {
      setError('Token manquant dans l\'URL');
      setCheckingToken(false);
    }
  }, [searchParams]);

  const validateToken = async (tokenToValidate: string) => {
    try {
      setCheckingToken(true);
      const response = await fetch(`/api/auth/reset-password?token=${tokenToValidate}`);
      const data = await response.json();
      
      if (data.valid) {
        setValidToken(true);
      } else {
        setError('Token invalide ou expiré');
      }
    } catch {
      setError('Erreur lors de la validation du token');
    } finally {
      setCheckingToken(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Mot de passe créé avec succès ! Redirection vers la page de connexion...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || 'Une erreur est survenue');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return React.createElement('div', {
      style: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }
    }, 
      React.createElement('div', {
        style: {
          maxWidth: '400px',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '8px',
          textAlign: 'center'
        }
      }, 'Vérification du token...')
    );
  }

  if (!validToken) {
    return React.createElement('div', {
      style: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }
    }, 
      React.createElement('div', {
        style: {
          maxWidth: '400px',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '8px',
          textAlign: 'center'
        }
      }, [
        React.createElement('h2', { 
          key: 'title',
          style: { color: '#e74c3c', marginBottom: '20px' } 
        }, 'Token invalide'),
        React.createElement('p', { 
          key: 'error',
          style: { color: '#666', marginBottom: '30px' } 
        }, error),
        React.createElement('button', {
          key: 'button',
          onClick: () => router.push('/login'),
          style: {
            padding: '12px 24px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }
        }, 'Retour à la connexion')
      ])
    );
  }

  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }
  }, 
    React.createElement('div', {
      style: {
        maxWidth: '400px',
        width: '100%',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }
    }, [
      React.createElement('h2', {
        key: 'title',
        style: { textAlign: 'center', marginBottom: '30px', color: '#333' }
      }, 'Créer votre mot de passe'),

      message ? React.createElement('div', {
        key: 'message',
        style: {
          padding: '12px',
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          marginBottom: '20px',
          textAlign: 'center'
        }
      }, message) : null,

      error ? React.createElement('div', {
        key: 'error',
        style: {
          padding: '12px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '20px',
          textAlign: 'center'
        }
      }, error) : null,

      React.createElement('form', {
        key: 'form',
        onSubmit: handleSubmit
      }, [
        React.createElement('div', {
          key: 'password-field',
          style: { marginBottom: '20px' }
        }, [
          React.createElement('label', {
            key: 'password-label',
            style: {
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontWeight: '500'
            }
          }, 'Nouveau mot de passe'),
          React.createElement('input', {
            key: 'password-input',
            type: 'password',
            required: true,
            value: password,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
            style: {
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              boxSizing: 'border-box'
            },
            minLength: 8,
            placeholder: 'Au moins 8 caractères'
          })
        ]),

        React.createElement('div', {
          key: 'confirm-field',
          style: { marginBottom: '30px' }
        }, [
          React.createElement('label', {
            key: 'confirm-label',
            style: {
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontWeight: '500'
            }
          }, 'Confirmer le mot de passe'),
          React.createElement('input', {
            key: 'confirm-input',
            type: 'password',
            required: true,
            value: confirmPassword,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value),
            style: {
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              boxSizing: 'border-box'
            },
            minLength: 8,
            placeholder: 'Répétez votre mot de passe'
          })
        ]),

        React.createElement('button', {
          key: 'submit',
          type: 'submit',
          disabled: loading,
          style: {
            width: '100%',
            padding: '14px',
            backgroundColor: loading ? '#95a5a6' : '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer'
          }
        }, loading ? 'Création en cours...' : 'Créer le mot de passe')
      ]),

      React.createElement('div', {
        key: 'info',
        style: {
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#666'
        }
      }, React.createElement('p', { key: 'requirement' }, 'Votre mot de passe doit contenir au minimum 8 caractères.'))
    ])
  );
}

function LoadingFallback() {
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }
  }, 
    React.createElement('div', {
      style: {
        maxWidth: '400px',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '8px',
        textAlign: 'center'
      }
    }, 'Chargement...')
  );
}

export default function ResetPasswordPage() {
  return React.createElement(Suspense, {
    fallback: React.createElement(LoadingFallback, null)
  }, React.createElement(ResetPasswordForm, null));
}
