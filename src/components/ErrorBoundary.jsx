import { Component } from 'react'

/**
 * Capture les erreurs React non gérées et affiche un écran de secours
 * au lieu d'une page blanche.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // En production, envoyer à Sentry ou équivalent
    console.error('[ErrorBoundary] Erreur non gérée :', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              Une erreur inattendue s'est produite
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              L'application a rencontré un problème. Veuillez recharger la page.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="bg-red-50 text-red-700 text-xs rounded-lg p-3 text-left mb-6 overflow-auto max-h-40">
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Revenir à l'accueil
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
