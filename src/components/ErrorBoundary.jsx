import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__inner">
            <span className="error-boundary__icon">⚠️</span>
            <h2 className="error-boundary__title">Бир нерсе туура эмес болуп кетти</h2>
            <p className="error-boundary__msg">{this.state.error?.message}</p>
            <button
              className="btn-gold"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Кайра аракет кыл
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
