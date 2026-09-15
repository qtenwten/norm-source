import { Component } from 'react'
import { isRecoverableRouteError, requestFreshRouteReload } from '../routeRecovery'

export default class RouteErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('NORM ROUTE FAILURE', error, info)
    if (isRecoverableRouteError(error)) requestFreshRouteReload('error-boundary')
  }

  componentDidUpdate(prevProps) {
    if (prevProps.routeKey !== this.props.routeKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  reload = () => {
    if (!requestFreshRouteReload('manual-reload')) window.location.reload()
  }

  dashboard = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('__norm_reload')
    url.hash = '#/'
    window.location.replace(url.toString())
  }

  render() {
    if (!this.state.error) return this.props.children
    const chunkFailure = isRecoverableRouteError(this.state.error)
    return (
      <section className="norm-route-failure" role="alert">
        <small>NORM-OS // ROUTE RECOVERY</small>
        <h1>МОДУЛЬ НЕ ОТВЕТИЛ</h1>
        <p>{chunkFailure
          ? 'Локальная оболочка пережила обновление сайта, а запрошенный модуль уже относится к другой сборке. Система может безопасно синхронизировать версию.'
          : 'Внутренний модуль завершился с ошибкой. Вместо пустого экрана NORM-OS остановил переход и сохранил текущую сессию.'}</p>
        <div className="norm-route-failure__code">{String(this.state.error?.message || this.state.error || 'UNKNOWN MODULE FAILURE').slice(0, 240)}</div>
        <div className="norm-route-failure__actions">
          <button type="button" onClick={this.reload}>СИНХРОНИЗИРОВАТЬ СБОРКУ</button>
          <button type="button" onClick={this.dashboard}>ВЕРНУТЬСЯ К СВОДКЕ</button>
        </div>
      </section>
    )
  }
}
