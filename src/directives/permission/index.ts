import type { App } from 'vue'
import { hasPermi, hasAnyPermi, hasNoPermi, hasRole } from './hasPermi'

export default {
  install(app: App) {
    app.directive('hasPermi', hasPermi)
    app.directive('hasAnyPermi', hasAnyPermi)
    app.directive('hasNoPermi', hasNoPermi)
    app.directive('hasRole', hasRole)
  }
}

export {
  hasPermi,
  hasAnyPermi,
  hasNoPermi,
  hasRole
}
